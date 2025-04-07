import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Goal } from "@shared/schema";

interface GoalSummaryProps {
  goals: Goal[];
  onViewAll: () => void;
}

const GoalSummary = ({ goals, onViewAll }: GoalSummaryProps) => {
  const displayGoals = goals.slice(0, 2);

  return (
    <Card className="bg-white shadow-sm border border-slate-200">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Goals</h3>
          <button 
            onClick={onViewAll}
            className="text-primary-dark text-sm hover:underline"
          >
            View All
          </button>
        </div>
        <div className="space-y-4">
          {displayGoals.length > 0 ? (
            displayGoals.map((goal) => (
              <div key={goal.id} className="border-b border-slate-100 pb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">{goal.title}</span>
                  <span className="text-xs font-semibold">{Math.round(goal.progress)}%</span>
                </div>
                <Progress 
                  value={goal.progress} 
                  className="h-2 w-full bg-slate-100"
                />
              </div>
            ))
          ) : (
            <div className="text-sm text-slate-500 text-center py-2">
              No goals yet. Add some to get started!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalSummary;
