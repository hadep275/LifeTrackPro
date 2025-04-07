import { Card, CardContent } from "@/components/ui/card";
import { Task } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";

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
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <Card className="bg-white shadow-sm border border-slate-200">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Tasks</h3>
          <button 
            onClick={onViewAll}
            className="text-primary-dark text-sm hover:underline"
          >
            View All
          </button>
        </div>
        <div className="space-y-3">
          {displayTasks.length > 0 ? (
            displayTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between py-2 border-b border-slate-100">
                <div className="flex items-center">
                  <Checkbox 
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={(checked) => onToggleTask(task.id, checked as boolean)}
                    className="h-4 w-4 text-primary-dark rounded border-slate-300"
                  />
                  <label 
                    htmlFor={`task-${task.id}`}
                    className={`ml-2 text-sm font-medium ${task.completed ? 'line-through text-slate-400' : ''}`}
                  >
                    {task.title}
                  </label>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${getPriorityClass(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
            ))
          ) : (
            <div className="text-sm text-slate-500 text-center py-2">
              No tasks yet. Add some to get started!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskSummary;
