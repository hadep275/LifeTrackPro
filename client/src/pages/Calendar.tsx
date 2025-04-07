import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Task, Goal, Habit, Finances } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  CircleDot,
  Target,
  CreditCard,
  Calendar as CalendarIcon,
  ArrowLeft,
  ArrowRight,
  Filter,
} from "lucide-react";
import { format, addMonths, subMonths, parseISO, isSameDay } from "date-fns";

// Import Calendar component 
import CalendarView from "@/components/dashboard/CalendarView";
import { Link } from "wouter";

// Types for filtering events
type EventType = "all" | "task" | "habit" | "goal" | "finance";

const Calendar = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [filter, setFilter] = useState<EventType>("all");

  // Fetch all data needed for calendar
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  const { data: habits = [] } = useQuery<Habit[]>({
    queryKey: ["/api/habits"],
  });

  const { data: finances } = useQuery<Finances>({
    queryKey: ["/api/finances"],
  });

  // Toggle task completion
  const toggleTask = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      await apiRequest(`/api/tasks/${id}`, "PATCH", { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  const handleToggleTask = (taskId: number, completed: boolean) => {
    toggleTask.mutate({ id: taskId, completed });
  };

  // Navigation methods
  const prevMonth = () => {
    setDate((prevDate) => subMonths(prevDate, 1));
  };

  const nextMonth = () => {
    setDate((prevDate) => addMonths(prevDate, 1));
  };

  const goToToday = () => {
    setDate(new Date());
  };

  // Helper for event type icons
  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "task":
        return <CheckCircle className="h-4 w-4" />;
      case "habit":
        return <CircleDot className="h-4 w-4" />;
      case "goal":
        return <Target className="h-4 w-4" />;
      case "finance":
        return <CreditCard className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Helper function for event type display name
  const getEventTypeName = (type: string) => {
    switch (type) {
      case "task":
        return "Task";
      case "habit":
        return "Habit";
      case "goal":
        return "Goal";
      case "finance":
        return "Finance";
      default:
        return "";
    }
  };

  // Helper for event type styling
  const getEventTypeColor = (type: string, completed?: boolean) => {
    switch (type) {
      case "task":
        return completed
          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
          : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "habit":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "goal":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
      case "finance":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setView("calendar")} className={view === "calendar" ? "bg-muted" : ""}>
            <CalendarIcon className="h-4 w-4 mr-2" />
            Calendar
          </Button>
          <Button variant="outline" onClick={() => setView("list")} className={view === "list" ? "bg-muted" : ""}>
            <Filter className="h-4 w-4 mr-2" />
            List View
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">
              {format(date, "MMMM yyyy")}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Select value={filter} onValueChange={(value) => setFilter(value as EventType)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Show All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="task">Tasks</SelectItem>
                  <SelectItem value="habit">Habits</SelectItem>
                  <SelectItem value="goal">Goals</SelectItem>
                  <SelectItem value="finance">Finances</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <CardDescription>
            Manage your schedule and view all your events in one place
          </CardDescription>
        </CardHeader>
        <CardContent>
          {view === "calendar" ? (
            <div className="pt-2">
              <CalendarView 
                tasks={filter === "all" || filter === "task" ? tasks : []}
                goals={filter === "all" || filter === "goal" ? goals : []}
                habits={filter === "all" || filter === "habit" ? habits : []}
                finances={filter === "all" || filter === "finance" ? finances : undefined}
              />
            </div>
          ) : (
            <Tabs defaultValue="upcoming">
              <TabsList className="mb-4 w-full grid grid-cols-3">
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
              </TabsList>
              <TabsContent value="upcoming" className="space-y-4">
                {/* Upcoming Events List */}
                <div className="space-y-4">
                  {tasks
                    .filter((task) => {
                      if (!task.dueDate) return false;
                      const dueDate = parseISO(task.dueDate);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return dueDate > today && (filter === "all" || filter === "task");
                    })
                    .map((task) => (
                      <div key={`task-${task.id}`} className="p-4 rounded-lg border flex justify-between items-start">
                        <div className="flex gap-3">
                          <div className={`p-2 rounded-full ${getEventTypeColor("task", task.completed)}`}>
                            <CheckCircle className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{task.title}</h3>
                              <Badge variant="outline">{getEventTypeName("task")}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {task.description || "No description"}
                            </p>
                            <div className="flex items-center mt-2 text-xs text-muted-foreground">
                              <span className="font-medium">Due: </span>
                              <span className="ml-1">
                                {task.dueDate ? format(parseISO(task.dueDate), "PPP") : "No due date"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleTask(task.id, !task.completed)}
                          >
                            {task.completed ? "Mark Incomplete" : "Mark Complete"}
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/tasks?id=${task.id}`}>View</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                  {goals
                    .filter((goal) => {
                      if (!goal.targetDate) return false;
                      const targetDate = parseISO(goal.targetDate);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return targetDate > today && (filter === "all" || filter === "goal");
                    })
                    .map((goal) => (
                      <div key={`goal-${goal.id}`} className="p-4 rounded-lg border flex justify-between items-start">
                        <div className="flex gap-3">
                          <div className={`p-2 rounded-full ${getEventTypeColor("goal")}`}>
                            <Target className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{goal.title}</h3>
                              <Badge variant="outline">{getEventTypeName("goal")}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {goal.description || "No description"}
                            </p>
                            <div className="flex items-center mt-2 text-xs text-muted-foreground">
                              <span className="font-medium">Target: </span>
                              <span className="ml-1">
                                {goal.targetDate ? format(parseISO(goal.targetDate), "PPP") : "No target date"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/goals?id=${goal.id}`}>View</Link>
                        </Button>
                      </div>
                    ))}
                </div>
              </TabsContent>
              
              <TabsContent value="today" className="space-y-4">
                {/* Today's Events List */}
                <div className="space-y-4">
                  {tasks
                    .filter((task) => {
                      if (!task.dueDate) return false;
                      const today = new Date();
                      return isSameDay(parseISO(task.dueDate), today) && (filter === "all" || filter === "task");
                    })
                    .map((task) => (
                      <div key={`task-${task.id}`} className="p-4 rounded-lg border flex justify-between items-start">
                        <div className="flex gap-3">
                          <div className={`p-2 rounded-full ${getEventTypeColor("task", task.completed)}`}>
                            <CheckCircle className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{task.title}</h3>
                              <Badge variant="outline">{getEventTypeName("task")}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {task.description || "No description"}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleTask(task.id, !task.completed)}
                          >
                            {task.completed ? "Mark Incomplete" : "Mark Complete"}
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/tasks?id=${task.id}`}>View</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                  {/* More event types for today... */}
                </div>
              </TabsContent>
              
              <TabsContent value="past" className="space-y-4">
                {/* Past Events List */}
                <div className="space-y-4">
                  {tasks
                    .filter((task) => {
                      if (!task.dueDate) return false;
                      const dueDate = parseISO(task.dueDate);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return dueDate < today && !isSameDay(dueDate, today) && (filter === "all" || filter === "task");
                    })
                    .map((task) => (
                      <div key={`task-${task.id}`} className="p-4 rounded-lg border flex justify-between items-start">
                        <div className="flex gap-3">
                          <div className={`p-2 rounded-full ${getEventTypeColor("task", task.completed)}`}>
                            <CheckCircle className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{task.title}</h3>
                              <Badge variant="outline">{getEventTypeName("task")}</Badge>
                              {!task.completed && (
                                <Badge variant="destructive">Overdue</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {task.description || "No description"}
                            </p>
                            <div className="flex items-center mt-2 text-xs text-muted-foreground">
                              <span className="font-medium">Due: </span>
                              <span className="ml-1">
                                {task.dueDate ? format(parseISO(task.dueDate), "PPP") : "No due date"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!task.completed && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleTask(task.id, true)}
                            >
                              Mark Complete
                            </Button>
                          )}
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/tasks?id=${task.id}`}>View</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                  {/* More past event types... */}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
        <CardFooter>
          <div className="w-full flex justify-between items-center">
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                <span className="text-xs">Tasks</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                <span className="text-xs">Habits</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                <span className="text-xs">Goals</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
                <span className="text-xs">Finances</span>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/">Back to Dashboard</Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Calendar;