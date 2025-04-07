import { 
  User, InsertUser, 
  Task, InsertTask,
  Habit, InsertHabit,
  Goal, InsertGoal,
  Finances, InsertFinances,
  ExpenseCategory, InsertExpenseCategory,
  users, tasks, habits, goals, finances, expenseCategories
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Task methods
  getTasks(userId: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: InsertTask): Promise<Task | undefined>;
  deleteTask(id: number): Promise<void>;
  
  // Habit methods
  getHabits(userId: number): Promise<Habit[]>;
  getHabit(id: number): Promise<Habit | undefined>;
  createHabit(habit: InsertHabit): Promise<Habit>;
  updateHabit(id: number, habit: InsertHabit): Promise<Habit | undefined>;
  deleteHabit(id: number): Promise<void>;
  
  // Goal methods
  getGoals(userId: number): Promise<Goal[]>;
  getGoal(id: number): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, goal: InsertGoal): Promise<Goal | undefined>;
  deleteGoal(id: number): Promise<void>;
  
  // Finances methods
  getFinances(userId: number): Promise<Finances | undefined>;
  createFinances(finances: InsertFinances): Promise<Finances>;
  updateFinances(id: number, finances: InsertFinances): Promise<Finances | undefined>;
  
  // Expense Categories methods
  getExpenseCategories(financesId: number): Promise<ExpenseCategory[]>;
  getExpenseCategory(id: number): Promise<ExpenseCategory | undefined>;
  createExpenseCategory(category: InsertExpenseCategory): Promise<ExpenseCategory>;
  updateExpenseCategory(id: number, category: InsertExpenseCategory): Promise<ExpenseCategory | undefined>;
  deleteExpenseCategory(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Task methods
  async getTasks(userId: number): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.userId, userId));
  }
  
  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }
  
  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values(insertTask).returning();
    return task;
  }
  
  async updateTask(id: number, insertTask: InsertTask): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set(insertTask)
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }
  
  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }
  
  // Habit methods
  async getHabits(userId: number): Promise<Habit[]> {
    return await db.select().from(habits).where(eq(habits.userId, userId));
  }
  
  async getHabit(id: number): Promise<Habit | undefined> {
    const [habit] = await db.select().from(habits).where(eq(habits.id, id));
    return habit;
  }
  
  async createHabit(insertHabit: InsertHabit): Promise<Habit> {
    const [habit] = await db.insert(habits).values(insertHabit).returning();
    return habit;
  }
  
  async updateHabit(id: number, insertHabit: InsertHabit): Promise<Habit | undefined> {
    const [updatedHabit] = await db
      .update(habits)
      .set(insertHabit)
      .where(eq(habits.id, id))
      .returning();
    return updatedHabit;
  }
  
  async deleteHabit(id: number): Promise<void> {
    await db.delete(habits).where(eq(habits.id, id));
  }
  
  // Goal methods
  async getGoals(userId: number): Promise<Goal[]> {
    return await db.select().from(goals).where(eq(goals.userId, userId));
  }
  
  async getGoal(id: number): Promise<Goal | undefined> {
    const [goal] = await db.select().from(goals).where(eq(goals.id, id));
    return goal;
  }
  
  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const [goal] = await db.insert(goals).values(insertGoal).returning();
    return goal;
  }
  
  async updateGoal(id: number, insertGoal: InsertGoal): Promise<Goal | undefined> {
    const [updatedGoal] = await db
      .update(goals)
      .set(insertGoal)
      .where(eq(goals.id, id))
      .returning();
    return updatedGoal;
  }
  
  async deleteGoal(id: number): Promise<void> {
    await db.delete(goals).where(eq(goals.id, id));
  }
  
  // Finances methods
  async getFinances(userId: number): Promise<Finances | undefined> {
    // Get the finances record
    const [financesRecord] = await db
      .select()
      .from(finances)
      .where(eq(finances.userId, userId));
    
    if (!financesRecord) {
      return undefined;
    }
    
    // Get associated expense categories
    const categories = await db
      .select()
      .from(expenseCategories)
      .where(eq(expenseCategories.financesId, financesRecord.id));
    
    return {
      ...financesRecord,
      expenseCategories: categories
    };
  }
  
  async createFinances(insertFinances: InsertFinances): Promise<Finances> {
    const [financesRecord] = await db
      .insert(finances)
      .values(insertFinances)
      .returning();
    
    return {
      ...financesRecord,
      expenseCategories: []
    };
  }
  
  async updateFinances(id: number, insertFinances: InsertFinances): Promise<Finances | undefined> {
    const [updatedFinances] = await db
      .update(finances)
      .set(insertFinances)
      .where(eq(finances.id, id))
      .returning();
    
    if (!updatedFinances) {
      return undefined;
    }
    
    // Get associated expense categories
    const categories = await db
      .select()
      .from(expenseCategories)
      .where(eq(expenseCategories.financesId, id));
    
    return {
      ...updatedFinances,
      expenseCategories: categories
    };
  }
  
  // Expense Categories methods
  async getExpenseCategories(financesId: number): Promise<ExpenseCategory[]> {
    return await db
      .select()
      .from(expenseCategories)
      .where(eq(expenseCategories.financesId, financesId));
  }
  
  async getExpenseCategory(id: number): Promise<ExpenseCategory | undefined> {
    const [category] = await db
      .select()
      .from(expenseCategories)
      .where(eq(expenseCategories.id, id));
    return category;
  }
  
  async createExpenseCategory(insertCategory: InsertExpenseCategory): Promise<ExpenseCategory> {
    const [category] = await db
      .insert(expenseCategories)
      .values(insertCategory)
      .returning();
    
    // Update the total expenses in the associated finances
    const [financesRecord] = await db
      .select()
      .from(finances)
      .where(eq(finances.id, category.financesId));
    
    if (financesRecord) {
      const categories = await this.getExpenseCategories(category.financesId);
      const totalExpenses = categories.reduce((sum, cat) => sum + Number(cat.amount), 0);
      
      await db
        .update(finances)
        .set({ expenses: totalExpenses.toString() })
        .where(eq(finances.id, financesRecord.id));
    }
    
    return category;
  }
  
  async updateExpenseCategory(id: number, insertCategory: InsertExpenseCategory): Promise<ExpenseCategory | undefined> {
    const [updatedCategory] = await db
      .update(expenseCategories)
      .set(insertCategory)
      .where(eq(expenseCategories.id, id))
      .returning();
    
    if (!updatedCategory) {
      return undefined;
    }
    
    // Update the total expenses in the associated finances
    const [financesRecord] = await db
      .select()
      .from(finances)
      .where(eq(finances.id, updatedCategory.financesId));
    
    if (financesRecord) {
      const categories = await this.getExpenseCategories(updatedCategory.financesId);
      const totalExpenses = categories.reduce((sum, cat) => sum + Number(cat.amount), 0);
      
      await db
        .update(finances)
        .set({ expenses: totalExpenses.toString() })
        .where(eq(finances.id, financesRecord.id));
    }
    
    return updatedCategory;
  }
  
  async deleteExpenseCategory(id: number): Promise<void> {
    // Get the category before deleting it
    const [category] = await db
      .select()
      .from(expenseCategories)
      .where(eq(expenseCategories.id, id));
    
    if (!category) {
      return;
    }
    
    // Delete the category
    await db.delete(expenseCategories).where(eq(expenseCategories.id, id));
    
    // Update the total expenses in the associated finances
    const financesId = category.financesId;
    const [financesRecord] = await db
      .select()
      .from(finances)
      .where(eq(finances.id, financesId));
    
    if (financesRecord) {
      const categories = await this.getExpenseCategories(financesId);
      const totalExpenses = categories.reduce((sum, cat) => sum + Number(cat.amount), 0);
      
      await db
        .update(finances)
        .set({ expenses: totalExpenses.toString() })
        .where(eq(finances.id, financesId));
    }
  }
}

// Export an instance of the DatabaseStorage class
export const storage = new DatabaseStorage();
