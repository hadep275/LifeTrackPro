import { pgTable, text, serial, integer, boolean, date, json, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// User Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  theme: text("theme").default("system"),
});

export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
  habits: many(habits),
  goals: many(goals),
  finances: many(finances),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  theme: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Task Schema
export const taskPriorityEnum = pgEnum("task_priority", ["low", "medium", "high"]);

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: text("due_date").notNull(),
  priority: taskPriorityEnum("priority").notNull().default("medium"),
  completed: boolean("completed").notNull().default(false),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
}));

export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true, updatedAt: true });
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
  description: text("description"),
  targetDate: text("target_date").notNull(),
  milestones: json("milestones").$type<Milestone[]>().notNull(),
  progress: numeric("progress").notNull().default("0"),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const goalsRelations = relations(goals, ({ one }) => ({
  user: one(users, {
    fields: [goals.userId],
    references: [users.id],
  }),
}));

export const insertGoalSchema = createInsertSchema(goals).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;

// Habit Schema
export const frequencyEnum = pgEnum("frequency", ["daily", "weekly"]);

export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  frequency: frequencyEnum("frequency").notNull().default("daily"),
  completedDays: json("completed_days").$type<number[]>().notNull(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const habitsRelations = relations(habits, ({ one }) => ({
  user: one(users, {
    fields: [habits.userId],
    references: [users.id],
  }),
}));

export const insertHabitSchema = createInsertSchema(habits).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type Habit = typeof habits.$inferSelect;

// Finances Schema
export const finances = pgTable("finances", {
  id: serial("id").primaryKey(),
  income: numeric("income").notNull().default("0"),
  expenses: numeric("expenses").notNull().default("0"),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const financesRelations = relations(finances, ({ one, many }) => ({
  user: one(users, {
    fields: [finances.userId],
    references: [users.id],
  }),
  expenseCategories: many(expenseCategories),
}));

export const insertFinancesSchema = createInsertSchema(finances).omit({ id: true, expenses: true, createdAt: true, updatedAt: true });
export type InsertFinances = z.infer<typeof insertFinancesSchema>;

// Expense Category Schema
export const expenseCategories = pgTable("expense_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  amount: numeric("amount").notNull().default("0"),
  financesId: integer("finances_id").notNull().references(() => finances.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const expenseCategoriesRelations = relations(expenseCategories, ({ one }) => ({
  finances: one(finances, {
    fields: [expenseCategories.financesId],
    references: [finances.id],
  }),
}));

export const insertExpenseCategorySchema = createInsertSchema(expenseCategories).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertExpenseCategory = z.infer<typeof insertExpenseCategorySchema>;
export type ExpenseCategory = typeof expenseCategories.$inferSelect;

// Extended Finances type with expense categories
export interface Finances {
  id: number;
  income: string | number;
  expenses: string | number;
  userId: number;
  expenseCategories: ExpenseCategory[];
  createdAt?: Date;
  updatedAt?: Date;
}
