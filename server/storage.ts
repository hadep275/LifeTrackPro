import { 
  User, InsertUser, 
  Task, InsertTask,
  Habit, InsertHabit,
  Goal, InsertGoal,
  Finances, InsertFinances,
  ExpenseCategory, InsertExpenseCategory
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private habits: Map<number, Habit>;
  private goals: Map<number, Goal>;
  private financesMap: Map<number, Finances>;
  private expenseCategories: Map<number, ExpenseCategory>;
  
  private userCurrentId: number;
  private taskCurrentId: number;
  private habitCurrentId: number;
  private goalCurrentId: number;
  private financesCurrentId: number;
  private expenseCategoryCurrentId: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.habits = new Map();
    this.goals = new Map();
    this.financesMap = new Map();
    this.expenseCategories = new Map();
    
    this.userCurrentId = 1;
    this.taskCurrentId = 1;
    this.habitCurrentId = 1;
    this.goalCurrentId = 1;
    this.financesCurrentId = 1;
    this.expenseCategoryCurrentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Task methods
  async getTasks(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.userId === userId);
  }
  
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }
  
  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.taskCurrentId++;
    const task: Task = { ...insertTask, id };
    this.tasks.set(id, task);
    return task;
  }
  
  async updateTask(id: number, insertTask: InsertTask): Promise<Task | undefined> {
    const existingTask = this.tasks.get(id);
    if (!existingTask) {
      return undefined;
    }
    
    const updatedTask: Task = { ...insertTask, id };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }
  
  async deleteTask(id: number): Promise<void> {
    this.tasks.delete(id);
  }
  
  // Habit methods
  async getHabits(userId: number): Promise<Habit[]> {
    return Array.from(this.habits.values()).filter(habit => habit.userId === userId);
  }
  
  async getHabit(id: number): Promise<Habit | undefined> {
    return this.habits.get(id);
  }
  
  async createHabit(insertHabit: InsertHabit): Promise<Habit> {
    const id = this.habitCurrentId++;
    const habit: Habit = { ...insertHabit, id };
    this.habits.set(id, habit);
    return habit;
  }
  
  async updateHabit(id: number, insertHabit: InsertHabit): Promise<Habit | undefined> {
    const existingHabit = this.habits.get(id);
    if (!existingHabit) {
      return undefined;
    }
    
    const updatedHabit: Habit = { ...insertHabit, id };
    this.habits.set(id, updatedHabit);
    return updatedHabit;
  }
  
  async deleteHabit(id: number): Promise<void> {
    this.habits.delete(id);
  }
  
  // Goal methods
  async getGoals(userId: number): Promise<Goal[]> {
    return Array.from(this.goals.values()).filter(goal => goal.userId === userId);
  }
  
  async getGoal(id: number): Promise<Goal | undefined> {
    return this.goals.get(id);
  }
  
  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const id = this.goalCurrentId++;
    const goal: Goal = { ...insertGoal, id };
    this.goals.set(id, goal);
    return goal;
  }
  
  async updateGoal(id: number, insertGoal: InsertGoal): Promise<Goal | undefined> {
    const existingGoal = this.goals.get(id);
    if (!existingGoal) {
      return undefined;
    }
    
    const updatedGoal: Goal = { ...insertGoal, id };
    this.goals.set(id, updatedGoal);
    return updatedGoal;
  }
  
  async deleteGoal(id: number): Promise<void> {
    this.goals.delete(id);
  }
  
  // Finances methods
  async getFinances(userId: number): Promise<Finances | undefined> {
    const finances = Array.from(this.financesMap.values()).find(f => f.userId === userId);
    
    if (!finances) {
      return undefined;
    }
    
    // Get associated expense categories
    const categories = Array.from(this.expenseCategories.values()).filter(
      cat => cat.financesId === finances.id
    );
    
    return {
      ...finances,
      expenseCategories: categories
    };
  }
  
  async createFinances(insertFinances: InsertFinances): Promise<Finances> {
    const id = this.financesCurrentId++;
    const finances = { ...insertFinances, id, expenseCategories: [] };
    this.financesMap.set(id, finances);
    return finances;
  }
  
  async updateFinances(id: number, insertFinances: InsertFinances): Promise<Finances | undefined> {
    const existingFinances = this.financesMap.get(id);
    if (!existingFinances) {
      return undefined;
    }
    
    const categories = Array.from(this.expenseCategories.values()).filter(
      cat => cat.financesId === id
    );
    
    const updatedFinances: Finances = { 
      ...insertFinances, 
      id,
      expenseCategories: categories
    };
    
    this.financesMap.set(id, updatedFinances);
    return updatedFinances;
  }
  
  // Expense Categories methods
  async getExpenseCategories(financesId: number): Promise<ExpenseCategory[]> {
    return Array.from(this.expenseCategories.values()).filter(
      category => category.financesId === financesId
    );
  }
  
  async getExpenseCategory(id: number): Promise<ExpenseCategory | undefined> {
    return this.expenseCategories.get(id);
  }
  
  async createExpenseCategory(insertCategory: InsertExpenseCategory): Promise<ExpenseCategory> {
    const id = this.expenseCategoryCurrentId++;
    const category: ExpenseCategory = { ...insertCategory, id };
    this.expenseCategories.set(id, category);
    
    // Update the total expenses in the associated finances
    const finances = this.financesMap.get(category.financesId);
    if (finances) {
      const categories = await this.getExpenseCategories(category.financesId);
      const totalExpenses = categories.reduce((sum, cat) => sum + Number(cat.amount), 0);
      
      const updatedFinances: Finances = {
        ...finances,
        expenses: totalExpenses,
        expenseCategories: categories
      };
      
      this.financesMap.set(finances.id, updatedFinances);
    }
    
    return category;
  }
  
  async updateExpenseCategory(id: number, insertCategory: InsertExpenseCategory): Promise<ExpenseCategory | undefined> {
    const existingCategory = this.expenseCategories.get(id);
    if (!existingCategory) {
      return undefined;
    }
    
    const updatedCategory: ExpenseCategory = { ...insertCategory, id };
    this.expenseCategories.set(id, updatedCategory);
    
    // Update the total expenses in the associated finances
    const finances = this.financesMap.get(updatedCategory.financesId);
    if (finances) {
      const categories = await this.getExpenseCategories(updatedCategory.financesId);
      const totalExpenses = categories.reduce((sum, cat) => sum + Number(cat.amount), 0);
      
      const updatedFinances: Finances = {
        ...finances,
        expenses: totalExpenses,
        expenseCategories: categories
      };
      
      this.financesMap.set(finances.id, updatedFinances);
    }
    
    return updatedCategory;
  }
  
  async deleteExpenseCategory(id: number): Promise<void> {
    const category = this.expenseCategories.get(id);
    if (!category) {
      return;
    }
    
    const financesId = category.financesId;
    this.expenseCategories.delete(id);
    
    // Update the total expenses in the associated finances
    const finances = this.financesMap.get(financesId);
    if (finances) {
      const categories = await this.getExpenseCategories(financesId);
      const totalExpenses = categories.reduce((sum, cat) => sum + Number(cat.amount), 0);
      
      const updatedFinances: Finances = {
        ...finances,
        expenses: totalExpenses,
        expenseCategories: categories
      };
      
      this.financesMap.set(finances.id, updatedFinances);
    }
  }
}

export const storage = new MemStorage();
