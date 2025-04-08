import { useLocation } from "wouter";
import TaskSummary from "@/components/dashboard/TaskSummary";
import HabitSummary from "@/components/dashboard/HabitSummary";
import GoalSummary from "@/components/dashboard/GoalSummary";
import FinanceSummary from "@/components/dashboard/FinanceSummary";
import CalendarView from "@/components/dashboard/CalendarView";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Task, Habit, Goal, Finances } from "@shared/schema";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const [, setLocation] = useLocation();
  
  // Fetch data from API instead of localStorage
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/tasks'],
    queryFn: async () => {
      return await apiRequest<Task[]>('/api/tasks');
    }
  });
  
  const { data: habits = [], isLoading: habitsLoading } = useQuery({
    queryKey: ['/api/habits'],
    queryFn: async () => {
      return await apiRequest<Habit[]>('/api/habits');
    }
  });
  
  const { data: goals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ['/api/goals'],
    queryFn: async () => {
      return await apiRequest<Goal[]>('/api/goals');
    }
  });
  
  const { data: finances, isLoading: financesLoading } = useQuery({
    queryKey: ['/api/finances'],
    queryFn: async () => {
      return await apiRequest<Finances>('/api/finances');
    }
  });
  
  const toggleTaskMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      const task = tasks.find(t => t.id === id);
      if (!task) return;
      
      return await apiRequest<Task>(`/api/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...task, completed })
      });
    }
  });

  const handleToggleTask = (taskId: number, completed: boolean) => {
    toggleTaskMutation.mutate({ id: taskId, completed });
  };

  // Loading indicator when any data is loading
  const isLoading = tasksLoading || habitsLoading || goalsLoading || financesLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  // Default finances data fallback
  const financesData = finances || {
    id: 0,
    income: "0",
    expenses: "0",
    savings: "0",
    netWorth: "0",
    userId: 1, // Add required userId field
    expenseCategories: [],
    financialGoals: [],
    accounts: [],
    investments: [],
    recurringBills: []
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Tasks Summary */}
        <TaskSummary 
          tasks={tasks} 
          onToggleTask={handleToggleTask}
          onViewAll={() => setLocation("/tasks")}
        />
        
        {/* Habits Summary */}
        <HabitSummary 
          habits={habits}
          onViewAll={() => setLocation("/habits")}
        />
        
        {/* Goals Summary */}
        <GoalSummary 
          goals={goals}
          onViewAll={() => setLocation("/goals")}
        />
        
        {/* Financial Summary */}
        <FinanceSummary 
          finances={financesData}
          onViewAll={() => setLocation("/finances")}
        />
        
        {/* Calendar */}
        <div className="md:col-span-2">
          <CalendarView 
            tasks={tasks} 
            goals={goals} 
            habits={habits}
            finances={financesData}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
