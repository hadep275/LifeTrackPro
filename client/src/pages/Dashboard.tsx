import { useEffect } from "react";
import { useLocation } from "wouter";
import TaskSummary from "@/components/dashboard/TaskSummary";
import HabitSummary from "@/components/dashboard/HabitSummary";
import GoalSummary from "@/components/dashboard/GoalSummary";
import FinanceSummary from "@/components/dashboard/FinanceSummary";
import CalendarView from "@/components/dashboard/CalendarView";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Task, Habit, Goal, Finances } from "@shared/schema";

const Dashboard = () => {
  const [, setLocation] = useLocation();
  const [tasks, setTasks] = useLocalStorage<Task[]>("tasks", []);
  const [habits] = useLocalStorage<Habit[]>("habits", []);
  const [goals] = useLocalStorage<Goal[]>("goals", []);
  const [finances] = useLocalStorage<Finances>("finances", {
    id: 1,
    income: 0,
    expenses: 0,
    expenseCategories: []
  });

  // Initialize finances if not already set
  useEffect(() => {
    if (!localStorage.getItem('finances')) {
      localStorage.setItem('finances', JSON.stringify({
        id: 1,
        income: 0,
        expenses: 0,
        expenseCategories: []
      }));
    }
  }, []);

  const handleToggleTask = (taskId: number, completed: boolean) => {
    setTasks(
      tasks.map(task => 
        task.id === taskId ? { ...task, completed } : task
      )
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Tasks Summary */}
        <TaskSummary 
          tasks={tasks} 
          onToggleTask={handleToggleTask}
          onViewAll={() => setLocation("/tasks")}
        />
        
        {/* Habits Summary */}
        <HabitSummary 
          habits={habits}
          onViewAll={() => setLocation("/habits")}
        />
        
        {/* Goals Summary */}
        <GoalSummary 
          goals={goals}
          onViewAll={() => setLocation("/goals")}
        />
        
        {/* Financial Summary */}
        <FinanceSummary 
          finances={finances}
          onViewAll={() => setLocation("/finances")}
        />
        
        {/* Calendar */}
        <div className="md:col-span-2">
          <CalendarView tasks={tasks} goals={goals} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
