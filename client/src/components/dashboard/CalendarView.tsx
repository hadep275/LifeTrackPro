import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  CheckCircle, 
  CircleDot, 
  Target, 
  CreditCard, 
  DollarSign
} from "lucide-react";
import { Task, Goal, Habit, Finances } from "@shared/schema";

interface CalendarDay {
  date: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

interface CalendarEvent {
  id: string;
  title: string;
  type: 'task' | 'habit' | 'goal' | 'finance';
  details?: string;
  amount?: number;
  dueDate?: string;
  priority?: string;
  completed?: boolean;
}

interface CalendarViewProps {
  tasks: Task[];
  goals: Goal[];
  habits?: Habit[];
  finances?: Finances;
}

const CalendarView = ({ tasks, goals, habits = [], finances }: CalendarViewProps) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  
  // Create refs to track previous values
  const lastTasksRef = useRef<string>('');
  const lastGoalsRef = useRef<string>('');
  const lastHabitsRef = useRef<string>('');
  const lastFinancesRef = useRef<string>('');
  const lastMonthRef = useRef<string>('');
  
  // Initialize calendar on first render
  useEffect(() => {
    generateCalendarDays();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Update calendar only when data or month changes
  useEffect(() => {
    // Only run this effect after initial render
    if (calendarDays.length === 0) return;
    
    // Create a string representation of tasks that only includes relevant data for calendar
    const tasksString = JSON.stringify(
      tasks.map(t => ({ id: t.id, title: t.title, dueDate: t.dueDate, completed: t.completed }))
    );
    
    // Create a string representation of goals that only includes relevant data for calendar
    const goalsString = JSON.stringify(
      goals.map(g => ({ id: g.id, title: g.title, targetDate: g.targetDate }))
    );
    
    // Create string representation of habits data
    const habitsString = habits.length > 0 
      ? JSON.stringify(habits.map(h => ({
          id: h.id, 
          title: h.title, 
          frequency: h.frequency,
          completedDays: h.completedDays
        })))
      : '';
    
    // Create string representation of finances data
    const financesString = finances && finances.expenseCategories
      ? JSON.stringify(finances.expenseCategories.map(c => ({
          id: c.id,
          name: c.name,
          amount: c.amount
        })))
      : '';
    
    const monthString = `${currentMonth.getFullYear()}-${currentMonth.getMonth()}`;
    
    // Store these values in component state with useRef to avoid re-renders
    const dataChanged = 
      lastTasksRef.current !== tasksString ||
      lastGoalsRef.current !== goalsString ||
      lastHabitsRef.current !== habitsString ||
      lastFinancesRef.current !== financesString ||
      lastMonthRef.current !== monthString;
    
    // Only regenerate calendar if data has changed
    if (dataChanged) {
      lastTasksRef.current = tasksString;
      lastGoalsRef.current = goalsString;
      lastHabitsRef.current = habitsString;
      lastFinancesRef.current = financesString;
      lastMonthRef.current = monthString;
      
      generateCalendarDays();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, goals, habits, finances, currentMonth, calendarDays.length]);
  
  // Helper function to check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };
  
  // Get all events for a specific date
  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const events: CalendarEvent[] = [];
    
    // Add tasks for this date
    tasks.filter(task => task.dueDate === dateString).forEach(task => {
      events.push({
        id: `task-${task.id}`,
        title: task.title,
        type: 'task',
        details: task.description || '',
        priority: task.priority,
        completed: task.completed,
        dueDate: task.dueDate
      });
    });
    
    // Add goals with target date on this date
    goals.filter(goal => goal.targetDate === dateString).forEach(goal => {
      events.push({
        id: `goal-${goal.id}`,
        title: goal.title,
        type: 'goal',
        details: goal.description || '',
        dueDate: goal.targetDate
      });
    });
    
    // Add habits for this date
    if (habits && habits.length > 0) {
      // Get the day of week (0-6, where 0 is Sunday)
      const dayOfWeek = date.getDay() + 1; // Convert to 1-7 format
      
      habits.filter(habit => 
        (habit.frequency === 'daily') || 
        (habit.frequency === 'weekly' && habit.completedDays.includes(dayOfWeek))
      ).forEach(habit => {
        events.push({
          id: `habit-${habit.id}`,
          title: habit.title,
          type: 'habit',
          details: habit.description || ''
        });
      });
    }
    
    // Add finance events (like credit card due dates, loan payments)
    if (finances && finances.expenseCategories) {
      // For this example, we'll assign a due date to expense categories on the 1st and 15th of each month
      const dayOfMonth = date.getDate();
      
      // Create payment events on the 1st and 15th of the month
      if (dayOfMonth === 1 || dayOfMonth === 15) {
        finances.expenseCategories.filter(cat => 
          // Example: Credit card payments on 1st, loans on 15th
          (dayOfMonth === 1 && cat.name.toLowerCase().includes('credit')) ||
          (dayOfMonth === 15 && cat.name.toLowerCase().includes('loan'))
        ).forEach(category => {
          events.push({
            id: `finance-${category.id}`,
            title: `${category.name} Payment Due`,
            type: 'finance',
            details: `Monthly payment for ${category.name}`,
            amount: Number(category.amount)
          });
        });
      }
    }
    
    return events;
  };
  
  // Generate the calendar days for the current month
  const generateCalendarDays = () => {
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    // Start from the previous month's days that appear in the first week
    const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysFromPrevMonth = firstDayOfWeek;
    
    // Calculate how many days to show from the next month
    const totalDaysToShow = 42; // 6 weeks (6 * 7 = 42)
    const daysFromNextMonth = totalDaysToShow - lastDayOfMonth.getDate() - daysFromPrevMonth;
    
    const days: CalendarDay[] = [];
    
    // Previous month's days
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), -i);
      days.push({
        date: date.toISOString().split('T')[0],
        dayNumber: date.getDate(),
        isCurrentMonth: false,
        isToday: isToday(date),
        events: getEventsForDate(date)
      });
    }
    
    // Current month's days
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
      days.push({
        date: date.toISOString().split('T')[0],
        dayNumber: i,
        isCurrentMonth: true,
        isToday: isToday(date),
        events: getEventsForDate(date)
      });
    }
    
    // Next month's days
    for (let i = 1; i <= daysFromNextMonth; i++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, i);
      days.push({
        date: date.toISOString().split('T')[0],
        dayNumber: i,
        isCurrentMonth: false,
        isToday: isToday(date),
        events: getEventsForDate(date)
      });
    }
    
    setCalendarDays(days);
  };
  
  // Helper function to get icon based on event type
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'task':
        return <CheckCircle className="h-3 w-3" />;
      case 'habit':
        return <CircleDot className="h-3 w-3" />;
      case 'goal':
        return <Target className="h-3 w-3" />;
      case 'finance':
        return <CreditCard className="h-3 w-3" />;
      default:
        return null;
    }
  };
  
  // Helper function to get priority styling
  const getPriorityClass = (priority?: string) => {
    if (!priority) return '';
    
    switch (priority) {
      case 'high':
        return 'border-l-4 border-red-500 pl-2';
      case 'medium':
        return 'border-l-4 border-amber-500 pl-2';
      case 'low':
        return 'border-l-4 border-green-500 pl-2';
      default:
        return '';
    }
  };
  
  // Helper function to get background class for event
  const getEventBgClass = (event: CalendarEvent) => {
    switch (event.type) {
      case 'task':
        return event.completed
          ? 'bg-green-500/10 dark:bg-green-500/20 text-green-700 dark:text-green-300'
          : 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground/80';
      case 'habit':
        return 'bg-violet-500/10 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300';
      case 'goal':
        return 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300';
      case 'finance':
        return 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300';
      default:
        return 'bg-muted/50 text-muted-foreground';
    }
  };
  
  // Navigation methods
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  const goToToday = () => {
    setCurrentMonth(new Date());
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Calendar
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={prevMonth} 
              title="Previous Month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              onClick={goToToday}
              className="text-sm"
            >
              Today
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={nextMonth}
              title="Next Month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground font-medium mt-2">
          {currentMonth.toLocaleDateString('en-US', {month: 'long', year: 'numeric'})}
        </p>
      </CardHeader>
      <CardContent className="p-2">
        <div className="grid grid-cols-7 mb-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day) => (
            <Dialog key={day.date}>
              <DialogTrigger asChild>
                <div 
                  className={`p-1 rounded-md min-h-[80px] text-sm relative cursor-pointer hover:bg-muted/50 transition-colors ${
                    day.isCurrentMonth 
                      ? 'bg-card dark:bg-card/80' 
                      : 'bg-muted/30 dark:bg-muted/10 text-muted-foreground'
                  } ${day.isToday ? 'ring-2 ring-primary' : ''}`}
                >
                  <div 
                    className={`text-xs font-medium text-right mb-1 ${
                      day.isCurrentMonth 
                        ? 'text-foreground' 
                        : 'text-muted-foreground/70'
                    } ${day.isToday ? 'font-bold' : ''}`}
                  >
                    {day.dayNumber}
                  </div>
                  <div className="space-y-1">
                    {day.events.slice(0, 3).map((event) => (
                      <div 
                        key={event.id}
                        className={`px-1 py-0.5 text-[10px] leading-tight rounded flex items-center gap-1 ${getEventBgClass(event)}`}
                      >
                        {getEventIcon(event.type)}
                        <span className="truncate">{event.title}</span>
                      </div>
                    ))}
                    {day.events.length > 3 && (
                      <div className="text-[10px] text-muted-foreground text-center">
                        +{day.events.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {new Date(day.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto pr-2">
                  {day.events.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-8">
                      No events scheduled for this day
                    </p>
                  ) : (
                    day.events.map((event) => (
                      <div 
                        key={event.id} 
                        className={`p-3 rounded-lg border ${getPriorityClass(event.priority)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className={`flex items-center gap-2 text-sm font-medium mb-1`}>
                            <div className={`p-1 rounded ${getEventBgClass(event)}`}>
                              {getEventIcon(event.type)}
                            </div>
                            <span>{event.title}</span>
                          </div>
                          {event.type === 'task' && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              event.completed 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                            }`}>
                              {event.completed ? 'Completed' : 'Pending'}
                            </span>
                          )}
                          {event.type === 'finance' && event.amount && (
                            <div className="flex items-center text-emerald-700 dark:text-emerald-400 font-medium">
                              <DollarSign className="h-3 w-3 mr-1" />
                              <span>{event.amount.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                        {event.details && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {event.details}
                          </p>
                        )}
                        <div className="flex justify-end mt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            asChild
                          >
                            <Link href={`/${event.type}s`}>
                              View in {event.type === 'finance' ? 'Finances' : `${event.type.charAt(0).toUpperCase() + event.type.slice(1)}s`}
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/calendar">
            View Full Calendar
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CalendarView;
