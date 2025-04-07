import { Card, CardContent } from "@/components/ui/card";
import { Habit } from "@shared/schema";

interface HabitSummaryProps {
  habits: Habit[];
  onViewAll: () => void;
}

const HabitSummary = ({ habits, onViewAll }: HabitSummaryProps) => {
  const displayHabits = habits.slice(0, 3);
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <Card className="bg-white shadow-sm border border-slate-200">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Habits</h3>
          <button 
            onClick={onViewAll}
            className="text-primary-dark text-sm hover:underline"
          >
            View All
          </button>
        </div>
        <div className="space-y-3">
          {displayHabits.length > 0 ? (
            displayHabits.map((habit) => (
              <div key={habit.id} className="py-2 border-b border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{habit.title}</span>
                  <span className="text-xs text-slate-500">{habit.frequency}</span>
                </div>
                <div className="flex space-x-1 mt-1">
                  {daysOfWeek.map((day, index) => (
                    <div 
                      key={index}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${
                        habit.completedDays.includes(index + 1) 
                          ? 'bg-primary-light text-white border-primary-dark' 
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span>{day}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-slate-500 text-center py-2">
              No habits yet. Add some to get started!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HabitSummary;
