import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Habit } from "@shared/schema";

const Habits = () => {
  const [habits, setHabits] = useLocalStorage<Habit[]>("habits", []);
  const [newHabit, setNewHabit] = useState<Omit<Habit, "id" | "completedDays">>({
    title: "",
    frequency: "daily"
  });
  
  const addHabit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const habit: Habit = {
      id: Date.now(),
      title: newHabit.title,
      frequency: newHabit.frequency,
      completedDays: []
    };
    
    setHabits([...habits, habit]);
    
    // Reset form
    setNewHabit({
      title: "",
      frequency: "daily"
    });
  };
  
  const deleteHabit = (id: number) => {
    setHabits(habits.filter(habit => habit.id !== id));
  };
  
  const toggleHabitDay = (habitId: number, day: number) => {
    setHabits(
      habits.map(habit => {
        if (habit.id === habitId) {
          const completedDays = [...habit.completedDays];
          const index = completedDays.indexOf(day);
          
          if (index === -1) {
            completedDays.push(day);
          } else {
            completedDays.splice(index, 1);
          }
          
          return {
            ...habit,
            completedDays
          };
        }
        return habit;
      })
    );
  };
  
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold mb-6">Habits</h2>
      
      {/* Add Habit Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add New Habit</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addHabit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="habitTitle">Habit Title</Label>
                <Input 
                  id="habitTitle" 
                  value={newHabit.title}
                  onChange={(e) => setNewHabit({...newHabit, title: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="habitFrequency">Frequency</Label>
                <Select 
                  value={newHabit.frequency}
                  onValueChange={(value) => setNewHabit({...newHabit, frequency: value})}
                >
                  <SelectTrigger id="habitFrequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button type="submit">Add Habit</Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Habits List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Habits</CardTitle>
        </CardHeader>
        <CardContent>
          {habits.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              You don't have any habits yet. Add one above!
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {habits.map((habit) => (
                <li key={habit.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div className="mb-3 sm:mb-0">
                      <h4 className="font-medium mb-1">{habit.title}</h4>
                      <p className="text-sm text-slate-500">{habit.frequency}</p>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="flex space-x-2 mr-4">
                        {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                          <button
                            key={day}
                            onClick={() => toggleHabitDay(habit.id, day)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs border ${
                              habit.completedDays.includes(day)
                                ? 'bg-primary-light text-white border-primary-dark'
                                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                            }`}
                            type="button"
                          >
                            <span>{['S', 'M', 'T', 'W', 'T', 'F', 'S'][day - 1]}</span>
                          </button>
                        ))}
                      </div>
                      
                      <Button
                        variant="ghost"
                        onClick={() => deleteHabit(habit.id)}
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

export default Habits;
