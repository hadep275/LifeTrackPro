import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Task } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { CheckCheck } from "lucide-react";

interface TaskSummaryProps {
  tasks: Task[];
  onToggleTask: (taskId: number, completed: boolean) => void;
  onViewAll: () => void;
}

const TaskSummary = ({ tasks, onToggleTask, onViewAll }: TaskSummaryProps) => {
  const displayTasks = tasks.slice(0, 3);

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/10 text-destructive dark:bg-destructive/20';
      case 'medium':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-100';
      case 'low':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-100';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <CheckCheck className="h-5 w-5 text-primary" />
            Tasks
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayTasks.length > 0 ? (
          displayTasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex items-center">
                <Checkbox 
                  id={`task-${task.id}`}
                  checked={task.completed}
                  onCheckedChange={(checked) => onToggleTask(task.id, checked as boolean)}
                />
                <label 
                  htmlFor={`task-${task.id}`}
                  className={`ml-2 text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                >
                  {task.title}
                </label>
              </div>
              <span className={`text-xs px-2 py-1 rounded-md ${getPriorityClass(task.priority)}`}>
                {task.priority}
              </span>
            </div>
          ))
        ) : (
          <div className="text-sm text-muted-foreground text-center py-4">
            No tasks yet. Add some to get started!
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" onClick={onViewAll} className="w-full">
          View All Tasks
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TaskSummary;
