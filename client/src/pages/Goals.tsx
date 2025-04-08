import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Trash2, 
  Edit, 
  Link, 
  ChevronRight, 
  Plus, 
  Calendar, 
  ClipboardList,
  Repeat,
  TrendingUp, 
  Star, 
  MoreVertical,
  BarChart4,
  Target,
  Clock,
  Check,
  AlertCircle,
  DollarSign
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { 
  Goal, 
  Milestone, 
  Task, 
  Habit, 
  FinancialGoal,
  InsertGoal 
} from "@shared/schema";

// Bar chart component for visualizing goals progress
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

// Define goal categories
const GOAL_CATEGORIES = [
  { value: 'personal', label: 'Personal', color: '#3B82F6', icon: <Star className="h-4 w-4" /> },
  { value: 'professional', label: 'Professional', color: '#10B981', icon: <TrendingUp className="h-4 w-4" /> },
  { value: 'health', label: 'Health', color: '#EF4444', icon: <ClipboardList className="h-4 w-4" /> },
  { value: 'financial', label: 'Financial', color: '#F59E0B', icon: <DollarSign className="h-4 w-4" /> },
  { value: 'education', label: 'Education', color: '#8B5CF6', icon: <ClipboardList className="h-4 w-4" /> },
  { value: 'spiritual', label: 'Spiritual', color: '#EC4899', icon: <Star className="h-4 w-4" /> },
  { value: 'other', label: 'Other', color: '#6B7280', icon: <ClipboardList className="h-4 w-4" /> },
];

// Updated interface for goals with additional fields
interface EnhancedGoal extends Omit<Goal, 'description' | 'progress' | 'category' | 'linkedTasks' | 'linkedHabits' | 'financialGoalId' | 'color' | 'icon'> {
  description: string | null;
  category: string | null;
  linkedTasks: number[] | null;
  linkedHabits: number[] | null;
  financialGoalId: number | null;
  color: string | null;
  icon: string | null;
  progress: string;
}

// Helper function to get progress as a number
const getProgressNumber = (goal: EnhancedGoal): number => {
  return typeof goal.progress === 'string' ? parseFloat(goal.progress) : 0;
};

// Interface for goal form
interface GoalFormData {
  title: string;
  description: string;
  targetDate: string;
  category: string;
  milestonesText: string;
  linkedTasks: number[];
  linkedHabits: number[];
  financialGoalId?: number;
  color: string;
}

const Goals = () => {
  const { toast } = useToast();
  // Fetch data from API
  const { data: goals = [], isLoading: isLoadingGoals } = useQuery({
    queryKey: ['/api/goals'],
    queryFn: async () => {
      return await apiRequest<EnhancedGoal[]>('/api/goals');
    }
  });
  
  const { data: tasks = [] } = useQuery({
    queryKey: ['/api/tasks'],
    queryFn: async () => {
      return await apiRequest<Task[]>('/api/tasks');
    }
  });
  
  const { data: habits = [] } = useQuery({
    queryKey: ['/api/habits'],
    queryFn: async () => {
      return await apiRequest<Habit[]>('/api/habits');
    }
  });
  
  const { data: finances } = useQuery({
    queryKey: ['/api/finances'],
    queryFn: async () => {
      return await apiRequest<any>('/api/finances');
    }
  });
  
  // Get financial goals from finances data
  const financialGoals = finances?.financialGoals || [];
  
  // Initial form state
  const initialFormState: GoalFormData = {
    title: "",
    description: "",
    targetDate: "",
    category: "personal",
    milestonesText: "",
    linkedTasks: [],
    linkedHabits: [],
    financialGoalId: undefined,
    color: "#3B82F6"
  };
  
  // State management
  const [formData, setFormData] = useState<GoalFormData>(initialFormState);
  const [isEditing, setIsEditing] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "kanban" | "timeline" | "stats">("list");
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [selectedGoalForLinking, setSelectedGoalForLinking] = useState<EnhancedGoal | null>(null);
  
  // Mutations
  const createGoalMutation = useMutation({
    mutationFn: async (goal: InsertGoal) => {
      return await apiRequest<Goal>('/api/goals', {
        method: 'POST',
        body: JSON.stringify(goal)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      toast({
        title: "Goal created",
        description: "Your goal has been successfully created."
      });
      resetForm();
    }
  });
  
  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, goal }: { id: number, goal: Partial<InsertGoal> }) => {
      return await apiRequest<Goal>(`/api/goals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(goal)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      toast({
        title: "Goal updated",
        description: "Your goal has been successfully updated."
      });
      setIsEditing(false);
      setEditingGoalId(null);
      resetForm();
    }
  });
  
  const deleteGoalMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/goals/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      toast({
        title: "Goal deleted",
        description: "Your goal has been successfully deleted."
      });
    }
  });
  
  const updateMilestoneMutation = useMutation({
    mutationFn: async ({ goalId, updatedGoal }: { goalId: number, updatedGoal: Partial<Goal> }) => {
      return await apiRequest<Goal>(`/api/goals/${goalId}`, {
        method: 'PUT',
        body: JSON.stringify(updatedGoal)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
    }
  });
  
  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const resetForm = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setEditingGoalId(null);
  };
  
  // Submit handler for creating or updating a goal
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse milestones from text
    const milestones: Milestone[] = formData.milestonesText
      .split('\n')
      .filter(text => text.trim() !== '')
      .map((text, index) => ({
        id: Date.now() + index,
        text: text.trim(),
        completed: false
      }));
    
    const goalData = {
      title: formData.title,
      description: formData.description,
      targetDate: formData.targetDate,
      milestones: milestones,
      progress: "0", // Store as string to match database
      userId: 1, // We'll get this from auth context in the future
      category: formData.category,
      linkedTasks: formData.linkedTasks,
      linkedHabits: formData.linkedHabits,
      financialGoalId: formData.financialGoalId,
      color: formData.color
    };
    
    if (isEditing && editingGoalId) {
      updateGoalMutation.mutate({ id: editingGoalId, goal: goalData });
    } else {
      createGoalMutation.mutate(goalData as InsertGoal);
    }
  };
  
  // Edit goal handler
  const handleEditGoal = (goal: EnhancedGoal) => {
    // Create milestones text from existing milestones
    const milestonesText = goal.milestones.map(m => m.text).join('\n');
    
    setFormData({
      title: goal.title,
      description: goal.description || "",
      targetDate: goal.targetDate,
      category: goal.category || "personal",
      milestonesText: milestonesText,
      linkedTasks: goal.linkedTasks || [],
      linkedHabits: goal.linkedHabits || [],
      financialGoalId: goal.financialGoalId || undefined,
      color: goal.color || "#3B82F6"
    });
    
    setIsEditing(true);
    setEditingGoalId(goal.id);
  };
  
  // Delete goal handler
  const handleDeleteGoal = (id: number) => {
    deleteGoalMutation.mutate(id);
  };
  
  // Update milestone completion status
  const updateMilestoneStatus = (goalId: number, milestoneId: number, completed: boolean) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    
    const updatedMilestones = goal.milestones.map(milestone => 
      milestone.id === milestoneId ? { ...milestone, completed } : milestone
    );
    
    const totalMilestones = updatedMilestones.length;
    const completedCount = updatedMilestones.filter(m => m.completed).length;
    const progressNum = totalMilestones > 0 ? (completedCount / totalMilestones) * 100 : 0;
    const progress = progressNum.toString(); // Convert to string for database
    
    updateMilestoneMutation.mutate({ 
      goalId, 
      updatedGoal: {
        milestones: updatedMilestones,
        progress
      }
    });
  };
  
  // Filter goals based on selected tab
  const filteredGoals = goals.filter(goal => {
    const progressNum = getProgressNumber(goal);
    if (selectedTab === 'all') return true;
    if (selectedTab === 'inProgress') return progressNum > 0 && progressNum < 100;
    if (selectedTab === 'completed') return progressNum === 100;
    if (selectedTab === 'notStarted') return progressNum === 0;
    if (selectedTab === 'financial') return goal.financialGoalId !== undefined;
    return goal.category === selectedTab;
  });
  
  // Prepare data for charts
  const goalProgressData = goals.map(goal => ({
    name: goal.title.length > 20 ? goal.title.substring(0, 20) + '...' : goal.title,
    progress: Math.round(getProgressNumber(goal)),
    category: goal.category || 'personal',
    color: goal.color || '#3B82F6',
    targetDate: goal.targetDate,
    id: goal.id
  }));
  
  // Chart data for goal category distribution
  const categoryDistribution = GOAL_CATEGORIES.map(category => {
    const count = goals.filter(g => g.category === category.value).length;
    return {
      name: category.label,
      value: count,
      color: category.color
    };
  }).filter(cat => cat.value > 0);
  
  // Date formatting utility
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };
  
  // Handle linking tasks or habits to a goal
  const handleLinkToGoal = (goal: EnhancedGoal) => {
    setSelectedGoalForLinking(goal);
    setIsLinkDialogOpen(true);
  };
  
  // Save linked items
  const saveLinkChanges = () => {
    if (!selectedGoalForLinking) return;
    
    updateGoalMutation.mutate({
      id: selectedGoalForLinking.id,
      goal: {
        linkedTasks: formData.linkedTasks,
        linkedHabits: formData.linkedHabits
      }
    });
    
    setIsLinkDialogOpen(false);
    setSelectedGoalForLinking(null);
  };
  
  // Update form when selected goal for linking changes
  useEffect(() => {
    if (selectedGoalForLinking) {
      setFormData(prev => ({
        ...prev,
        linkedTasks: selectedGoalForLinking.linkedTasks || [],
        linkedHabits: selectedGoalForLinking.linkedHabits || []
      }));
    }
  }, [selectedGoalForLinking]);
  
  // Loading state
  if (isLoadingGoals) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full mb-2"></div>
          <p className="text-muted-foreground">Loading your goals...</p>
        </div>
      </div>
    );
  }
  
  // Get linked tasks and habits for a goal
  const getLinkedTasks = (goalId: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal || !goal.linkedTasks) return [];
    return tasks.filter(task => goal.linkedTasks?.includes(task.id));
  };
  
  const getLinkedHabits = (goalId: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal || !goal.linkedHabits) return [];
    return habits.filter(habit => goal.linkedHabits?.includes(habit.id));
  };
  
  // Get linked financial goal for a goal
  const getLinkedFinancialGoal = (goalId: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal || !goal.financialGoalId) return null;
    return financialGoals.find((fg: any) => fg.id === goal.financialGoalId);
  };
  
  return (
    <div className="space-y-6 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Goals</h2>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Select value={viewMode} onValueChange={(value: "list" | "kanban" | "timeline" | "stats") => setViewMode(value)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="View Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="list">List View</SelectItem>
              <SelectItem value="kanban">Kanban View</SelectItem>
              <SelectItem value="timeline">Timeline</SelectItem>
              <SelectItem value="stats">Statistics</SelectItem>
            </SelectContent>
          </Select>
          
          {viewMode !== "stats" && (
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full sm:w-auto">
              <TabsList className="grid grid-cols-3 sm:grid-cols-5 w-full sm:w-auto">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="inProgress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="notStarted">Not Started</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>
      </div>
      
      {/* Add/Edit Goal Form */}
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Goal' : 'Add New Goal'}</CardTitle>
          <CardDescription>
            Set clear, specific goals and track your progress with milestones.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Goal Title</Label>
                <Input 
                  id="title" 
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="What do you want to achieve?"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="targetDate">Target Date</Label>
                <Input 
                  id="targetDate" 
                  name="targetDate"
                  type="date"
                  value={formData.targetDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleSelectChange("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {GOAL_CATEGORIES.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: category.color }}
                          ></div>
                          {category.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex gap-2 items-center">
                  <div 
                    className="w-6 h-6 rounded-full border border-border" 
                    style={{ backgroundColor: formData.color }}
                  ></div>
                  <Input 
                    id="color" 
                    name="color"
                    type="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="w-full h-10"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                name="description"
                rows={2}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your goal in detail"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="milestonesText">Milestones (one per line)</Label>
              <Textarea 
                id="milestonesText"
                name="milestonesText"
                rows={3}
                value={formData.milestonesText}
                onChange={handleInputChange}
                placeholder="Break down your goal into actionable steps, one per line"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="financialGoalId">Link to Financial Goal (Optional)</Label>
              <Select 
                value={formData.financialGoalId?.toString() || ""}
                onValueChange={(value) => handleSelectChange("financialGoalId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a financial goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {financialGoals.map((goal: any) => (
                    <SelectItem key={goal.id} value={goal.id.toString()}>
                      {goal.name} (${parseFloat(goal.targetAmount.toString()).toLocaleString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button type="submit">
                {isEditing ? 'Update Goal' : 'Add Goal'}
              </Button>
              {isEditing && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Views */}
      {viewMode === "stats" ? (
        <Card>
          <CardHeader>
            <CardTitle>Goal Analytics</CardTitle>
            <CardDescription>Visual overview of your goals and progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall progress */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Overall Progress</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={goalProgressData}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
                  >
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis type="category" dataKey="name" width={150} />
                    <RechartsTooltip
                      formatter={(value, name, props) => [`${value}%`, 'Progress']}
                      labelFormatter={(label) => {
                        const goal = goalProgressData.find(g => g.name === label);
                        return `${label} - Target: ${formatDate(goal?.targetDate || '')}`;
                      }}
                    />
                    <Bar dataKey="progress" radius={[0, 4, 4, 0]}>
                      {goalProgressData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Summary stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-primary/10">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold">{goals.length}</div>
                    <div className="text-muted-foreground mt-1">Total Goals</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-green-500/10">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold">{goals.filter(g => getProgressNumber(g) === 100).length}</div>
                    <div className="text-muted-foreground mt-1">Completed</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-yellow-500/10">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold">{goals.filter(g => getProgressNumber(g) > 0 && getProgressNumber(g) < 100).length}</div>
                    <div className="text-muted-foreground mt-1">In Progress</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-red-500/10">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold">{goals.filter(g => getProgressNumber(g) === 0).length}</div>
                    <div className="text-muted-foreground mt-1">Not Started</div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Category distribution */}
            {categoryDistribution.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Goals by Category</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryDistribution.map(category => (
                    <Card key={category.name} style={{ borderTop: `3px solid ${category.color}` }}>
                      <CardContent className="pt-6 flex justify-between items-center">
                        <div>
                          <div className="text-lg font-semibold">{category.name}</div>
                          <div className="text-muted-foreground">
                            {((category.value / goals.length) * 100).toFixed(0)}% of goals
                          </div>
                        </div>
                        <div className="text-3xl font-bold">{category.value}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : viewMode === "kanban" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Not Started Column */}
          <Card>
            <CardHeader className="bg-muted/50">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Not Started
                <Badge variant="outline">{goals.filter(g => getProgressNumber(g) === 0).length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                {goals.filter(g => getProgressNumber(g) === 0).map(goal => (
                  <Card key={goal.id} className="p-3">
                    <div className="flex justify-between">
                      <h4 className="font-medium text-sm">{goal.title}</h4>
                      <Badge variant="outline" style={{ borderColor: goal.color || '#3B82F6', color: goal.color || '#3B82F6' }}>
                        {GOAL_CATEGORIES.find(c => c.value === goal.category)?.label || 'Personal'}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Due: {formatDate(goal.targetDate)}</div>
                    <Progress value={getProgressNumber(goal)} className="h-1 mt-2" />
                    <div className="flex gap-1 mt-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => handleEditGoal(goal)}>
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit Goal</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => handleLinkToGoal(goal)}>
                              <Link className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Link Tasks/Habits</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="sm" variant="outline" className="h-7 w-7 p-0 text-destructive" onClick={() => handleDeleteGoal(goal.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete Goal</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* In Progress Column */}
          <Card>
            <CardHeader className="bg-muted/50">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4" />
                In Progress
                <Badge variant="outline">{goals.filter(g => getProgressNumber(g) > 0 && getProgressNumber(g) < 100).length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                {goals.filter(g => getProgressNumber(g) > 0 && getProgressNumber(g) < 100).map(goal => (
                  <Card key={goal.id} className="p-3">
                    <div className="flex justify-between">
                      <h4 className="font-medium text-sm">{goal.title}</h4>
                      <Badge variant="outline" style={{ borderColor: goal.color || '#3B82F6', color: goal.color || '#3B82F6' }}>
                        {GOAL_CATEGORIES.find(c => c.value === goal.category)?.label || 'Personal'}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Due: {formatDate(goal.targetDate)}</div>
                    <div className="flex justify-between items-center mt-2">
                      <Progress value={getProgressNumber(goal)} className="h-1 w-[80%]" />
                      <span className="text-xs font-medium">{Math.round(getProgressNumber(goal))}%</span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => handleEditGoal(goal)}>
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit Goal</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => handleLinkToGoal(goal)}>
                              <Link className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Link Tasks/Habits</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="sm" variant="outline" className="h-7 w-7 p-0 text-destructive" onClick={() => handleDeleteGoal(goal.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete Goal</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Completed Column */}
          <Card>
            <CardHeader className="bg-muted/50">
              <CardTitle className="text-base flex items-center gap-2">
                <Check className="w-4 h-4" />
                Completed
                <Badge variant="outline">{goals.filter(g => getProgressNumber(g) === 100).length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                {goals.filter(g => getProgressNumber(g) === 100).map(goal => (
                  <Card key={goal.id} className="p-3">
                    <div className="flex justify-between">
                      <h4 className="font-medium text-sm">{goal.title}</h4>
                      <Badge variant="outline" style={{ borderColor: goal.color || '#3B82F6', color: goal.color || '#3B82F6' }}>
                        {GOAL_CATEGORIES.find(c => c.value === goal.category)?.label || 'Personal'}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Completed: {formatDate(goal.targetDate)}</div>
                    <div className="flex justify-between items-center mt-2">
                      <Progress value={100} className="h-1 w-[80%]" />
                      <span className="text-xs font-medium">100%</span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => handleEditGoal(goal)}>
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit Goal</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="sm" variant="outline" className="h-7 w-7 p-0 text-destructive" onClick={() => handleDeleteGoal(goal.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete Goal</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : viewMode === "timeline" ? (
        <Card>
          <CardHeader>
            <CardTitle>Goals Timeline</CardTitle>
            <CardDescription>View your goals organized by timeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {filteredGoals.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No goals found. Add one above!
                </div>
              ) : (
                filteredGoals
                  .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())
                  .map((goal) => {
                    const now = new Date();
                    const targetDate = new Date(goal.targetDate);
                    const isPast = targetDate < now;
                    const daysLeft = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    const linkedFinancialGoal = getLinkedFinancialGoal(goal.id);
                    
                    return (
                      <div key={goal.id} className="relative pl-8 pb-8 border-l-2 border-muted last:border-l-0 last:pb-0">
                        <div className="absolute -left-[9px] top-0">
                          <div 
                            className="w-4 h-4 rounded-full border-2 border-background" 
                            style={{ backgroundColor: goal.color || '#3B82F6' }}
                          ></div>
                        </div>
                        
                        <Card className="overflow-hidden">
                          <div 
                            className="h-1.5" 
                            style={{ 
                              width: '100%', 
                              backgroundColor: goal.color || '#3B82F6',
                              opacity: 0.2
                            }}
                          ></div>
                          <CardHeader className="pb-2">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                              <div>
                                <CardTitle>{goal.title}</CardTitle>
                                <CardDescription>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {formatDate(goal.targetDate)}
                                    {!isPast && daysLeft > 0 && (
                                      <Badge variant="outline" className="ml-2">
                                        {daysLeft} days left
                                      </Badge>
                                    )}
                                    {isPast && (
                                      <Badge variant="outline" className="bg-red-100 text-red-700 ml-2">
                                        Past due
                                      </Badge>
                                    )}
                                  </div>
                                </CardDescription>
                              </div>
                              
                              <div className="flex items-center">
                                <Badge 
                                  variant="outline" 
                                  style={{ borderColor: goal.color || '#3B82F6', color: goal.color || '#3B82F6' }}
                                >
                                  {GOAL_CATEGORIES.find(c => c.value === goal.category)?.label || 'Personal'}
                                </Badge>
                                
                                <div className="flex items-center gap-1 ml-2">
                                  <span className="text-sm font-medium">{Math.round(getProgressNumber(goal))}%</span>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => handleEditGoal(goal)}>
                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleLinkToGoal(goal)}>
                                        <Link className="mr-2 h-4 w-4" /> Link Tasks/Habits
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem 
                                        className="text-red-600"
                                        onClick={() => handleDeleteGoal(goal.id)}
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="space-y-4">
                            {goal.description && (
                              <p className="text-sm text-muted-foreground">{goal.description}</p>
                            )}
                            
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span className="font-medium">{Math.round(getProgressNumber(goal))}%</span>
                              </div>
                              <Progress value={getProgressNumber(goal)} className="h-2" />
                            </div>
                            
                            {linkedFinancialGoal && (
                              <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-md">
                                <div className="flex items-center text-amber-800 dark:text-amber-300 text-sm font-medium mb-1">
                                  <DollarSign className="h-4 w-4 mr-1" />
                                  Linked Financial Goal: {linkedFinancialGoal.name}
                                </div>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs text-amber-700 dark:text-amber-400">
                                    <span>Target: ${parseFloat(linkedFinancialGoal.targetAmount.toString()).toLocaleString()}</span>
                                    <span>Current: ${parseFloat(linkedFinancialGoal.currentAmount.toString()).toLocaleString()}</span>
                                  </div>
                                  <Progress 
                                    value={(parseFloat(linkedFinancialGoal.currentAmount.toString()) / parseFloat(linkedFinancialGoal.targetAmount.toString())) * 100} 
                                    className="h-1.5 bg-amber-200 dark:bg-amber-900"
                                  />
                                </div>
                              </div>
                            )}
                            
                            {/* Milestones */}
                            {goal.milestones.length > 0 && (
                              <div>
                                <h5 className="text-sm font-medium mb-2">Milestones</h5>
                                <ul className="space-y-2 pl-0.5">
                                  {goal.milestones.map((milestone) => (
                                    <li key={milestone.id} className="flex items-center text-sm">
                                      <Checkbox 
                                        id={`milestone-${goal.id}-${milestone.id}`}
                                        checked={milestone.completed}
                                        onCheckedChange={(checked) => 
                                          updateMilestoneStatus(goal.id, milestone.id, checked as boolean)
                                        }
                                      />
                                      <label 
                                        htmlFor={`milestone-${goal.id}-${milestone.id}`} 
                                        className={`ml-3 ${milestone.completed ? 'line-through text-muted-foreground' : ''}`}
                                      >
                                        {milestone.text}
                                      </label>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Linked Tasks and Habits */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                              {getLinkedTasks(goal.id).length > 0 && (
                                <div className="space-y-2">
                                  <h5 className="text-sm font-medium flex items-center">
                                    <ClipboardList className="h-4 w-4 mr-1" />
                                    Linked Tasks
                                  </h5>
                                  <ul className="space-y-1.5">
                                    {getLinkedTasks(goal.id).map(task => (
                                      <li key={task.id} className="flex items-center text-sm bg-muted/30 p-1.5 rounded">
                                        <Checkbox 
                                          id={`linked-task-${task.id}`}
                                          checked={task.completed}
                                          disabled
                                        />
                                        <label 
                                          htmlFor={`linked-task-${task.id}`} 
                                          className={`ml-3 ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                                        >
                                          {task.title}
                                        </label>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {getLinkedHabits(goal.id).length > 0 && (
                                <div className="space-y-2">
                                  <h5 className="text-sm font-medium flex items-center">
                                    <Repeat className="h-4 w-4 mr-1" />
                                    Linked Habits
                                  </h5>
                                  <ul className="space-y-1.5">
                                    {getLinkedHabits(goal.id).map(habit => (
                                      <li key={habit.id} className="flex items-center text-sm bg-muted/30 p-1.5 rounded">
                                        <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                                        </div>
                                        <span>{habit.title}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* List View (Default) */
        <Card>
          <CardHeader>
            <CardTitle>Your Goals</CardTitle>
            <CardDescription>Track and manage all your goals in one place</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredGoals.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No goals found. Add one above!
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredGoals.map((goal) => {
                  const now = new Date();
                  const targetDate = new Date(goal.targetDate);
                  const isPast = targetDate < now;
                  const daysLeft = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  const linkedFinancialGoal = getLinkedFinancialGoal(goal.id);
                  
                  return (
                    <div key={goal.id} className="py-5">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                        <div className="flex-1">
                          <div className="flex justify-between items-start sm:items-center mb-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-lg">{goal.title}</h4>
                              <Badge 
                                variant="outline" 
                                style={{ borderColor: goal.color || '#3B82F6', color: goal.color || '#3B82F6' }}
                              >
                                {GOAL_CATEGORIES.find(c => c.value === goal.category)?.label || 'Personal'}
                              </Badge>
                              
                              {linkedFinancialGoal && (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-700/50">
                                  <DollarSign className="h-3 w-3 mr-1" />
                                  Financial
                                </Badge>
                              )}
                            </div>
                            
                            {/* Mobile action buttons */}
                            <div className="flex sm:hidden gap-1">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleEditGoal(goal)}>
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleLinkToGoal(goal)}>
                                    <Link className="mr-2 h-4 w-4" /> Link Tasks/Habits
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => handleDeleteGoal(goal.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          
                          {goal.description && (
                            <p className="text-sm text-muted-foreground mb-3">{goal.description}</p>
                          )}
                          
                          <div className="flex flex-wrap gap-3 mb-3">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5 mr-1.5" />
                              Target: {formatDate(goal.targetDate)}
                              {!isPast && daysLeft > 0 && (
                                <Badge variant="outline" className="ml-2">
                                  {daysLeft} days left
                                </Badge>
                              )}
                              {isPast && getProgressNumber(goal) < 100 && (
                                <Badge variant="outline" className="bg-red-100 text-red-700 ml-2">
                                  Past due
                                </Badge>
                              )}
                            </div>
                            
                            {linkedFinancialGoal && (
                              <div className="text-sm text-amber-700 dark:text-amber-400 flex items-center">
                                <DollarSign className="h-3.5 w-3.5 mr-1.5" />
                                ${parseFloat(linkedFinancialGoal.currentAmount.toString()).toLocaleString()} of ${parseFloat(linkedFinancialGoal.targetAmount.toString()).toLocaleString()}
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-1 mb-4">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span className="font-medium">{Math.round(getProgressNumber(goal))}%</span>
                            </div>
                            <Progress value={getProgressNumber(goal)} className="h-2" />
                          </div>
                          
                          {/* Milestones */}
                          <div>
                            <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                              <ChevronRight className="h-4 w-4" />
                              Milestones
                            </h5>
                            <ul className="space-y-1.5 mb-3">
                              {goal.milestones.map((milestone) => (
                                <li key={milestone.id} className="flex items-center text-sm">
                                  <Checkbox 
                                    id={`milestone-${goal.id}-${milestone.id}`}
                                    checked={milestone.completed}
                                    onCheckedChange={(checked) => 
                                      updateMilestoneStatus(goal.id, milestone.id, checked as boolean)
                                    }
                                  />
                                  <label 
                                    htmlFor={`milestone-${goal.id}-${milestone.id}`} 
                                    className={`ml-3 ${milestone.completed ? 'line-through text-muted-foreground' : ''}`}
                                  >
                                    {milestone.text}
                                  </label>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {/* Linked Tasks and Habits */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                            {getLinkedTasks(goal.id).length > 0 && (
                              <div className="space-y-2">
                                <h5 className="text-sm font-medium flex items-center gap-1">
                                  <ChevronRight className="h-4 w-4" />
                                  Linked Tasks
                                </h5>
                                <ul className="space-y-1.5">
                                  {getLinkedTasks(goal.id).map(task => (
                                    <li key={task.id} className="flex items-center text-sm bg-muted/30 p-1.5 rounded">
                                      <Checkbox 
                                        id={`linked-task-${task.id}`}
                                        checked={task.completed}
                                        disabled
                                      />
                                      <label 
                                        htmlFor={`linked-task-${task.id}`} 
                                        className={`ml-3 ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                                      >
                                        {task.title}
                                      </label>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {getLinkedHabits(goal.id).length > 0 && (
                              <div className="space-y-2">
                                <h5 className="text-sm font-medium flex items-center gap-1">
                                  <ChevronRight className="h-4 w-4" />
                                  Linked Habits
                                </h5>
                                <ul className="space-y-1.5">
                                  {getLinkedHabits(goal.id).map(habit => (
                                    <li key={habit.id} className="flex items-center text-sm bg-muted/30 p-1.5 rounded">
                                      <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                                      </div>
                                      <span>{habit.title}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Desktop action buttons */}
                        <div className="hidden sm:flex flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="justify-start"
                            onClick={() => handleEditGoal(goal)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="justify-start"
                            onClick={() => handleLinkToGoal(goal)}
                          >
                            <Link className="h-4 w-4 mr-2" />
                            Link
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="justify-start text-red-600"
                            onClick={() => handleDeleteGoal(goal.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Link Dialog */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Link Tasks and Habits</DialogTitle>
            <DialogDescription>
              Connect this goal with tasks and habits to build a cohesive system for success.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tasks</Label>
              <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                {tasks.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-2 text-center">
                    No tasks available
                  </div>
                ) : (
                  tasks.map(task => (
                    <div key={task.id} className="flex items-center py-1">
                      <Checkbox 
                        id={`link-task-${task.id}`}
                        checked={formData.linkedTasks?.includes(task.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData(prev => ({
                              ...prev,
                              linkedTasks: [...(prev.linkedTasks || []), task.id]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              linkedTasks: prev.linkedTasks?.filter(id => id !== task.id) || []
                            }));
                          }
                        }}
                      />
                      <label 
                        htmlFor={`link-task-${task.id}`} 
                        className="ml-3 text-sm"
                      >
                        {task.title}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Habits</Label>
              <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                {habits.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-2 text-center">
                    No habits available
                  </div>
                ) : (
                  habits.map(habit => (
                    <div key={habit.id} className="flex items-center py-1">
                      <Checkbox 
                        id={`link-habit-${habit.id}`}
                        checked={formData.linkedHabits?.includes(habit.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData(prev => ({
                              ...prev,
                              linkedHabits: [...(prev.linkedHabits || []), habit.id]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              linkedHabits: prev.linkedHabits?.filter(id => id !== habit.id) || []
                            }));
                          }
                        }}
                      />
                      <label 
                        htmlFor={`link-habit-${habit.id}`} 
                        className="ml-3 text-sm"
                      >
                        {habit.title}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveLinkChanges}>
              Save Links
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Goals;
