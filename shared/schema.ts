import { pgTable, text, serial, integer, boolean, date, json, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Task Schema
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  dueDate: text("due_date").notNull(),
  priority: text("priority").notNull(),
  completed: boolean("completed").notNull().default(false),
  userId: integer("user_id").notNull(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true });
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// Milestone Schema
export interface Milestone {
  id: number;
  text: string;
  completed: boolean;
}

// Goal Schema
export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  targetDate: text("target_date").notNull(),
  milestones: json("milestones").$type<Milestone[]>().notNull(),
  progress: numeric("progress").notNull().default("0"),
  userId: integer("user_id").notNull(),
});

export const insertGoalSchema = createInsertSchema(goals).omit({ id: true });
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;

// Habit Schema
export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  frequency: text("frequency").notNull(),
  completedDays: json("completed_days").$type<number[]>().notNull(),
  userId: integer("user_id").notNull(),
});

export const insertHabitSchema = createInsertSchema(habits).omit({ id: true });
export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type Habit = typeof habits.$inferSelect;

// Expense Category Schema
export const expenseCategories = pgTable("expense_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  amount: numeric("amount").notNull().default("0"),
  financesId: integer("finances_id").notNull(),
});

export const insertExpenseCategorySchema = createInsertSchema(expenseCategories).omit({ id: true });
export type InsertExpenseCategory = z.infer<typeof insertExpenseCategorySchema>;
export type ExpenseCategory = typeof expenseCategories.$inferSelect;

// Finances Schema
export const finances = pgTable("finances", {
  id: serial("id").primaryKey(),
  income: numeric("income").notNull().default("0"),
  expenses: numeric("expenses").notNull().default("0"),
  userId: integer("user_id").notNull(),
});

export const insertFinancesSchema = createInsertSchema(finances).omit({ id: true });
export type InsertFinances = z.infer<typeof insertFinancesSchema>;

export interface Finances {
  id: number;
  income: number;
  expenses: number;
  expenseCategories: ExpenseCategory[];
}

// User Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
