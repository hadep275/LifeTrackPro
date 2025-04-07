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

// Financial Goal Type Enum
export const financialGoalTypeEnum = pgEnum("financial_goal_type", [
  "emergency_fund", 
  "retirement", 
  "house_downpayment", 
  "car", 
  "education", 
  "travel", 
  "debt_payoff", 
  "other"
]);

// Financial Account Type Enum
export const accountTypeEnum = pgEnum("account_type", [
  "checking", 
  "savings", 
  "investment", 
  "retirement", 
  "credit_card", 
  "loan", 
  "other"
]);

// Investment Type Enum
export const investmentTypeEnum = pgEnum("investment_type", [
  "stocks", 
  "bonds", 
  "mutual_funds", 
  "etfs", 
  "real_estate", 
  "cryptocurrency", 
  "other"
]);

// Recurring Bill Frequency Enum
export const billFrequencyEnum = pgEnum("bill_frequency", [
  "weekly",
  "biweekly",
  "monthly",
  "quarterly",
  "yearly",
  "custom"
]);

// Finances Schema
export const finances = pgTable("finances", {
  id: serial("id").primaryKey(),
  income: numeric("income").notNull().default("0"),
  expenses: numeric("expenses").notNull().default("0"),
  savings: numeric("savings").notNull().default("0"),
  netWorth: numeric("net_worth").notNull().default("0"),
  retirementAge: integer("retirement_age").default(65),
  currentAge: integer("current_age"),
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
  financialGoals: many(financialGoals),
  accounts: many(financialAccounts),
  investments: many(investments),
  transactions: many(financialTransactions),
  recurringBills: many(recurringBills),
}));

export const insertFinancesSchema = createInsertSchema(finances).omit({ 
  id: true,
  createdAt: true, 
  updatedAt: true 
});
export type InsertFinances = z.infer<typeof insertFinancesSchema>;

// Expense Category Schema
export const expenseCategories = pgTable("expense_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  amount: numeric("amount").notNull().default("0"),
  color: text("color").default("#3B82F6"),
  icon: text("icon"),
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

export const insertExpenseCategorySchema = createInsertSchema(expenseCategories).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertExpenseCategory = z.infer<typeof insertExpenseCategorySchema>;
export type ExpenseCategory = typeof expenseCategories.$inferSelect;

// Financial Goals Schema
export const financialGoals = pgTable("financial_goals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  targetAmount: numeric("target_amount").notNull(),
  currentAmount: numeric("current_amount").notNull().default("0"),
  targetDate: text("target_date").notNull(),
  type: financialGoalTypeEnum("type").notNull(),
  relatedTaskIds: json("related_task_ids").$type<number[]>().default([]),
  relatedGoalIds: json("related_goal_ids").$type<number[]>().default([]),
  linkedToTaskSchedule: boolean("linked_to_task_schedule").default(false),
  color: text("color").default("#3B82F6"),
  isArchived: boolean("is_archived").default(false),
  financesId: integer("finances_id").notNull().references(() => finances.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const financialGoalsRelations = relations(financialGoals, ({ one }) => ({
  finances: one(finances, {
    fields: [financialGoals.financesId],
    references: [finances.id],
  }),
}));

export const insertFinancialGoalSchema = createInsertSchema(financialGoals).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertFinancialGoal = z.infer<typeof insertFinancialGoalSchema>;
export type FinancialGoal = typeof financialGoals.$inferSelect;

// Financial Accounts Schema
export const financialAccounts = pgTable("financial_accounts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: accountTypeEnum("type").notNull(),
  balance: numeric("balance").notNull().default("0"),
  interestRate: numeric("interest_rate").default("0"),
  accountNumber: text("account_number"),
  institution: text("institution"),
  includeInNetWorth: boolean("include_in_net_worth").default(true),
  color: text("color").default("#3B82F6"),
  icon: text("icon"),
  financesId: integer("finances_id").notNull().references(() => finances.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const financialAccountsRelations = relations(financialAccounts, ({ one, many }) => ({
  finances: one(finances, {
    fields: [financialAccounts.financesId],
    references: [finances.id],
  }),
  transactions: many(financialTransactions),
}));

export const insertFinancialAccountSchema = createInsertSchema(financialAccounts).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertFinancialAccount = z.infer<typeof insertFinancialAccountSchema>;
export type FinancialAccount = typeof financialAccounts.$inferSelect;

// Investments Schema
export const investments = pgTable("investments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: investmentTypeEnum("type").notNull(),
  value: numeric("value").notNull().default("0"),
  purchasePrice: numeric("purchase_price").notNull().default("0"),
  purchaseDate: text("purchase_date"),
  shares: numeric("shares"),
  symbol: text("symbol"),
  notes: text("notes"),
  color: text("color").default("#3B82F6"),
  icon: text("icon"),
  financesId: integer("finances_id").notNull().references(() => finances.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const investmentsRelations = relations(investments, ({ one }) => ({
  finances: one(finances, {
    fields: [investments.financesId],
    references: [finances.id],
  }),
}));

export const insertInvestmentSchema = createInsertSchema(investments).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertInvestment = z.infer<typeof insertInvestmentSchema>;
export type Investment = typeof investments.$inferSelect;

// Financial Transactions Schema
export const financialTransactions = pgTable("financial_transactions", {
  id: serial("id").primaryKey(),
  amount: numeric("amount").notNull(),
  date: text("date").notNull(),
  description: text("description").notNull(),
  category: text("category"),
  type: text("type").notNull(), // income, expense, transfer
  accountId: integer("account_id").references(() => financialAccounts.id, { onDelete: "set null" }),
  financesId: integer("finances_id").notNull().references(() => finances.id, { onDelete: "cascade" }),
  recurringBillId: integer("recurring_bill_id"), // Will be set up after recurringBills is defined
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const financialTransactionsRelations = relations(financialTransactions, ({ one }) => ({
  finances: one(finances, {
    fields: [financialTransactions.financesId],
    references: [finances.id],
  }),
  account: one(financialAccounts, {
    fields: [financialTransactions.accountId],
    references: [financialAccounts.id],
  }),
}));

export const insertTransactionSchema = createInsertSchema(financialTransactions).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type FinancialTransaction = typeof financialTransactions.$inferSelect;

// Recurring Bills Schema
export const recurringBills = pgTable("recurring_bills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  amount: numeric("amount").notNull(),
  description: text("description"),
  category: text("category"),
  frequency: billFrequencyEnum("frequency").notNull().default("monthly"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  dayOfMonth: integer("day_of_month"),  // For monthly bills (1-31)
  dayOfWeek: integer("day_of_week"),    // For weekly bills (0-6, Sunday to Saturday)
  recurEveryX: integer("recur_every_x"), // For custom frequency (e.g., every X days)
  autoPay: boolean("auto_pay").default(false),
  paymentMethod: text("payment_method"),
  reminderDays: integer("reminder_days").default(3), // Days before due date to remind
  color: text("color").default("#3B82F6"),
  icon: text("icon"),
  lastPaidDate: text("last_paid_date"),
  nextDueDate: text("next_due_date").notNull(),
  accountId: integer("account_id").references(() => financialAccounts.id, { onDelete: "set null" }),
  financesId: integer("finances_id").notNull().references(() => finances.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const recurringBillsRelations = relations(recurringBills, ({ one, many }) => ({
  finances: one(finances, {
    fields: [recurringBills.financesId],
    references: [finances.id],
  }),
  account: one(financialAccounts, {
    fields: [recurringBills.accountId],
    references: [financialAccounts.id],
  }),
  transactions: many(financialTransactions),
}));

export const insertRecurringBillSchema = createInsertSchema(recurringBills).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertRecurringBill = z.infer<typeof insertRecurringBillSchema>;
export type RecurringBill = typeof recurringBills.$inferSelect;

// Extended Finances type with all financial data
export interface Finances {
  id: number;
  income: string | number;
  expenses: string | number;
  savings: string | number;
  netWorth: string | number;
  retirementAge?: number;
  currentAge?: number;
  userId: number;
  expenseCategories: ExpenseCategory[];
  financialGoals?: FinancialGoal[];
  accounts?: FinancialAccount[];
  investments?: Investment[];
  transactions?: FinancialTransaction[];
  recurringBills?: RecurringBill[];
  createdAt?: Date;
  updatedAt?: Date;
}
