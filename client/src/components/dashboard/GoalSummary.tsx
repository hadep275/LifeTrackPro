import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Goal as GoalIcon } from "lucide-react";
import { Goal } from "@shared/schema";

interface GoalSummaryProps {
  goals: Goal[];
  onViewAll: () => void;
}

const GoalSummary = ({ goals, onViewAll }: GoalSummaryProps) => {
  const displayGoals = goals.slice(0, 2);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <GoalIcon className="h-5 w-5 text-primary" />
            Goals
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayGoals.length > 0 ? (
          displayGoals.map((goal) => (
            <div key={goal.id} className="border-b border-border pb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">{goal.title}</span>
                <span className="text-xs font-semibold">{Math.round(Number(goal.progress))}%</span>
              </div>
              <Progress 
                value={Number(goal.progress)} 
                className="h-2 w-full"
              />
            </div>
          ))
        ) : (
          <div className="text-sm text-muted-foreground text-center py-4">
            No goals yet. Add some to get started!
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" onClick={onViewAll} className="w-full">
          View All Goals
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GoalSummary;
