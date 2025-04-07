import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTaskSchema, 
  insertHabitSchema,
  insertGoalSchema,
  insertFinancesSchema,
  insertExpenseCategorySchema,
  insertFinancialGoalSchema,
  insertFinancialAccountSchema,
  insertInvestmentSchema,
  insertTransactionSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get("/api/users/default", async (req, res) => {
    try {
      // Check if default user exists
      let user = await storage.getUserByUsername("default");
      
      // If not, create it
      if (!user) {
        user = await storage.createUser({
          username: "default",
          password: "password123", // This is just a demo user
          email: "default@example.com",
          theme: "system"
        });
        console.log("Created default user with ID:", user.id);
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching/creating default user:", error);
      res.status(500).json({ message: "Failed to fetch/create default user" });
    }
  });

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
  app.get("/api/finances", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : 1;
      console.log(`DEBUG: GET /api/finances - Fetching finances for userId: ${userId}`);
      
      const finances = await storage.getFinances(userId);
      
      if (!finances) {
        console.log(`DEBUG: GET /api/finances - No finances found for userId: ${userId}`);
        return res.status(404).json({ message: "Finances not found" });
      }
      
      console.log(`DEBUG: GET /api/finances - Successfully retrieved finances for userId: ${userId}, financesId: ${finances.id}`);
      res.json(finances);
    } catch (error) {
      console.error("DEBUG: GET /api/finances - Error:", error);
      res.status(500).json({ message: "Failed to fetch finances", error: String(error) });
    }
  });

  app.post("/api/finances", async (req, res) => {
    try {
      console.log("DEBUG: Creating finances request body:", JSON.stringify(req.body));
      const financesData = insertFinancesSchema.parse(req.body);
      console.log("DEBUG: Parsed finances data:", JSON.stringify(financesData));
      const finances = await storage.createFinances(financesData);
      res.status(201).json(finances);
    } catch (error) {
      console.error("DEBUG: Error creating finances:", error);
      if (error instanceof z.ZodError) {
        console.error("DEBUG: Zod validation error:", JSON.stringify(error.errors));
        res.status(400).json({ message: "Invalid finances data", errors: error.errors });
      } else {
        console.error("DEBUG: Unknown error:", error instanceof Error ? error.message : String(error));
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
  
  // Financial Goals routes
  app.get("/api/financial-goals/:financesId", async (req, res) => {
    try {
      const financesId = parseInt(req.params.financesId);
      const goals = await storage.getFinancialGoals(financesId);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch financial goals" });
    }
  });

  app.post("/api/financial-goals", async (req, res) => {
    try {
      const goalData = insertFinancialGoalSchema.parse(req.body);
      const goal = await storage.createFinancialGoal(goalData);
      res.status(201).json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid financial goal data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create financial goal" });
      }
    }
  });

  app.put("/api/financial-goals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const goalData = insertFinancialGoalSchema.parse(req.body);
      const goal = await storage.updateFinancialGoal(id, goalData);
      if (!goal) {
        return res.status(404).json({ message: "Financial goal not found" });
      }
      res.json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid financial goal data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update financial goal" });
      }
    }
  });

  app.delete("/api/financial-goals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteFinancialGoal(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete financial goal" });
    }
  });
  
  // Financial Accounts routes
  app.get("/api/financial-accounts/:financesId", async (req, res) => {
    try {
      const financesId = parseInt(req.params.financesId);
      const accounts = await storage.getFinancialAccounts(financesId);
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch financial accounts" });
    }
  });

  app.post("/api/financial-accounts", async (req, res) => {
    try {
      const accountData = insertFinancialAccountSchema.parse(req.body);
      const account = await storage.createFinancialAccount(accountData);
      res.status(201).json(account);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid financial account data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create financial account" });
      }
    }
  });

  app.put("/api/financial-accounts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const accountData = insertFinancialAccountSchema.parse(req.body);
      const account = await storage.updateFinancialAccount(id, accountData);
      if (!account) {
        return res.status(404).json({ message: "Financial account not found" });
      }
      res.json(account);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid financial account data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update financial account" });
      }
    }
  });

  app.delete("/api/financial-accounts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteFinancialAccount(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete financial account" });
    }
  });
  
  // Investments routes
  app.get("/api/investments/:financesId", async (req, res) => {
    try {
      const financesId = parseInt(req.params.financesId);
      const investments = await storage.getInvestments(financesId);
      res.json(investments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch investments" });
    }
  });

  app.post("/api/investments", async (req, res) => {
    try {
      const investmentData = insertInvestmentSchema.parse(req.body);
      const investment = await storage.createInvestment(investmentData);
      res.status(201).json(investment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid investment data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create investment" });
      }
    }
  });

  app.put("/api/investments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const investmentData = insertInvestmentSchema.parse(req.body);
      const investment = await storage.updateInvestment(id, investmentData);
      if (!investment) {
        return res.status(404).json({ message: "Investment not found" });
      }
      res.json(investment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid investment data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update investment" });
      }
    }
  });

  app.delete("/api/investments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteInvestment(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete investment" });
    }
  });
  
  // Financial Transactions routes
  app.get("/api/financial-transactions/:financesId", async (req, res) => {
    try {
      const financesId = parseInt(req.params.financesId);
      const accountId = req.query.accountId ? parseInt(req.query.accountId as string) : undefined;
      const transactions = await storage.getFinancialTransactions(financesId, accountId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch financial transactions" });
    }
  });

  app.post("/api/financial-transactions", async (req, res) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createFinancialTransaction(transactionData);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create financial transaction" });
      }
    }
  });

  app.put("/api/financial-transactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const transactionData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.updateFinancialTransaction(id, transactionData);
      if (!transaction) {
        return res.status(404).json({ message: "Financial transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update financial transaction" });
      }
    }
  });

  app.delete("/api/financial-transactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteFinancialTransaction(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete financial transaction" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
