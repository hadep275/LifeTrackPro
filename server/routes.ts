import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTaskSchema, 
  insertHabitSchema,
  insertGoalSchema,
  insertFinancesSchema,
  insertExpenseCategorySchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Tasks routes
  app.get("/api/tasks", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : 1;
      const tasks = await storage.getTasks(userId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid task data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create task" });
      }
    }
  });

  app.put("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.updateTask(id, taskData);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid task data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update task" });
      }
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTask(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Habits routes
  app.get("/api/habits", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : 1;
      const habits = await storage.getHabits(userId);
      res.json(habits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch habits" });
    }
  });

  app.post("/api/habits", async (req, res) => {
    try {
      const habitData = insertHabitSchema.parse(req.body);
      const habit = await storage.createHabit(habitData);
      res.status(201).json(habit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid habit data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create habit" });
      }
    }
  });

  app.put("/api/habits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const habitData = insertHabitSchema.parse(req.body);
      const habit = await storage.updateHabit(id, habitData);
      if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
      }
      res.json(habit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid habit data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update habit" });
      }
    }
  });

  app.delete("/api/habits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteHabit(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete habit" });
    }
  });

  // Goals routes
  app.get("/api/goals", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : 1;
      const goals = await storage.getGoals(userId);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  app.post("/api/goals", async (req, res) => {
    try {
      const goalData = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal(goalData);
      res.status(201).json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid goal data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create goal" });
      }
    }
  });

  app.put("/api/goals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const goalData = insertGoalSchema.parse(req.body);
      const goal = await storage.updateGoal(id, goalData);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      res.json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid goal data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update goal" });
      }
    }
  });

  app.delete("/api/goals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteGoal(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete goal" });
    }
  });

  // Finances routes
  app.get("/api/finances/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const finances = await storage.getFinances(userId);
      if (!finances) {
        return res.status(404).json({ message: "Finances not found" });
      }
      res.json(finances);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch finances" });
    }
  });

  app.post("/api/finances", async (req, res) => {
    try {
      const financesData = insertFinancesSchema.parse(req.body);
      const finances = await storage.createFinances(financesData);
      res.status(201).json(finances);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid finances data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create finances" });
      }
    }
  });

  app.put("/api/finances/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const financesData = insertFinancesSchema.parse(req.body);
      const finances = await storage.updateFinances(id, financesData);
      if (!finances) {
        return res.status(404).json({ message: "Finances not found" });
      }
      res.json(finances);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid finances data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update finances" });
      }
    }
  });

  // Expense Categories routes
  app.get("/api/expense-categories/:financesId", async (req, res) => {
    try {
      const financesId = parseInt(req.params.financesId);
      const categories = await storage.getExpenseCategories(financesId);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expense categories" });
    }
  });

  app.post("/api/expense-categories", async (req, res) => {
    try {
      const categoryData = insertExpenseCategorySchema.parse(req.body);
      const category = await storage.createExpenseCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid category data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create expense category" });
      }
    }
  });

  app.put("/api/expense-categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const categoryData = insertExpenseCategorySchema.parse(req.body);
      const category = await storage.updateExpenseCategory(id, categoryData);
      if (!category) {
        return res.status(404).json({ message: "Expense category not found" });
      }
      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid category data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update expense category" });
      }
    }
  });

  app.delete("/api/expense-categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteExpenseCategory(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete expense category" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
