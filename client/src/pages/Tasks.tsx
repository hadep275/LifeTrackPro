import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Task } from "@shared/schema";

const Tasks = () => {
  const [tasks, setTasks] = useLocalStorage<Task[]>("tasks", []);
  const [newTask, setNewTask] = useState<Omit<Task, "id">>({
    title: "",
    dueDate: new Date().toISOString().split("T")[0],
    priority: "medium",
    completed: false
  });
  
  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    
    const task: Task = {
      id: Date.now(),
      ...newTask
    };
    
    setTasks([...tasks, task]);
    
    // Reset form
    setNewTask({
      title: "",
      dueDate: new Date().toISOString().split("T")[0],
      priority: "medium",
      completed: false
    });
  };
  
  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };
  
  const toggleTaskCompletion = (id: number, completed: boolean) => {
    setTasks(
      tasks.map(task =>
        task.id === id ? { ...task, completed } : task
      )
    );
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const sortedTasks = [...tasks].sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );
  
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold mb-6">Tasks</h2>
      
      {/* Add Task Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add New Task</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addTask} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="taskTitle">Task Title</Label>
                <Input 
                  id="taskTitle" 
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="taskDueDate">Due Date</Label>
                <Input 
                  id="taskDueDate" 
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="taskPriority">Priority</Label>
                <Select 
                  value={newTask.priority}
                  onValueChange={(value) => setNewTask({...newTask, priority: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button type="submit">Add Task</Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Task List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              You don't have any tasks yet. Add one above!
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {sortedTasks.map((task) => (
                <li key={task.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Checkbox 
                        id={`task-list-${task.id}`}
                        checked={task.completed}
                        onCheckedChange={(checked) => toggleTaskCompletion(task.id, checked as boolean)}
                      />
                      <label 
                        htmlFor={`task-list-${task.id}`} 
                        className={`ml-3 font-medium ${task.completed ? 'line-through text-slate-400' : ''}`}
                      >
                        {task.title}
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span 
                        className={`text-sm px-2 py-1 rounded ${
                          task.priority === 'high' 
                            ? 'bg-red-100 text-red-800' 
                            : task.priority === 'medium' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {task.priority}
                      </span>
                      
                      <span className="text-sm text-slate-500">
                        {formatDate(task.dueDate)}
                      </span>
                      
                      <Button
                        variant="ghost"
                        onClick={() => deleteTask(task.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 h-auto"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Tasks;
