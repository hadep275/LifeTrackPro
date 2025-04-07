import { 
  User, InsertUser, 
  Task, InsertTask,
  Habit, InsertHabit,
  Goal, InsertGoal,
  Finances, InsertFinances,
  ExpenseCategory, InsertExpenseCategory,
  FinancialGoal, InsertFinancialGoal,
  FinancialAccount, InsertFinancialAccount,
  Investment, InsertInvestment,
  FinancialTransaction, InsertTransaction,
  users, tasks, habits, goals, finances, expenseCategories,
  financialGoals, financialAccounts, investments, financialTransactions
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
  
  // Financial Goals methods
  getFinancialGoals(financesId: number): Promise<FinancialGoal[]>;
  getFinancialGoal(id: number): Promise<FinancialGoal | undefined>;
  createFinancialGoal(goal: InsertFinancialGoal): Promise<FinancialGoal>;
  updateFinancialGoal(id: number, goal: InsertFinancialGoal): Promise<FinancialGoal | undefined>;
  deleteFinancialGoal(id: number): Promise<void>;
  
  // Financial Accounts methods
  getFinancialAccounts(financesId: number): Promise<FinancialAccount[]>;
  getFinancialAccount(id: number): Promise<FinancialAccount | undefined>;
  createFinancialAccount(account: InsertFinancialAccount): Promise<FinancialAccount>;
  updateFinancialAccount(id: number, account: InsertFinancialAccount): Promise<FinancialAccount | undefined>;
  deleteFinancialAccount(id: number): Promise<void>;
  
  // Investments methods
  getInvestments(financesId: number): Promise<Investment[]>;
  getInvestment(id: number): Promise<Investment | undefined>;
  createInvestment(investment: InsertInvestment): Promise<Investment>;
  updateInvestment(id: number, investment: InsertInvestment): Promise<Investment | undefined>;
  deleteInvestment(id: number): Promise<void>;
  
  // Financial Transactions methods
  getFinancialTransactions(financesId: number, accountId?: number): Promise<FinancialTransaction[]>;
  getFinancialTransaction(id: number): Promise<FinancialTransaction | undefined>;
  createFinancialTransaction(transaction: InsertTransaction): Promise<FinancialTransaction>;
  updateFinancialTransaction(id: number, transaction: InsertTransaction): Promise<FinancialTransaction | undefined>;
  deleteFinancialTransaction(id: number): Promise<void>;
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
    console.log(`DEBUG: Getting finances for userId: ${userId}`);
    try {
      // Get the finances record
      const financesRecords = await db
        .select()
        .from(finances)
        .where(eq(finances.userId, userId));
      
      console.log(`DEBUG: Found ${financesRecords.length} finances records:`, JSON.stringify(financesRecords));
      
      if (financesRecords.length === 0) {
        return undefined;
      }
      
      // Use the latest finances record if there are multiple
      const financesRecord = financesRecords[financesRecords.length - 1];
      console.log(`DEBUG: Using finances record with ID: ${financesRecord.id}`);
      
      // Get associated expense categories
      const categories = await db
        .select()
        .from(expenseCategories)
        .where(eq(expenseCategories.financesId, financesRecord.id));
    
      // Get associated financial goals
      const goals = await db
        .select()
        .from(financialGoals)
        .where(eq(financialGoals.financesId, financesRecord.id));
    
      // Get associated financial accounts
      const accounts = await db
        .select()
        .from(financialAccounts)
        .where(eq(financialAccounts.financesId, financesRecord.id));
    
      // Get associated investments
      const investmentsList = await db
        .select()
        .from(investments)
        .where(eq(investments.financesId, financesRecord.id));
    
      // Get associated transactions
      const transactions = await db
        .select()
        .from(financialTransactions)
        .where(eq(financialTransactions.financesId, financesRecord.id));
    
      // Get associated recurring bills
      const recurringBills = await db
        .select()
        .from(recurringBills)
        .where(eq(recurringBills.financesId, financesRecord.id));
        
      // Convert null values to undefined to match the Finances interface
      const returnData = {
        ...financesRecord,
        expenseCategories: categories,
        financialGoals: goals,
        accounts: accounts,
        investments: investmentsList,
        transactions: transactions,
        recurringBills: recurringBills,
        retirementAge: financesRecord.retirementAge === null ? undefined : financesRecord.retirementAge,
        currentAge: financesRecord.currentAge === null ? undefined : financesRecord.currentAge
      };
    
      return returnData as Finances;
    } catch (error) {
      console.error("DEBUG: Error in getFinances:", error);
      throw error;
    }
  }
  
  async createFinances(insertFinances: InsertFinances): Promise<Finances> {
    try {
      const [financesRecord] = await db
        .insert(finances)
        .values(insertFinances)
        .returning();
      
      console.log(`DEBUG: Created finances record with ID: ${financesRecord.id}`);
      
      // Convert null values to undefined to match the Finances interface
      const returnData = {
        ...financesRecord,
        expenseCategories: [],
        financialGoals: [],
        accounts: [],
        investments: [],
        transactions: [],
        recurringBills: [],
        retirementAge: financesRecord.retirementAge === null ? undefined : financesRecord.retirementAge,
        currentAge: financesRecord.currentAge === null ? undefined : financesRecord.currentAge
      };
      
      return returnData as Finances;
    } catch (error) {
      console.error("DEBUG: Error in createFinances:", error);
      throw error;
    }
  }
  
  async updateFinances(id: number, insertFinances: InsertFinances): Promise<Finances | undefined> {
    try {
      const [updatedFinances] = await db
        .update(finances)
        .set(insertFinances)
        .where(eq(finances.id, id))
        .returning();
      
      if (!updatedFinances) {
        return undefined;
      }
      
      console.log(`DEBUG: Updated finances record with ID: ${updatedFinances.id}`);
      
      // Get associated expense categories
      const categories = await db
        .select()
        .from(expenseCategories)
        .where(eq(expenseCategories.financesId, id));
      
      // Get associated financial goals
      const goals = await db
        .select()
        .from(financialGoals)
        .where(eq(financialGoals.financesId, id));
      
      // Get associated financial accounts
      const accounts = await db
        .select()
        .from(financialAccounts)
        .where(eq(financialAccounts.financesId, id));
      
      // Get associated investments
      const investmentsList = await db
        .select()
        .from(investments)
        .where(eq(investments.financesId, id));
      
      // Get associated transactions
      const transactions = await db
        .select()
        .from(financialTransactions)
        .where(eq(financialTransactions.financesId, id));
      
      // Get associated recurring bills
      const recurringBills = await db
        .select()
        .from(recurringBills)
        .where(eq(recurringBills.financesId, id));
      
      // Convert null values to undefined to match the Finances interface
      const returnData = {
        ...updatedFinances,
        expenseCategories: categories,
        financialGoals: goals,
        accounts: accounts,
        investments: investmentsList,
        transactions: transactions,
        recurringBills: recurringBills,
        retirementAge: updatedFinances.retirementAge === null ? undefined : updatedFinances.retirementAge,
        currentAge: updatedFinances.currentAge === null ? undefined : updatedFinances.currentAge
      };
      
      return returnData as Finances;
    } catch (error) {
      console.error("DEBUG: Error in updateFinances:", error);
      throw error;
    }
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
  
  // Financial Goals methods
  async getFinancialGoals(financesId: number): Promise<FinancialGoal[]> {
    return await db
      .select()
      .from(financialGoals)
      .where(eq(financialGoals.financesId, financesId));
  }
  
  async getFinancialGoal(id: number): Promise<FinancialGoal | undefined> {
    const [goal] = await db
      .select()
      .from(financialGoals)
      .where(eq(financialGoals.id, id));
    return goal;
  }
  
  async createFinancialGoal(insertGoal: InsertFinancialGoal): Promise<FinancialGoal> {
    const [goal] = await db
      .insert(financialGoals)
      .values(insertGoal)
      .returning();
    return goal;
  }
  
  async updateFinancialGoal(id: number, insertGoal: InsertFinancialGoal): Promise<FinancialGoal | undefined> {
    const [updatedGoal] = await db
      .update(financialGoals)
      .set(insertGoal)
      .where(eq(financialGoals.id, id))
      .returning();
    return updatedGoal;
  }
  
  async deleteFinancialGoal(id: number): Promise<void> {
    await db.delete(financialGoals).where(eq(financialGoals.id, id));
  }
  
  // Financial Accounts methods
  async getFinancialAccounts(financesId: number): Promise<FinancialAccount[]> {
    return await db
      .select()
      .from(financialAccounts)
      .where(eq(financialAccounts.financesId, financesId));
  }
  
  async getFinancialAccount(id: number): Promise<FinancialAccount | undefined> {
    const [account] = await db
      .select()
      .from(financialAccounts)
      .where(eq(financialAccounts.id, id));
    return account;
  }
  
  async createFinancialAccount(insertAccount: InsertFinancialAccount): Promise<FinancialAccount> {
    const [account] = await db
      .insert(financialAccounts)
      .values(insertAccount)
      .returning();
      
    // Update net worth in finances
    await this.updateNetWorth(account.financesId);
    
    return account;
  }
  
  async updateFinancialAccount(id: number, insertAccount: InsertFinancialAccount): Promise<FinancialAccount | undefined> {
    const [updatedAccount] = await db
      .update(financialAccounts)
      .set(insertAccount)
      .where(eq(financialAccounts.id, id))
      .returning();
    
    if (updatedAccount) {
      // Update net worth in finances
      await this.updateNetWorth(updatedAccount.financesId);
    }
    
    return updatedAccount;
  }
  
  async deleteFinancialAccount(id: number): Promise<void> {
    // Get the account before deleting to know which finances to update
    const [account] = await db
      .select()
      .from(financialAccounts)
      .where(eq(financialAccounts.id, id));
    
    if (account) {
      await db.delete(financialAccounts).where(eq(financialAccounts.id, id));
      
      // Update net worth in finances
      await this.updateNetWorth(account.financesId);
    }
  }
  
  // Investments methods
  async getInvestments(financesId: number): Promise<Investment[]> {
    return await db
      .select()
      .from(investments)
      .where(eq(investments.financesId, financesId));
  }
  
  async getInvestment(id: number): Promise<Investment | undefined> {
    const [investment] = await db
      .select()
      .from(investments)
      .where(eq(investments.id, id));
    return investment;
  }
  
  async createInvestment(insertInvestment: InsertInvestment): Promise<Investment> {
    const [investment] = await db
      .insert(investments)
      .values(insertInvestment)
      .returning();
      
    // Update net worth in finances
    await this.updateNetWorth(investment.financesId);
    
    return investment;
  }
  
  async updateInvestment(id: number, insertInvestment: InsertInvestment): Promise<Investment | undefined> {
    const [updatedInvestment] = await db
      .update(investments)
      .set(insertInvestment)
      .where(eq(investments.id, id))
      .returning();
    
    if (updatedInvestment) {
      // Update net worth in finances
      await this.updateNetWorth(updatedInvestment.financesId);
    }
    
    return updatedInvestment;
  }
  
  async deleteInvestment(id: number): Promise<void> {
    // Get the investment before deleting to know which finances to update
    const [investment] = await db
      .select()
      .from(investments)
      .where(eq(investments.id, id));
    
    if (investment) {
      await db.delete(investments).where(eq(investments.id, id));
      
      // Update net worth in finances
      await this.updateNetWorth(investment.financesId);
    }
  }
  
  // Financial Transactions methods
  async getFinancialTransactions(financesId: number, accountId?: number): Promise<FinancialTransaction[]> {
    if (accountId) {
      return await db
        .select()
        .from(financialTransactions)
        .where(and(
          eq(financialTransactions.financesId, financesId),
          eq(financialTransactions.accountId, accountId)
        ));
    } else {
      return await db
        .select()
        .from(financialTransactions)
        .where(eq(financialTransactions.financesId, financesId));
    }
  }
  
  async getFinancialTransaction(id: number): Promise<FinancialTransaction | undefined> {
    const [transaction] = await db
      .select()
      .from(financialTransactions)
      .where(eq(financialTransactions.id, id));
    return transaction;
  }
  
  async createFinancialTransaction(insertTransaction: InsertTransaction): Promise<FinancialTransaction> {
    const [transaction] = await db
      .insert(financialTransactions)
      .values(insertTransaction)
      .returning();
    
    // If this transaction is associated with an account, update the account balance
    if (transaction.accountId) {
      await this.updateAccountBalance(transaction.accountId);
    }
    
    // Update savings and net worth
    await this.updateFinancesSummary(transaction.financesId);
    
    return transaction;
  }
  
  async updateFinancialTransaction(id: number, insertTransaction: InsertTransaction): Promise<FinancialTransaction | undefined> {
    // Get the original transaction to check if the account changed
    const [originalTransaction] = await db
      .select()
      .from(financialTransactions)
      .where(eq(financialTransactions.id, id));
    
    const [updatedTransaction] = await db
      .update(financialTransactions)
      .set(insertTransaction)
      .where(eq(financialTransactions.id, id))
      .returning();
    
    if (!updatedTransaction) {
      return undefined;
    }
    
    // If the account changed, update both the old and new account balances
    if (originalTransaction && originalTransaction.accountId !== updatedTransaction.accountId) {
      if (originalTransaction.accountId) {
        await this.updateAccountBalance(originalTransaction.accountId);
      }
    }
    
    // Update the current account balance
    if (updatedTransaction.accountId) {
      await this.updateAccountBalance(updatedTransaction.accountId);
    }
    
    // Update savings and net worth
    await this.updateFinancesSummary(updatedTransaction.financesId);
    
    return updatedTransaction;
  }
  
  async deleteFinancialTransaction(id: number): Promise<void> {
    // Get the transaction before deleting to know which account and finances to update
    const [transaction] = await db
      .select()
      .from(financialTransactions)
      .where(eq(financialTransactions.id, id));
    
    if (!transaction) {
      return;
    }
    
    await db.delete(financialTransactions).where(eq(financialTransactions.id, id));
    
    // If this transaction was associated with an account, update the account balance
    if (transaction.accountId) {
      await this.updateAccountBalance(transaction.accountId);
    }
    
    // Update savings and net worth
    await this.updateFinancesSummary(transaction.financesId);
  }
  
  // Helper method to update net worth
  private async updateNetWorth(financesId: number): Promise<void> {
    // Get all accounts that should be included in net worth
    const accounts = await db
      .select()
      .from(financialAccounts)
      .where(and(
        eq(financialAccounts.financesId, financesId),
        eq(financialAccounts.includeInNetWorth, true)
      ));
    
    // Get all investments
    const investments = await db
      .select()
      .from(investments)
      .where(eq(investments.financesId, financesId));
    
    // Calculate net worth as the sum of all account balances plus investment values
    const accountsValue = accounts.reduce((sum, account) => sum + Number(account.balance), 0);
    const investmentsValue = investments.reduce((sum, investment) => sum + Number(investment.value), 0);
    
    const netWorth = accountsValue + investmentsValue;
    
    // Update finances net worth
    await db
      .update(finances)
      .set({ netWorth: netWorth.toString() })
      .where(eq(finances.id, financesId));
  }
  
  // Helper method to update account balance based on transactions
  private async updateAccountBalance(accountId: number): Promise<void> {
    // Get the account
    const [account] = await db
      .select()
      .from(financialAccounts)
      .where(eq(financialAccounts.id, accountId));
    
    if (!account) {
      return;
    }
    
    // Get all transactions for this account
    const transactions = await db
      .select()
      .from(financialTransactions)
      .where(eq(financialTransactions.accountId, accountId));
    
    // Calculate the balance from transactions
    let balance = 0;
    
    for (const transaction of transactions) {
      if (transaction.type === 'income') {
        balance += Number(transaction.amount);
      } else if (transaction.type === 'expense') {
        balance -= Number(transaction.amount);
      }
      // For transfers, we would need to handle both sides of the transfer
    }
    
    // Update the account balance
    await db
      .update(financialAccounts)
      .set({ balance: balance.toString() })
      .where(eq(financialAccounts.id, accountId));
    
    // Update net worth after account balance changes
    await this.updateNetWorth(account.financesId);
  }
  
  // Helper method to update savings and related metrics
  private async updateFinancesSummary(financesId: number): Promise<void> {
    // Get the finances record
    const [financesRecord] = await db
      .select()
      .from(finances)
      .where(eq(finances.id, financesId));
    
    if (!financesRecord) {
      return;
    }
    
    // Calculate savings as income - expenses
    const income = Number(financesRecord.income);
    const expenses = Number(financesRecord.expenses);
    const savings = income - expenses;
    
    // Update the finances record
    await db
      .update(finances)
      .set({ savings: savings.toString() })
      .where(eq(finances.id, financesId));
    
    // Also update net worth
    await this.updateNetWorth(financesId);
  }
}

// Export an instance of the DatabaseStorage class
export const storage = new DatabaseStorage();
