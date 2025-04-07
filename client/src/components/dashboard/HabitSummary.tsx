import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";
import { Habit } from "@shared/schema";

interface HabitSummaryProps {
  habits: Habit[];
  onViewAll: () => void;
}

const HabitSummary = ({ habits, onViewAll }: HabitSummaryProps) => {
  const displayHabits = habits.slice(0, 3);
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Habits
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayHabits.length > 0 ? (
          displayHabits.map((habit) => (
            <div key={habit.id} className="flex flex-col py-2 border-b border-border">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{habit.title}</span>
                <span className="text-xs text-muted-foreground">{habit.frequency}</span>
              </div>
              <div className="flex space-x-1 mt-1">
                {daysOfWeek.map((day, index) => (
                  <div 
                    key={index}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${
                      habit.completedDays.includes(index + 1) 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-card border-muted-foreground/20 text-muted-foreground'
                    }`}
                  >
                    <span>{day}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-muted-foreground text-center py-4">
            No habits yet. Add some to get started!
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" onClick={onViewAll} className="w-full">
          View All Habits
        </Button>
      </CardFooter>
    </Card>
  );
};

export default HabitSummary;
