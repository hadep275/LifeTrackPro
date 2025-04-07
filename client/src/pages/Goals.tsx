import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Goal, Milestone } from "@shared/schema";

const Goals = () => {
  const [goals, setGoals] = useLocalStorage<Goal[]>("goals", []);
  const [newGoal, setNewGoal] = useState({
    title: "",
    targetDate: "",
    milestonesText: ""
  });
  
  const addGoal = (e: React.FormEvent) => {
    e.preventDefault();
    
    const milestones: Milestone[] = newGoal.milestonesText
      .split('\n')
      .filter(text => text.trim() !== '')
      .map(text => ({
        id: Date.now() + Math.floor(Math.random() * 1000),
        text: text.trim(),
        completed: false
      }));
    
    const goal: Goal = {
      id: Date.now(),
      title: newGoal.title,
      targetDate: newGoal.targetDate,
      milestones: milestones,
      progress: 0
    };
    
    setGoals([...goals, goal]);
    
    // Reset form
    setNewGoal({
      title: "",
      targetDate: "",
      milestonesText: ""
    });
  };
  
  const deleteGoal = (id: number) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };
  
  const updateGoalProgress = (goalId: number, milestoneId: number, completed: boolean) => {
    setGoals(
      goals.map(goal => {
        if (goal.id === goalId) {
          const updatedMilestones = goal.milestones.map(milestone => 
            milestone.id === milestoneId ? { ...milestone, completed } : milestone
          );
          
          const totalMilestones = updatedMilestones.length;
          const completedCount = updatedMilestones.filter(m => m.completed).length;
          const progress = totalMilestones > 0 ? (completedCount / totalMilestones) * 100 : 0;
          
          return {
            ...goal,
            milestones: updatedMilestones,
            progress
          };
        }
        return goal;
      })
    );
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };
  
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold mb-6">Goals</h2>
      
      {/* Add Goal Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add New Goal</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addGoal} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="goalTitle">Goal Title</Label>
                <Input 
                  id="goalTitle" 
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="goalTarget">Target Date</Label>
                <Input 
                  id="goalTarget" 
                  type="date"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal({...newGoal, targetDate: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="goalMilestones">Milestones (one per line)</Label>
              <Textarea 
                id="goalMilestones"
                rows={3}
                value={newGoal.milestonesText}
                onChange={(e) => setNewGoal({...newGoal, milestonesText: e.target.value})}
                placeholder="Enter each milestone on a new line"
              />
            </div>
            
            <Button type="submit">Add Goal</Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Goals List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Goals</CardTitle>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              You don't have any goals yet. Add one above!
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {goals.map((goal) => (
                <div key={goal.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{goal.title}</h4>
                      <p className="text-sm text-slate-500">Target: {formatDate(goal.targetDate)}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold">{Math.round(goal.progress)}%</span>
                      <Button
                        variant="ghost"
                        onClick={() => deleteGoal(goal.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 h-auto"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  
                  <Progress 
                    value={goal.progress} 
                    className="h-2 w-full bg-slate-100 mb-4"
                  />
                  
                  <div>
                    <h5 className="text-sm font-medium mb-2">Milestones</h5>
                    <ul className="space-y-2">
                      {goal.milestones.map((milestone) => (
                        <li key={milestone.id} className="flex items-center">
                          <Checkbox 
                            id={`milestone-${goal.id}-${milestone.id}`}
                            checked={milestone.completed}
                            onCheckedChange={(checked) => 
                              updateGoalProgress(goal.id, milestone.id, checked as boolean)
                            }
                          />
                          <label 
                            htmlFor={`milestone-${goal.id}-${milestone.id}`} 
                            className={`ml-3 text-sm ${milestone.completed ? 'line-through text-slate-400' : ''}`}
                          >
                            {milestone.text}
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Goals;
