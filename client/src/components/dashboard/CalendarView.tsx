import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Task, Goal } from "@shared/schema";

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
  type: 'task' | 'habit' | 'goal';
}

interface CalendarViewProps {
  tasks: Task[];
  goals: Goal[];
}

const CalendarView = ({ tasks, goals }: CalendarViewProps) => {
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  
  useEffect(() => {
    generateCalendarDays();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, goals]);
  
  const generateCalendarDays = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    // Start from the previous month's days that appear in the first week
    const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysFromPrevMonth = firstDayOfWeek;
    
    // Calculate how many days to show from the next month
    const totalDaysToShow = 35; // 5 weeks
    const daysFromNextMonth = totalDaysToShow - lastDayOfMonth.getDate() - daysFromPrevMonth;
    
    const days: CalendarDay[] = [];
    
    // Previous month's days
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth(), -i);
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
      const date = new Date(today.getFullYear(), today.getMonth(), i);
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
      const date = new Date(today.getFullYear(), today.getMonth() + 1, i);
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
  
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };
  
  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const events: CalendarEvent[] = [];
    
    // Add tasks for this date
    const tasksForDate = tasks.filter(task => task.dueDate === dateString);
    tasksForDate.forEach(task => {
      events.push({
        id: `task-${task.id}`,
        title: task.title,
        type: 'task'
      });
    });
    
    // Add goals with target date on this date
    const goalsForDate = goals.filter(goal => goal.targetDate === dateString);
    goalsForDate.forEach(goal => {
      events.push({
        id: `goal-${goal.id}`,
        title: goal.title,
        type: 'goal'
      });
    });
    
    return events;
  };
  
  return (
    <Card className="bg-white shadow-sm border border-slate-200">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Calendar</h3>
          <div className="text-sm text-slate-500">
            {new Date().toLocaleDateString('en-US', {month: 'long', year: 'numeric'})}
          </div>
        </div>
        <div className="grid grid-cols-7 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day) => (
            <div 
              key={day.date}
              className={`p-1 rounded min-h-[80px] text-sm relative ${
                day.isCurrentMonth ? 'bg-slate-100' : 'bg-slate-50'
              } ${day.isToday ? 'ring-2 ring-primary-dark' : ''}`}
            >
              <div 
                className={`text-xs text-right mb-1 ${
                  day.isCurrentMonth ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                {day.dayNumber}
              </div>
              <div className="space-y-1">
                {day.events.map((event) => (
                  <div 
                    key={event.id}
                    className={`px-1 py-0.5 rounded text-xs truncate ${
                      event.type === 'task' 
                        ? 'bg-primary-light text-white' 
                        : event.type === 'habit' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarView;
