import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Trash2, 
  Plus, 
  ChevronRight, 
  LineChart, 
  Wallet, 
  Target, 
  Calculator, 
  CreditCard, 
  PiggyBank, 
  DollarSign, 
  TrendingUp, 
  Landmark, 
  Link,
  Home,
  GraduationCap,
  Car,
  Briefcase,
  HeartPulse,
  Globe
} from "lucide-react";
import { 
  Finances as FinancesType, 
  ExpenseCategory, 
  FinancialGoal, 
  financialGoalTypeEnum,
  FinancialAccount, 
  accountTypeEnum, 
  Investment, 
  investmentTypeEnum, 
  InsertExpenseCategory, 
  InsertFinancialGoal, 
  InsertFinancialAccount, 
  InsertInvestment,
  InsertRecurringBill,
  RecurringBill,
  billFrequencyEnum
} from "@shared/schema";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

// Default color palette for charts and categories
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6', '#F97316', '#0EA5E9'];

// Type definitions for calculator types
type CalculatorType = 'retirement' | 'mortgage' | 'emergency' | 'fire' | 'savings';

const FinancialGoalTypesInfo = {
  emergency_fund: { 
    label: "Emergency Fund", 
    icon: <HeartPulse className="h-5 w-5 mr-2 text-red-500" />,
    color: "#EF4444"
  },
  retirement: { 
    label: "Retirement", 
    icon: <Briefcase className="h-5 w-5 mr-2 text-indigo-500" />,
    color: "#6366F1" 
  },
  house_downpayment: { 
    label: "House Down Payment", 
    icon: <Home className="h-5 w-5 mr-2 text-blue-500" />,
    color: "#3B82F6" 
  },
  car: { 
    label: "Car", 
    icon: <Car className="h-5 w-5 mr-2 text-green-500" />,
    color: "#10B981" 
  },
  education: { 
    label: "Education", 
    icon: <GraduationCap className="h-5 w-5 mr-2 text-yellow-500" />,
    color: "#F59E0B"
  },
  travel: { 
    label: "Travel", 
    icon: <Globe className="h-5 w-5 mr-2 text-pink-500" />,
    color: "#EC4899" 
  },
  debt_payoff: { 
    label: "Debt Payoff", 
    icon: <CreditCard className="h-5 w-5 mr-2 text-purple-500" />,
    color: "#8B5CF6" 
  },
  other: { 
    label: "Other", 
    icon: <Target className="h-5 w-5 mr-2 text-gray-500" />,
    color: "#6B7280" 
  },
};

// Account type info with icons and colors
const AccountTypesInfo = {
  checking: { 
    label: "Checking", 
    icon: <Wallet className="h-5 w-5 mr-2 text-blue-500" />,
    color: "#3B82F6" 
  },
  savings: { 
    label: "Savings", 
    icon: <PiggyBank className="h-5 w-5 mr-2 text-green-500" />,
    color: "#10B981" 
  },
  investment: { 
    label: "Investment", 
    icon: <TrendingUp className="h-5 w-5 mr-2 text-yellow-500" />,
    color: "#F59E0B" 
  },
  retirement: { 
    label: "Retirement", 
    icon: <Briefcase className="h-5 w-5 mr-2 text-indigo-500" />,
    color: "#6366F1" 
  },
  credit_card: { 
    label: "Credit Card", 
    icon: <CreditCard className="h-5 w-5 mr-2 text-red-500" />,
    color: "#EF4444" 
  },
  loan: { 
    label: "Loan", 
    icon: <DollarSign className="h-5 w-5 mr-2 text-purple-500" />,
    color: "#8B5CF6" 
  },
  other: { 
    label: "Other", 
    icon: <Wallet className="h-5 w-5 mr-2 text-gray-500" />,
    color: "#6B7280" 
  },
};

// Investment type info with icons and colors
const InvestmentTypesInfo = {
  stocks: { 
    label: "Stocks", 
    icon: <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />,
    color: "#3B82F6" 
  },
  bonds: { 
    label: "Bonds", 
    icon: <Landmark className="h-5 w-5 mr-2 text-green-500" />,
    color: "#10B981" 
  },
  mutual_funds: { 
    label: "Mutual Funds", 
    icon: <PiggyBank className="h-5 w-5 mr-2 text-yellow-500" />,
    color: "#F59E0B" 
  },
  etfs: { 
    label: "ETFs", 
    icon: <LineChart className="h-5 w-5 mr-2 text-indigo-500" />,
    color: "#6366F1" 
  },
  real_estate: { 
    label: "Real Estate", 
    icon: <Home className="h-5 w-5 mr-2 text-red-500" />,
    color: "#EF4444" 
  },
  cryptocurrency: { 
    label: "Cryptocurrency", 
    icon: <DollarSign className="h-5 w-5 mr-2 text-purple-500" />,
    color: "#8B5CF6" 
  },
  other: { 
    label: "Other", 
    icon: <Wallet className="h-5 w-5 mr-2 text-gray-500" />,
    color: "#6B7280" 
  },
};

// Format currency helper function
const formatCurrency = (amount: number | string) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numAmount);
};

const Finances = () => {
  const queryClient = useQueryClient();
  const userId = 1; // Default user ID
  
  // Tab state
  const [activeTab, setActiveTab] = useState('overview');
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType>('retirement');
  
  // Form states
  const [newExpenseCategory, setNewExpenseCategory] = useState<Omit<InsertExpenseCategory, "id" | "createdAt" | "updatedAt">>({
    name: "",
    amount: "0",
    color: "#3B82F6",
    financesId: 0
  });

  const [newFinancialGoal, setNewFinancialGoal] = useState<Partial<InsertFinancialGoal>>({
    name: "",
    type: "emergency_fund",
    targetAmount: "0",
    currentAmount: "0",
    targetDate: new Date().toISOString().split('T')[0],
    color: "#3B82F6"
  });

  const [newAccount, setNewAccount] = useState<Partial<InsertFinancialAccount>>({
    name: "",
    type: "checking",
    balance: "0",
    institution: "",
    color: "#3B82F6"
  });

  const [newInvestment, setNewInvestment] = useState<Partial<InsertInvestment>>({
    name: "",
    type: "stocks",
    value: "0",
    purchasePrice: "0",
    color: "#3B82F6"
  });
  
  const [newRecurringBill, setNewRecurringBill] = useState<Partial<InsertRecurringBill>>({
    name: "",
    amount: "0",
    description: "",
    category: "",
    frequency: "monthly",
    startDate: new Date().toISOString().split('T')[0],
    nextDueDate: new Date().toISOString().split('T')[0],
    dayOfMonth: new Date().getDate(),
    color: "#3B82F6",
    autoPay: false,
    reminderDays: 3
  });

  // Calculator states
  const [retirementCalcInputs, setRetirementCalcInputs] = useState({
    currentAge: 30,
    retirementAge: 65,
    currentSavings: 50000,
    annualContribution: 10000,
    expectedReturn: 7,
    inflationRate: 2.5
  });

  const [mortgageCalcInputs, setMortgageCalcInputs] = useState({
    homePrice: 300000,
    downPayment: 60000,
    interestRate: 4.5,
    loanTerm: 30
  });

  const [emergencyCalcInputs, setEmergencyCalcInputs] = useState({
    monthlyExpenses: 3000,
    desiredMonths: 6
  });

  const [fireCalcInputs, setFireCalcInputs] = useState({
    currentAge: 30,
    targetFireAge: 45,
    currentAnnualExpenses: 50000,
    expectedWithdrawalRate: 4,
    currentNetWorth: 100000,
    annualContribution: 30000,
    expectedReturn: 7
  });

  const [savingsCalcInputs, setSavingsCalcInputs] = useState({
    targetAmount: 10000,
    timeframeMonths: 24,
    currentSavings: 0,
    interestRate: 2
  });

  // Query and Mutation definitions
  const { data: finances, isLoading: isFinancesLoading } = useQuery({
    queryKey: ['/api/finances'],
    queryFn: async () => {
      return await apiRequest<FinancesType>('/api/finances');
    },
  });

  const createFinancesMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("DEBUG: Sending finances data:", JSON.stringify(data));
      return await apiRequest<FinancesType>('/api/finances', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      console.log("DEBUG: Finances created successfully");
      queryClient.invalidateQueries({ queryKey: ['/api/finances'] });
    },
    onError: (error) => {
      console.error("DEBUG: Error creating finances:", error);
    }
  });

  const updateFinancesMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      return await apiRequest<FinancesType>(`/api/finances/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finances'] });
    }
  });

  const createExpenseCategoryMutation = useMutation({
    mutationFn: async (data: InsertExpenseCategory) => {
      return await apiRequest<ExpenseCategory>('/api/expense-categories', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finances'] });
      setNewExpenseCategory({
        name: "",
        amount: "0",
        color: "#3B82F6",
        financesId: finances?.id || 0
      });
    }
  });

  const deleteExpenseCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/expense-categories/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finances'] });
    }
  });

  const createFinancialGoalMutation = useMutation({
    mutationFn: async (data: InsertFinancialGoal) => {
      return await apiRequest<FinancialGoal>('/api/financial-goals', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finances'] });
      setNewFinancialGoal({
        name: "",
        type: "emergency_fund",
        targetAmount: "0",
        currentAmount: "0",
        targetDate: new Date().toISOString().split('T')[0],
        color: "#3B82F6"
      });
    }
  });

  const updateFinancialGoalMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<InsertFinancialGoal> }) => {
      return await apiRequest<FinancialGoal>(`/api/financial-goals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finances'] });
    }
  });

  const deleteFinancialGoalMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/financial-goals/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finances'] });
    }
  });

  const createAccountMutation = useMutation({
    mutationFn: async (data: InsertFinancialAccount) => {
      return await apiRequest<FinancialAccount>('/api/financial-accounts', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finances'] });
      setNewAccount({
        name: "",
        type: "checking",
        balance: "0",
        institution: "",
        color: "#3B82F6"
      });
    }
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/financial-accounts/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finances'] });
    }
  });

  const createInvestmentMutation = useMutation({
    mutationFn: async (data: InsertInvestment) => {
      return await apiRequest<Investment>('/api/investments', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finances'] });
      setNewInvestment({
        name: "",
        type: "stocks",
        value: "0",
        purchasePrice: "0",
        color: "#3B82F6"
      });
    }
  });

  const deleteInvestmentMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/investments/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finances'] });
    }
  });
  
  const createRecurringBillMutation = useMutation({
    mutationFn: async (data: InsertRecurringBill) => {
      return await apiRequest<RecurringBill>('/api/recurring-bills', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finances'] });
      setNewRecurringBill({
        name: "",
        amount: "0",
        description: "",
        category: "",
        frequency: "monthly",
        startDate: new Date().toISOString().split('T')[0],
        nextDueDate: new Date().toISOString().split('T')[0],
        dayOfMonth: new Date().getDate(),
        color: "#3B82F6",
        autoPay: false,
        reminderDays: 3
      });
    }
  });
  
  const updateRecurringBillMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<InsertRecurringBill> }) => {
      return await apiRequest<RecurringBill>(`/api/recurring-bills/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finances'] });
    }
  });
  
  const deleteRecurringBillMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/recurring-bills/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finances'] });
    }
  });

  // Default user query
  const fetchDefaultUserMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest<any>("/api/users/default", {
        method: "GET",
      });
    }
  });

  // If no finances found, create a default one with the default user
  const handleCreateInitialFinances = () => {
    // First get or create the default user
    fetchDefaultUserMutation.mutate(undefined, {
      onSuccess: (user) => {
        console.log("Using default user with ID:", user.id);
        // Then create finances with the user ID
        createFinancesMutation.mutate({
          userId: user.id,
          income: "0",
          expenses: "0", 
          savings: "0",
          netWorth: "0"
        });
      },
      onError: (error) => {
        console.error("Failed to get default user:", error);
      }
    });
  };

  // Update income
  const handleIncomeChange = async (value: string) => {
    if (!finances) return;
    
    const income = parseFloat(value) || 0;
    
    updateFinancesMutation.mutate({
      id: finances.id,
      data: {
        ...finances,
        income: income.toString(),
        userId: finances.userId
      }
    });
  };

  // Add expense category
  const handleAddExpenseCategory = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!finances) return;
    
    createExpenseCategoryMutation.mutate({
      ...newExpenseCategory,
      financesId: finances.id
    } as InsertExpenseCategory);
  };

  // Add financial goal
  const handleAddFinancialGoal = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!finances) return;
    
    createFinancialGoalMutation.mutate({
      ...newFinancialGoal,
      financesId: finances.id,
      // Set defaults for required fields if not provided
      description: newFinancialGoal.description || "",
      relatedTaskIds: [],
      relatedGoalIds: [],
      linkedToTaskSchedule: newFinancialGoal.linkedToTaskSchedule || false,
      isArchived: false
    } as InsertFinancialGoal);
  };

  // Add financial account
  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!finances) return;
    
    createAccountMutation.mutate({
      ...newAccount,
      financesId: finances.id,
      // Set defaults for required fields if not provided
      interestRate: "0",
      includeInNetWorth: true
    } as InsertFinancialAccount);
  };

  // Add investment
  const handleAddInvestment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!finances) return;
    
    createInvestmentMutation.mutate({
      ...newInvestment,
      financesId: finances.id,
      // Set defaults for required fields if not provided
      purchaseDate: new Date().toISOString().split('T')[0],
      notes: newInvestment.notes || ""
    } as InsertInvestment);
  };
  
  // Add recurring bill
  const handleAddRecurringBill = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!finances) return;
    
    createRecurringBillMutation.mutate({
      ...newRecurringBill,
      financesId: finances.id
    } as InsertRecurringBill);
  };

  // Update financial goal progress
  const handleUpdateGoalProgress = (goal: FinancialGoal, newAmount: string) => {
    updateFinancialGoalMutation.mutate({
      id: goal.id,
      data: {
        ...goal,
        currentAmount: newAmount
      }
    });
  };

  // Calculate retirement
  const calculateRetirement = () => {
    const { currentAge, retirementAge, currentSavings, annualContribution, expectedReturn, inflationRate } = retirementCalcInputs;
    const years = retirementAge - currentAge;
    const realReturn = (1 + expectedReturn / 100) / (1 + inflationRate / 100) - 1;
    
    let futureValue = currentSavings;
    for (let i = 0; i < years; i++) {
      futureValue = futureValue * (1 + realReturn) + annualContribution;
    }
    
    return {
      yearsToRetirement: years,
      futureValue: futureValue,
      annualIncome: futureValue * 0.04  // 4% safe withdrawal rate
    };
  };

  // Calculate mortgage
  const calculateMortgage = () => {
    const { homePrice, downPayment, interestRate, loanTerm } = mortgageCalcInputs;
    const loanAmount = homePrice - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;
    
    const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                         (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    return {
      loanAmount,
      monthlyPayment,
      totalInterest: (monthlyPayment * numberOfPayments) - loanAmount,
      totalCost: monthlyPayment * numberOfPayments
    };
  };

  // Calculate emergency fund
  const calculateEmergencyFund = () => {
    const { monthlyExpenses, desiredMonths } = emergencyCalcInputs;
    return monthlyExpenses * desiredMonths;
  };

  // Calculate FIRE (Financial Independence, Retire Early)
  const calculateFire = () => {
    const { currentAge, targetFireAge, currentAnnualExpenses, expectedWithdrawalRate, currentNetWorth, annualContribution, expectedReturn } = fireCalcInputs;
    
    const yearsToFire = targetFireAge - currentAge;
    const targetNetWorth = currentAnnualExpenses * (100 / expectedWithdrawalRate);
    
    let projectedNetWorth = currentNetWorth;
    for (let i = 0; i < yearsToFire; i++) {
      projectedNetWorth = projectedNetWorth * (1 + expectedReturn / 100) + annualContribution;
    }
    
    const isOnTrack = projectedNetWorth >= targetNetWorth;
    const fireDeficit = isOnTrack ? 0 : targetNetWorth - projectedNetWorth;
    const additionalAnnualSavingsNeeded = fireDeficit / yearsToFire / ((1 + expectedReturn / 100 + 1) / 2);
    
    return {
      targetNetWorth,
      projectedNetWorth,
      isOnTrack,
      fireDeficit,
      additionalAnnualSavingsNeeded
    };
  };

  // Calculate savings
  const calculateSavings = () => {
    const { targetAmount, timeframeMonths, currentSavings, interestRate } = savingsCalcInputs;
    const monthlyRate = interestRate / 100 / 12;
    
    const amountNeeded = targetAmount - currentSavings;
    let monthlySavingsNeeded;
    
    if (monthlyRate === 0) {
      monthlySavingsNeeded = amountNeeded / timeframeMonths;
    } else {
      monthlySavingsNeeded = (amountNeeded * monthlyRate) / (Math.pow(1 + monthlyRate, timeframeMonths) - 1);
    }
    
    return {
      amountNeeded,
      monthlySavingsNeeded,
      totalInterest: targetAmount - currentSavings - (monthlySavingsNeeded * timeframeMonths)
    };
  };

  // Prepare chart data
  const prepareExpensePieChartData = () => {
    if (!finances || !finances.expenseCategories) return [];
    
    return finances.expenseCategories.map((category, index) => ({
      name: category.name,
      value: parseFloat(category.amount.toString()),
      color: category.color || COLORS[index % COLORS.length]
    }));
  };

  const prepareNetWorthBarChartData = () => {
    if (!finances) return [];
    
    // Get total from accounts and investments
    const accountsTotal = finances.accounts?.reduce((sum, account) => sum + parseFloat(account.balance.toString()), 0) || 0;
    const investmentsTotal = finances.investments?.reduce((sum, investment) => sum + parseFloat(investment.value.toString()), 0) || 0;
    
    return [
      { name: 'Accounts', value: accountsTotal },
      { name: 'Investments', value: investmentsTotal },
      { name: 'Net Worth', value: parseFloat(finances.netWorth.toString()) }
    ];
  };

  // Determine if loading or if we need to create initial finances
  if (isFinancesLoading) {
    return <div className="flex justify-center items-center h-64">Loading financial data...</div>;
  }

  if (!finances) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <h2 className="text-2xl font-bold">No Financial Data Yet</h2>
        <p className="text-gray-500">Let's get started by setting up your financial profile</p>
        <Button onClick={handleCreateInitialFinances}>Initialize Financial Profile</Button>
      </div>
    );
  }

  // Calculate totals
  const balance = parseFloat(finances.income.toString()) - parseFloat(finances.expenses.toString());
  const savingsRate = parseFloat(finances.income.toString()) > 0 
    ? (parseFloat(finances.savings.toString()) / parseFloat(finances.income.toString())) * 100 
    : 0;
  
  // Prepare goal progress
  const totalGoalsValue = finances.financialGoals?.reduce((sum, goal) => sum + parseFloat(goal.targetAmount.toString()), 0) || 0;
  const currentGoalsProgress = finances.financialGoals?.reduce((sum, goal) => sum + parseFloat(goal.currentAmount.toString()), 0) || 0;
  const overallGoalProgress = totalGoalsValue > 0 ? (currentGoalsProgress / totalGoalsValue) * 100 : 0;

  // Financial calculations from calculators
  const retirementResults = calculateRetirement();
  const mortgageResults = calculateMortgage();
  const emergencyFundAmount = calculateEmergencyFund();
  const fireResults = calculateFire();
  const savingsResults = calculateSavings();

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Financial Dashboard</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 grid grid-cols-2 md:grid-cols-6 gap-2">
          <TabsTrigger value="overview" className="flex items-center">
            <LineChart className="h-4 w-4 mr-2" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="bills" className="flex items-center">
            <CreditCard className="h-4 w-4 mr-2" />
            <span>Bills</span>
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center">
            <Target className="h-4 w-4 mr-2" />
            <span>Goals</span>
          </TabsTrigger>
          <TabsTrigger value="accounts" className="flex items-center">
            <Wallet className="h-4 w-4 mr-2" />
            <span>Accounts</span>
          </TabsTrigger>
          <TabsTrigger value="investments" className="flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            <span>Investments</span>
          </TabsTrigger>
          <TabsTrigger value="calculators" className="flex items-center">
            <Calculator className="h-4 w-4 mr-2" />
            <span>Calculators</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Financial Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
                <CardDescription>Your current financial status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-400 mb-1">Monthly Income</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {formatCurrency(finances.income)}
                  </p>
                </div>
                
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-400 mb-1">Monthly Expenses</p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                    {formatCurrency(finances.expenses)}
                  </p>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-400 mb-1">Monthly Savings</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                    {formatCurrency(finances.savings)}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-1">Net Worth</p>
                  <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                    {formatCurrency(finances.netWorth)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-1">Savings Rate</p>
                  <Progress value={savingsRate} className="h-2" />
                  <p className="text-xs text-right mt-1 text-slate-500">{savingsRate.toFixed(1)}% of income</p>
                </div>
              </CardContent>
              <CardFooter>
                <form className="w-full space-y-4">
                  <div>
                    <Label htmlFor="incomeAmount">Update Monthly Income</Label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-slate-500">$</span>
                      </div>
                      <Input 
                        id="incomeAmount"
                        type="number"
                        step="0.01"
                        defaultValue={parseFloat(finances.income.toString())}
                        onChange={(e) => handleIncomeChange(e.target.value)}
                        className="pl-7"
                      />
                    </div>
                  </div>
                </form>
              </CardFooter>
            </Card>
            
            {/* Expense Categories Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Expense Breakdown</span>
                </CardTitle>
                <CardDescription>Where your money is going</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {finances.expenseCategories.length > 0 ? (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={prepareExpensePieChartData()}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          labelLine={false}
                        >
                          {finances.expenseCategories.map((category, index) => (
                            <Cell key={`cell-${index}`} fill={category.color || COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center text-slate-400 py-6">
                    <p>No expense categories added yet.</p>
                    <p className="text-sm">Add categories below to track your spending</p>
                  </div>
                )}

                <div className="max-h-40 overflow-y-auto">
                  <ul className="space-y-2">
                    {finances.expenseCategories.map((category) => (
                      <li key={category.id} className="flex justify-between items-center p-2 border-b border-slate-100">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color || '#3B82F6' }}
                          />
                          <span>{category.name}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-slate-700 mr-2">{formatCurrency(category.amount)}</span>
                          <Button
                            variant="ghost"
                            onClick={() => deleteExpenseCategoryMutation.mutate(category.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <form onSubmit={handleAddExpenseCategory} className="w-full space-y-4">
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <Input 
                        placeholder="Category Name" 
                        value={newExpenseCategory.name}
                        onChange={(e) => setNewExpenseCategory({
                          ...newExpenseCategory, 
                          name: e.target.value
                        })}
                        required
                      />
                    </div>
                    <div className="w-24">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-slate-500">$</span>
                        </div>
                        <Input 
                          type="number"
                          step="0.01"
                          placeholder="Amount"
                          value={newExpenseCategory.amount}
                          onChange={(e) => setNewExpenseCategory({
                            ...newExpenseCategory, 
                            amount: e.target.value
                          })}
                          className="pl-7"
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </CardFooter>
            </Card>
            
            {/* Goals Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Goals</CardTitle>
                <CardDescription>Your progress towards financial freedom</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {finances.financialGoals && finances.financialGoals.length > 0 ? (
                  <>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Overall Progress</p>
                      <Progress value={overallGoalProgress} className="h-2" />
                      <p className="text-xs text-right text-slate-500">{overallGoalProgress.toFixed(1)}%</p>
                    </div>
                    
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {finances.financialGoals.map((goal) => {
                        const progress = parseFloat(goal.targetAmount.toString()) > 0 
                          ? (parseFloat(goal.currentAmount.toString()) / parseFloat(goal.targetAmount.toString())) * 100 
                          : 0;
                          
                        const goalTypeInfo = FinancialGoalTypesInfo[goal.type as keyof typeof FinancialGoalTypesInfo];
                        
                        return (
                          <div key={goal.id} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                {goalTypeInfo.icon}
                                <span className="text-sm font-medium">{goal.name}</span>
                              </div>
                              <span className="text-xs text-slate-500">
                                {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                              </span>
                            </div>
                            <Progress 
                              value={progress} 
                              className="h-2" 
                              style={{ 
                                backgroundColor: `${goalTypeInfo.color}20`,
                                "--progress-background": goalTypeInfo.color
                              } as React.CSSProperties}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="text-center text-slate-400 py-6">
                    <p>No financial goals added yet.</p>
                    <p className="text-sm">Set goals in the Goals tab to track your progress</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setActiveTab('goals')}
                >
                  <span>Manage Goals</span>
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Net Worth Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Net Worth Breakdown</CardTitle>
              <CardDescription>Your assets and investments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ReLineChart
                    data={prepareNetWorthBarChartData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
                    <Tooltip formatter={(value) => [`$${(value as number).toLocaleString()}`, 'Value']} />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#3B82F6" activeDot={{ r: 8 }} />
                  </ReLineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Bills Tab */}
        <TabsContent value="bills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Recurring Bills</span>
              </CardTitle>
              <CardDescription>Manage your regular monthly and weekly expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {finances.recurringBills && finances.recurringBills.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {finances.recurringBills.map((bill) => {
                      const nextDueDate = new Date(bill.nextDueDate);
                      const isOverdue = nextDueDate < new Date();
                      const daysUntilDue = Math.ceil((nextDueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      const needsReminder = daysUntilDue <= bill.reminderDays && !isOverdue;
                      
                      return (
                        <Card key={bill.id} className={`
                          overflow-hidden
                          ${isOverdue ? 'border-red-500 dark:border-red-700' : ''}
                          ${needsReminder ? 'border-yellow-500 dark:border-yellow-700' : ''}
                        `}>
                          <div className="h-2" style={{ backgroundColor: bill.color || '#3B82F6' }}></div>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg">{bill.name}</CardTitle>
                                <CardDescription>{bill.description}</CardDescription>
                              </div>
                              <Button
                                variant="ghost"
                                onClick={() => deleteRecurringBillMutation.mutate(bill.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                                size="sm"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <p className="text-slate-500">Amount</p>
                                <p className="font-medium">{formatCurrency(bill.amount)}</p>
                              </div>
                              <div>
                                <p className="text-slate-500">Frequency</p>
                                <p className="font-medium capitalize">{bill.frequency}</p>
                              </div>
                              <div>
                                <p className="text-slate-500">Next Due</p>
                                <p className={`font-medium ${isOverdue ? 'text-red-500' : (needsReminder ? 'text-yellow-500' : '')}`}>
                                  {new Date(bill.nextDueDate).toLocaleDateString()}
                                  {isOverdue && <span className="ml-2 text-xs bg-red-100 text-red-800 px-1 py-0.5 rounded">Overdue</span>}
                                  {needsReminder && !isOverdue && <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded">Soon</span>}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-500">Auto-Pay</p>
                                <p className="font-medium">{bill.autoPay ? 'Yes' : 'No'}</p>
                              </div>
                              {bill.category && (
                                <div className="col-span-2">
                                  <p className="text-slate-500">Category</p>
                                  <p className="font-medium">{bill.category}</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                          <CardFooter>
                            <div className="w-full flex justify-between">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  // Mark as paid
                                  updateRecurringBillMutation.mutate({
                                    id: bill.id,
                                    data: {
                                      ...bill,
                                      lastPaidDate: new Date().toISOString().split('T')[0],
                                      nextDueDate: (() => {
                                        // Calculate next due date based on frequency
                                        const date = new Date(bill.nextDueDate);
                                        if (bill.frequency === 'weekly') {
                                          date.setDate(date.getDate() + 7);
                                        } else if (bill.frequency === 'monthly') {
                                          date.setMonth(date.getMonth() + 1);
                                        } else if (bill.frequency === 'yearly') {
                                          date.setFullYear(date.getFullYear() + 1);
                                        }
                                        return date.toISOString().split('T')[0];
                                      })()
                                    }
                                  });
                                }}
                              >
                                Mark as Paid
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  // Snooze for a week
                                  updateRecurringBillMutation.mutate({
                                    id: bill.id,
                                    data: {
                                      ...bill,
                                      nextDueDate: (() => {
                                        const date = new Date(bill.nextDueDate);
                                        date.setDate(date.getDate() + 7);
                                        return date.toISOString().split('T')[0];
                                      })()
                                    }
                                  });
                                }}
                              >
                                Snooze for a Week
                              </Button>
                            </div>
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-slate-400 py-6">
                    <p>No recurring bills added yet.</p>
                    <p className="text-sm">Add bills below to track your regular expenses</p>
                  </div>
                )}
              </div>
            </CardContent>
            <Separator />
            <CardHeader>
              <CardTitle className="text-lg">Add New Recurring Bill</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddRecurringBill} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bill-name">Bill Name</Label>
                    <Input 
                      id="bill-name" 
                      value={newRecurringBill.name} 
                      onChange={(e) => setNewRecurringBill({
                        ...newRecurringBill,
                        name: e.target.value
                      })}
                      placeholder="Rent, Utilities, Netflix, etc."
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bill-amount">Amount</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-slate-500">$</span>
                      </div>
                      <Input 
                        id="bill-amount"
                        type="number"
                        step="0.01"
                        value={newRecurringBill.amount} 
                        onChange={(e) => setNewRecurringBill({
                          ...newRecurringBill,
                          amount: e.target.value
                        })}
                        className="pl-7"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bill-frequency">Frequency</Label>
                    <Select 
                      value={newRecurringBill.frequency} 
                      onValueChange={(value) => setNewRecurringBill({
                        ...newRecurringBill,
                        frequency: value as any
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bill-next-due">Next Due Date</Label>
                    <Input 
                      id="bill-next-due"
                      type="date"
                      value={newRecurringBill.nextDueDate} 
                      onChange={(e) => setNewRecurringBill({
                        ...newRecurringBill,
                        nextDueDate: e.target.value
                      })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bill-category">Category (Optional)</Label>
                    <Input 
                      id="bill-category" 
                      value={newRecurringBill.category} 
                      onChange={(e) => setNewRecurringBill({
                        ...newRecurringBill,
                        category: e.target.value
                      })}
                      placeholder="Housing, Utilities, Entertainment, etc."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bill-reminder">Reminder Days</Label>
                    <Input 
                      id="bill-reminder"
                      type="number"
                      min="0"
                      max="30"
                      value={newRecurringBill.reminderDays} 
                      onChange={(e) => setNewRecurringBill({
                        ...newRecurringBill,
                        reminderDays: parseInt(e.target.value)
                      })}
                      required
                    />
                    <p className="text-xs text-slate-500">
                      Days before due date to show reminder
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bill-description">Description (Optional)</Label>
                  <Input 
                    id="bill-description" 
                    value={newRecurringBill.description || ''} 
                    onChange={(e) => setNewRecurringBill({
                      ...newRecurringBill,
                      description: e.target.value
                    })}
                    placeholder="Any additional details about this bill"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="bill-autopay"
                    checked={newRecurringBill.autoPay} 
                    onCheckedChange={(checked) => setNewRecurringBill({
                      ...newRecurringBill,
                      autoPay: checked as boolean
                    })}
                  />
                  <Label htmlFor="bill-autopay" className="text-sm">
                    This bill is set to auto-pay
                  </Label>
                </div>
                
                <Button type="submit" className="w-full">
                  Add Recurring Bill
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Financial Goals</span>
              </CardTitle>
              <CardDescription>Set and track your financial goals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {finances.financialGoals && finances.financialGoals.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {finances.financialGoals.map((goal) => {
                      const progress = parseFloat(goal.targetAmount.toString()) > 0 
                        ? (parseFloat(goal.currentAmount.toString()) / parseFloat(goal.targetAmount.toString())) * 100 
                        : 0;
                      
                      const goalTypeInfo = FinancialGoalTypesInfo[goal.type as keyof typeof FinancialGoalTypesInfo];
                      const targetDate = new Date(goal.targetDate);
                      const daysUntilTarget = Math.ceil((targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      
                      return (
                        <Card key={goal.id}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center">
                                {goalTypeInfo.icon}
                                <CardTitle className="text-lg">{goal.name}</CardTitle>
                              </div>
                              <Button
                                variant="ghost"
                                onClick={() => deleteFinancialGoalMutation.mutate(goal.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-6 w-6"
                                size="sm"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <CardDescription>{goal.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="pb-2 space-y-3">
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>Target: {formatCurrency(goal.targetAmount)}</span>
                              <span>Current: {formatCurrency(goal.currentAmount)}</span>
                            </div>
                            <Progress 
                              value={progress} 
                              className="h-2" 
                              style={{ 
                                backgroundColor: `${goalTypeInfo.color}20`,
                                "--progress-background": goalTypeInfo.color
                              } as React.CSSProperties}
                            />
                            <div className="text-xs text-slate-500 flex justify-between">
                              <span>{progress.toFixed(1)}% Complete</span>
                              <span>{daysUntilTarget > 0 ? `${daysUntilTarget} days remaining` : 'Past due date'}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2 pt-2">
                              <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <span className="text-slate-500">$</span>
                                </div>
                                <Input 
                                  type="number"
                                  step="0.01"
                                  defaultValue={parseFloat(goal.currentAmount.toString())}
                                  onChange={(e) => handleUpdateGoalProgress(goal, e.target.value)}
                                  className="pl-7"
                                />
                              </div>
                              <Button size="sm">Update Progress</Button>
                            </div>
                            
                            {goal.linkedToTaskSchedule && (
                              <div className="flex items-center mt-3 text-sm text-blue-600">
                                <Link className="h-4 w-4 mr-1" />
                                <span>Linked to task schedule</span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-slate-400 py-10">
                    <p>No financial goals added yet.</p>
                    <p className="text-sm">Add goals below to track your progress towards financial milestones</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <form onSubmit={handleAddFinancialGoal} className="w-full space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="goalName">Goal Name</Label>
                    <Input 
                      id="goalName"
                      placeholder="e.g. Emergency Fund"
                      value={newFinancialGoal.name}
                      onChange={(e) => setNewFinancialGoal({
                        ...newFinancialGoal,
                        name: e.target.value
                      })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="goalType">Goal Type</Label>
                    <Select 
                      value={newFinancialGoal.type}
                      onValueChange={(value) => setNewFinancialGoal({
                        ...newFinancialGoal,
                        type: value as any
                      })}
                    >
                      <SelectTrigger id="goalType">
                        <SelectValue placeholder="Select goal type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(FinancialGoalTypesInfo).map((type) => (
                          <SelectItem key={type} value={type}>
                            <div className="flex items-center">
                              {FinancialGoalTypesInfo[type as keyof typeof FinancialGoalTypesInfo].icon}
                              <span>{FinancialGoalTypesInfo[type as keyof typeof FinancialGoalTypesInfo].label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="targetAmount">Target Amount</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-slate-500">$</span>
                      </div>
                      <Input 
                        id="targetAmount"
                        type="number"
                        step="0.01"
                        placeholder="10000"
                        value={newFinancialGoal.targetAmount}
                        onChange={(e) => setNewFinancialGoal({
                          ...newFinancialGoal,
                          targetAmount: e.target.value
                        })}
                        className="pl-7"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="currentAmount">Current Amount</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-slate-500">$</span>
                      </div>
                      <Input 
                        id="currentAmount"
                        type="number"
                        step="0.01"
                        placeholder="0"
                        value={newFinancialGoal.currentAmount}
                        onChange={(e) => setNewFinancialGoal({
                          ...newFinancialGoal,
                          currentAmount: e.target.value
                        })}
                        className="pl-7"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="targetDate">Target Date</Label>
                    <Input 
                      id="targetDate"
                      type="date"
                      value={newFinancialGoal.targetDate}
                      onChange={(e) => setNewFinancialGoal({
                        ...newFinancialGoal,
                        targetDate: e.target.value
                      })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="goalDescription">Description (Optional)</Label>
                    <Input 
                      id="goalDescription"
                      placeholder="Details about this goal"
                      value={newFinancialGoal.description || ""}
                      onChange={(e) => setNewFinancialGoal({
                        ...newFinancialGoal,
                        description: e.target.value
                      })}
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="linkToTasks"
                        checked={newFinancialGoal.linkedToTaskSchedule || false}
                        onChange={(e) => setNewFinancialGoal({
                          ...newFinancialGoal,
                          linkedToTaskSchedule: e.target.checked
                        })}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <Label htmlFor="linkToTasks">Link to task schedule (Creates daily/weekly tasks to help achieve this goal)</Label>
                    </div>
                  </div>
                </div>
                
                <Button type="submit" className="w-full">Add Financial Goal</Button>
              </form>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Accounts Tab */}
        <TabsContent value="accounts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Accounts</CardTitle>
              <CardDescription>Track all your financial accounts in one place</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {finances.accounts && finances.accounts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {finances.accounts.map((account) => {
                      const accountTypeInfo = AccountTypesInfo[account.type as keyof typeof AccountTypesInfo];
                      return (
                        <Card key={account.id} className="overflow-hidden">
                          <div className="h-2" style={{ backgroundColor: account.color || accountTypeInfo.color }} />
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center">
                                {accountTypeInfo.icon}
                                <CardTitle className="text-lg">{account.name}</CardTitle>
                              </div>
                              <Button
                                variant="ghost"
                                onClick={() => deleteAccountMutation.mutate(account.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-6 w-6"
                                size="sm"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <CardDescription>{account.institution}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                              <p className="text-sm text-slate-700 dark:text-slate-300 mb-1">Current Balance</p>
                              <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                                {formatCurrency(account.balance)}
                              </p>
                            </div>
                            {account.interestRate && parseFloat(account.interestRate.toString()) > 0 && (
                              <p className="text-sm text-slate-500 mt-2">
                                Interest Rate: {parseFloat(account.interestRate.toString()).toFixed(2)}%
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-slate-400 py-10">
                    <p>No financial accounts added yet.</p>
                    <p className="text-sm">Add accounts below to track your balances and net worth</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <form onSubmit={handleAddAccount} className="w-full space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="accountName">Account Name</Label>
                    <Input 
                      id="accountName"
                      placeholder="e.g. Chase Checking"
                      value={newAccount.name}
                      onChange={(e) => setNewAccount({
                        ...newAccount,
                        name: e.target.value
                      })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="accountType">Account Type</Label>
                    <Select 
                      value={newAccount.type}
                      onValueChange={(value) => setNewAccount({
                        ...newAccount,
                        type: value as any
                      })}
                    >
                      <SelectTrigger id="accountType">
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(AccountTypesInfo).map((type) => (
                          <SelectItem key={type} value={type}>
                            <div className="flex items-center">
                              {AccountTypesInfo[type as keyof typeof AccountTypesInfo].icon}
                              <span>{AccountTypesInfo[type as keyof typeof AccountTypesInfo].label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="accountBalance">Current Balance</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-slate-500">$</span>
                      </div>
                      <Input 
                        id="accountBalance"
                        type="number"
                        step="0.01"
                        placeholder="0"
                        value={newAccount.balance}
                        onChange={(e) => setNewAccount({
                          ...newAccount,
                          balance: e.target.value
                        })}
                        className="pl-7"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="institution">Institution (Optional)</Label>
                    <Input 
                      id="institution"
                      placeholder="e.g. Chase Bank"
                      value={newAccount.institution}
                      onChange={(e) => setNewAccount({
                        ...newAccount,
                        institution: e.target.value
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="interestRate">Interest Rate % (Optional)</Label>
                    <Input 
                      id="interestRate"
                      type="number"
                      step="0.01"
                      placeholder="e.g. 2.5"
                      value={newAccount.interestRate || ""}
                      onChange={(e) => setNewAccount({
                        ...newAccount,
                        interestRate: e.target.value
                      })}
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full">Add Account</Button>
              </form>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Investments Tab */}
        <TabsContent value="investments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Investment Portfolio</CardTitle>
              <CardDescription>Track your investments and monitor growth</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {finances.investments && finances.investments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {finances.investments.map((investment) => {
                      const investmentTypeInfo = InvestmentTypesInfo[investment.type as keyof typeof InvestmentTypesInfo];
                      const purchasePrice = parseFloat(investment.purchasePrice.toString());
                      const currentValue = parseFloat(investment.value.toString());
                      const profit = currentValue - purchasePrice;
                      const percentChange = purchasePrice > 0 ? (profit / purchasePrice) * 100 : 0;
                      
                      return (
                        <Card key={investment.id} className="overflow-hidden">
                          <div className="h-2" style={{ backgroundColor: investment.color || investmentTypeInfo.color }} />
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center">
                                {investmentTypeInfo.icon}
                                <CardTitle className="text-lg">{investment.name}</CardTitle>
                              </div>
                              <Button
                                variant="ghost"
                                onClick={() => deleteInvestmentMutation.mutate(investment.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-6 w-6"
                                size="sm"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <CardDescription>{investmentTypeInfo.label}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                              <p className="text-sm text-slate-700 dark:text-slate-300 mb-1">Current Value</p>
                              <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                                {formatCurrency(investment.value)}
                              </p>
                            </div>
                            
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500">Purchase Price:</span>
                              <span>{formatCurrency(investment.purchasePrice)}</span>
                            </div>
                            
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500">Profit/Loss:</span>
                              <span className={profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {formatCurrency(profit)} ({percentChange.toFixed(2)}%)
                              </span>
                            </div>
                            
                            {investment.purchaseDate && (
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Purchase Date:</span>
                                <span>{new Date(investment.purchaseDate).toLocaleDateString()}</span>
                              </div>
                            )}
                            
                            {investment.symbol && (
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Symbol:</span>
                                <span className="font-mono">{investment.symbol}</span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-slate-400 py-10">
                    <p>No investments added yet.</p>
                    <p className="text-sm">Add investments below to track your portfolio and growth</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <form onSubmit={handleAddInvestment} className="w-full space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="investmentName">Investment Name</Label>
                    <Input 
                      id="investmentName"
                      placeholder="e.g. Apple Stock"
                      value={newInvestment.name}
                      onChange={(e) => setNewInvestment({
                        ...newInvestment,
                        name: e.target.value
                      })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="investmentType">Investment Type</Label>
                    <Select 
                      value={newInvestment.type}
                      onValueChange={(value) => setNewInvestment({
                        ...newInvestment,
                        type: value as any
                      })}
                    >
                      <SelectTrigger id="investmentType">
                        <SelectValue placeholder="Select investment type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(InvestmentTypesInfo).map((type) => (
                          <SelectItem key={type} value={type}>
                            <div className="flex items-center">
                              {InvestmentTypesInfo[type as keyof typeof InvestmentTypesInfo].icon}
                              <span>{InvestmentTypesInfo[type as keyof typeof InvestmentTypesInfo].label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="currentValue">Current Value</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-slate-500">$</span>
                      </div>
                      <Input 
                        id="currentValue"
                        type="number"
                        step="0.01"
                        placeholder="0"
                        value={newInvestment.value}
                        onChange={(e) => setNewInvestment({
                          ...newInvestment,
                          value: e.target.value
                        })}
                        className="pl-7"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="purchasePrice">Purchase Price</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-slate-500">$</span>
                      </div>
                      <Input 
                        id="purchasePrice"
                        type="number"
                        step="0.01"
                        placeholder="0"
                        value={newInvestment.purchasePrice}
                        onChange={(e) => setNewInvestment({
                          ...newInvestment,
                          purchasePrice: e.target.value
                        })}
                        className="pl-7"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="purchaseDate">Purchase Date (Optional)</Label>
                    <Input 
                      id="purchaseDate"
                      type="date"
                      value={newInvestment.purchaseDate || ""}
                      onChange={(e) => setNewInvestment({
                        ...newInvestment,
                        purchaseDate: e.target.value
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="symbol">Symbol (Optional)</Label>
                    <Input 
                      id="symbol"
                      placeholder="e.g. AAPL"
                      value={newInvestment.symbol || ""}
                      onChange={(e) => setNewInvestment({
                        ...newInvestment,
                        symbol: e.target.value
                      })}
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full">Add Investment</Button>
              </form>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Calculators Tab */}
        <TabsContent value="calculators" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Calculators</CardTitle>
              <CardDescription>Plan your financial future with precision</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeCalculator} onValueChange={(value) => setActiveCalculator(value as CalculatorType)} className="w-full">
                <TabsList className="mb-4 grid grid-cols-2 md:grid-cols-5 gap-2">
                  <TabsTrigger value="retirement">Retirement</TabsTrigger>
                  <TabsTrigger value="mortgage">Mortgage</TabsTrigger>
                  <TabsTrigger value="emergency">Emergency Fund</TabsTrigger>
                  <TabsTrigger value="fire">FIRE</TabsTrigger>
                  <TabsTrigger value="savings">Savings Goal</TabsTrigger>
                </TabsList>
                
                {/* Retirement Calculator */}
                <TabsContent value="retirement" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Retirement Calculator</h3>
                      <div className="space-y-3">
                        <div>
                          <Label>Current Age</Label>
                          <Input 
                            type="number"
                            value={retirementCalcInputs.currentAge}
                            onChange={(e) => setRetirementCalcInputs({
                              ...retirementCalcInputs,
                              currentAge: parseInt(e.target.value) || 0
                            })}
                          />
                        </div>
                        
                        <div>
                          <Label>Retirement Age</Label>
                          <Input 
                            type="number"
                            value={retirementCalcInputs.retirementAge}
                            onChange={(e) => setRetirementCalcInputs({
                              ...retirementCalcInputs,
                              retirementAge: parseInt(e.target.value) || 0
                            })}
                          />
                        </div>
                        
                        <div>
                          <Label>Current Savings</Label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-slate-500">$</span>
                            </div>
                            <Input 
                              type="number"
                              value={retirementCalcInputs.currentSavings}
                              onChange={(e) => setRetirementCalcInputs({
                                ...retirementCalcInputs,
                                currentSavings: parseInt(e.target.value) || 0
                              })}
                              className="pl-7"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label>Annual Contribution</Label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-slate-500">$</span>
                            </div>
                            <Input 
                              type="number"
                              value={retirementCalcInputs.annualContribution}
                              onChange={(e) => setRetirementCalcInputs({
                                ...retirementCalcInputs,
                                annualContribution: parseInt(e.target.value) || 0
                              })}
                              className="pl-7"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label>Expected Return (%)</Label>
                          <Input 
                            type="number"
                            step="0.1"
                            value={retirementCalcInputs.expectedReturn}
                            onChange={(e) => setRetirementCalcInputs({
                              ...retirementCalcInputs,
                              expectedReturn: parseFloat(e.target.value) || 0
                            })}
                          />
                        </div>
                        
                        <div>
                          <Label>Inflation Rate (%)</Label>
                          <Input 
                            type="number"
                            step="0.1"
                            value={retirementCalcInputs.inflationRate}
                            onChange={(e) => setRetirementCalcInputs({
                              ...retirementCalcInputs,
                              inflationRate: parseFloat(e.target.value) || 0
                            })}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg space-y-4">
                      <h3 className="text-lg font-medium">Results</h3>
                      
                      <div>
                        <p className="text-sm text-slate-500">Years until retirement</p>
                        <p className="text-2xl font-bold">{retirementResults.yearsToRetirement} years</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-slate-500">Projected retirement savings</p>
                        <p className="text-2xl font-bold">{formatCurrency(retirementResults.futureValue)}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-slate-500">Estimated annual income in retirement (4% rule)</p>
                        <p className="text-2xl font-bold">{formatCurrency(retirementResults.annualIncome)}</p>
                        <p className="text-sm text-slate-500">Monthly: {formatCurrency(retirementResults.annualIncome / 12)}</p>
                      </div>
                      
                      <div className="pt-4">
                        <p className="text-sm text-slate-500">Need more retirement income?</p>
                        <ul className="text-sm list-disc list-inside space-y-1 pt-2">
                          <li>Increase your annual contributions</li>
                          <li>Delay retirement by a few years</li>
                          <li>Consider a more aggressive investment strategy</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Mortgage Calculator */}
                <TabsContent value="mortgage" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Mortgage Calculator</h3>
                      <div className="space-y-3">
                        <div>
                          <Label>Home Price</Label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-slate-500">$</span>
                            </div>
                            <Input 
                              type="number"
                              value={mortgageCalcInputs.homePrice}
                              onChange={(e) => setMortgageCalcInputs({
                                ...mortgageCalcInputs,
                                homePrice: parseInt(e.target.value) || 0
                              })}
                              className="pl-7"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label>Down Payment</Label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-slate-500">$</span>
                            </div>
                            <Input 
                              type="number"
                              value={mortgageCalcInputs.downPayment}
                              onChange={(e) => setMortgageCalcInputs({
                                ...mortgageCalcInputs,
                                downPayment: parseInt(e.target.value) || 0
                              })}
                              className="pl-7"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label>Interest Rate (%)</Label>
                          <Input 
                            type="number"
                            step="0.1"
                            value={mortgageCalcInputs.interestRate}
                            onChange={(e) => setMortgageCalcInputs({
                              ...mortgageCalcInputs,
                              interestRate: parseFloat(e.target.value) || 0
                            })}
                          />
                        </div>
                        
                        <div>
                          <Label>Loan Term (years)</Label>
                          <Select 
                            value={mortgageCalcInputs.loanTerm.toString()}
                            onValueChange={(value) => setMortgageCalcInputs({
                              ...mortgageCalcInputs,
                              loanTerm: parseInt(value)
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select term" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="15">15 years</SelectItem>
                              <SelectItem value="20">20 years</SelectItem>
                              <SelectItem value="30">30 years</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg space-y-4">
                      <h3 className="text-lg font-medium">Results</h3>
                      
                      <div>
                        <p className="text-sm text-slate-500">Loan amount</p>
                        <p className="text-2xl font-bold">{formatCurrency(mortgageResults.loanAmount)}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-slate-500">Monthly payment</p>
                        <p className="text-2xl font-bold">{formatCurrency(mortgageResults.monthlyPayment)}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-slate-500">Total interest paid</p>
                        <p className="text-2xl font-bold">{formatCurrency(mortgageResults.totalInterest)}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-slate-500">Total cost of loan</p>
                        <p className="text-2xl font-bold">{formatCurrency(mortgageResults.totalCost)}</p>
                      </div>
                      
                      <div className="pt-4">
                        <p className="text-sm text-slate-500">Down payment percentage</p>
                        <p className="text-lg font-medium">
                          {((mortgageCalcInputs.downPayment / mortgageCalcInputs.homePrice) * 100).toFixed(1)}%
                        </p>
                        {mortgageCalcInputs.downPayment / mortgageCalcInputs.homePrice < 0.2 && (
                          <p className="text-sm text-yellow-600 mt-1">
                            Note: Down payments less than 20% may require Private Mortgage Insurance (PMI)
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Emergency Fund Calculator */}
                <TabsContent value="emergency" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Emergency Fund Calculator</h3>
                      <div className="space-y-3">
                        <div>
                          <Label>Monthly Expenses</Label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-slate-500">$</span>
                            </div>
                            <Input 
                              type="number"
                              value={emergencyCalcInputs.monthlyExpenses}
                              onChange={(e) => setEmergencyCalcInputs({
                                ...emergencyCalcInputs,
                                monthlyExpenses: parseInt(e.target.value) || 0
                              })}
                              className="pl-7"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label>Desired Months of Coverage</Label>
                          <Select 
                            value={emergencyCalcInputs.desiredMonths.toString()}
                            onValueChange={(value) => setEmergencyCalcInputs({
                              ...emergencyCalcInputs,
                              desiredMonths: parseInt(value)
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select months" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3">3 months</SelectItem>
                              <SelectItem value="6">6 months</SelectItem>
                              <SelectItem value="9">9 months</SelectItem>
                              <SelectItem value="12">12 months</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg space-y-4">
                      <h3 className="text-lg font-medium">Results</h3>
                      
                      <div>
                        <p className="text-sm text-slate-500">Recommended emergency fund</p>
                        <p className="text-2xl font-bold">{formatCurrency(emergencyFundAmount)}</p>
                      </div>
                      
                      <div className="pt-4">
                        <p className="text-sm text-slate-500">Why have an emergency fund?</p>
                        <ul className="text-sm list-disc list-inside space-y-1 pt-2">
                          <li>Protects against unexpected job loss</li>
                          <li>Covers medical emergencies</li>
                          <li>Handles unforeseen home or car repairs</li>
                          <li>Provides peace of mind</li>
                        </ul>
                      </div>
                      
                      {finances.financialGoals && finances.financialGoals.some(g => g.type === 'emergency_fund') ? (
                        <div className="pt-4">
                          <p className="text-sm font-medium text-green-600">
                            You already have an emergency fund goal! Keep up the good work!
                          </p>
                        </div>
                      ) : (
                        <Button
                          onClick={() => {
                            if (!finances) return;
                            
                            createFinancialGoalMutation.mutate({
                              name: "Emergency Fund",
                              description: `${emergencyCalcInputs.desiredMonths} months of expenses`,
                              type: "emergency_fund",
                              targetAmount: emergencyFundAmount.toString(),
                              currentAmount: "0",
                              targetDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                              financesId: finances.id,
                              relatedTaskIds: [],
                              relatedGoalIds: [],
                              linkedToTaskSchedule: false,
                              isArchived: false
                            } as InsertFinancialGoal);
                            
                            setActiveTab('goals');
                          }}
                          className="mt-4"
                        >
                          Create Emergency Fund Goal
                        </Button>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                {/* FIRE Calculator */}
                <TabsContent value="fire" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Financial Independence (FIRE) Calculator</h3>
                      <div className="space-y-3">
                        <div>
                          <Label>Current Age</Label>
                          <Input 
                            type="number"
                            value={fireCalcInputs.currentAge}
                            onChange={(e) => setFireCalcInputs({
                              ...fireCalcInputs,
                              currentAge: parseInt(e.target.value) || 0
                            })}
                          />
                        </div>
                        
                        <div>
                          <Label>Target FIRE Age</Label>
                          <Input 
                            type="number"
                            value={fireCalcInputs.targetFireAge}
                            onChange={(e) => setFireCalcInputs({
                              ...fireCalcInputs,
                              targetFireAge: parseInt(e.target.value) || 0
                            })}
                          />
                        </div>
                        
                        <div>
                          <Label>Annual Expenses in Retirement</Label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-slate-500">$</span>
                            </div>
                            <Input 
                              type="number"
                              value={fireCalcInputs.currentAnnualExpenses}
                              onChange={(e) => setFireCalcInputs({
                                ...fireCalcInputs,
                                currentAnnualExpenses: parseInt(e.target.value) || 0
                              })}
                              className="pl-7"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label>Safe Withdrawal Rate (%)</Label>
                          <Input 
                            type="number"
                            step="0.1"
                            value={fireCalcInputs.expectedWithdrawalRate}
                            onChange={(e) => setFireCalcInputs({
                              ...fireCalcInputs,
                              expectedWithdrawalRate: parseFloat(e.target.value) || 0
                            })}
                          />
                        </div>
                        
                        <div>
                          <Label>Current Net Worth</Label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-slate-500">$</span>
                            </div>
                            <Input 
                              type="number"
                              value={fireCalcInputs.currentNetWorth}
                              onChange={(e) => setFireCalcInputs({
                                ...fireCalcInputs,
                                currentNetWorth: parseInt(e.target.value) || 0
                              })}
                              className="pl-7"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label>Annual Savings</Label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-slate-500">$</span>
                            </div>
                            <Input 
                              type="number"
                              value={fireCalcInputs.annualContribution}
                              onChange={(e) => setFireCalcInputs({
                                ...fireCalcInputs,
                                annualContribution: parseInt(e.target.value) || 0
                              })}
                              className="pl-7"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label>Expected Return (%)</Label>
                          <Input 
                            type="number"
                            step="0.1"
                            value={fireCalcInputs.expectedReturn}
                            onChange={(e) => setFireCalcInputs({
                              ...fireCalcInputs,
                              expectedReturn: parseFloat(e.target.value) || 0
                            })}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg space-y-4">
                      <h3 className="text-lg font-medium">Results</h3>
                      
                      <div>
                        <p className="text-sm text-slate-500">Target nest egg needed</p>
                        <p className="text-2xl font-bold">{formatCurrency(fireResults.targetNetWorth)}</p>
                        <p className="text-xs text-slate-500">
                          Based on {fireCalcInputs.expectedWithdrawalRate}% withdrawal rate and
                          ${fireCalcInputs.currentAnnualExpenses.toLocaleString()} annual expenses
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-slate-500">Projected nest egg at age {fireCalcInputs.targetFireAge}</p>
                        <p className="text-2xl font-bold">{formatCurrency(fireResults.projectedNetWorth)}</p>
                      </div>
                      
                      {fireResults.isOnTrack ? (
                        <div className="pt-2">
                          <p className="text-sm font-medium text-green-600">
                            You're on track to reach FIRE by age {fireCalcInputs.targetFireAge}!
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Expected to exceed target by {formatCurrency(fireResults.projectedNetWorth - fireResults.targetNetWorth)}
                          </p>
                        </div>
                      ) : (
                        <div className="pt-2">
                          <p className="text-sm font-medium text-red-600">
                            You're projected to fall short of your FIRE goal.
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Projected shortfall: {formatCurrency(fireResults.fireDeficit)}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Additional annual savings needed: {formatCurrency(fireResults.additionalAnnualSavingsNeeded)}
                          </p>
                        </div>
                      )}
                      
                      <Separator className="my-2" />
                      
                      <div>
                        <p className="text-sm text-slate-500">Years to financial independence</p>
                        <p className="text-lg font-bold">{fireCalcInputs.targetFireAge - fireCalcInputs.currentAge} years</p>
                      </div>
                      
                      <div className="pt-2">
                        <p className="text-sm text-slate-500">What is FIRE?</p>
                        <p className="text-xs text-slate-500 mt-1">
                          FIRE stands for "Financial Independence, Retire Early." It's a movement focused on aggressive saving and investing 
                          to enable early retirement. The typical goal is to save 25-30x your annual expenses, 
                          allowing a 3-4% annual withdrawal rate.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Savings Goal Calculator */}
                <TabsContent value="savings" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Savings Goal Calculator</h3>
                      <div className="space-y-3">
                        <div>
                          <Label>Target Amount</Label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-slate-500">$</span>
                            </div>
                            <Input 
                              type="number"
                              value={savingsCalcInputs.targetAmount}
                              onChange={(e) => setSavingsCalcInputs({
                                ...savingsCalcInputs,
                                targetAmount: parseInt(e.target.value) || 0
                              })}
                              className="pl-7"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label>Current Savings</Label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-slate-500">$</span>
                            </div>
                            <Input 
                              type="number"
                              value={savingsCalcInputs.currentSavings}
                              onChange={(e) => setSavingsCalcInputs({
                                ...savingsCalcInputs,
                                currentSavings: parseInt(e.target.value) || 0
                              })}
                              className="pl-7"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label>Timeframe (months)</Label>
                          <Input 
                            type="number"
                            value={savingsCalcInputs.timeframeMonths}
                            onChange={(e) => setSavingsCalcInputs({
                              ...savingsCalcInputs,
                              timeframeMonths: parseInt(e.target.value) || 0
                            })}
                          />
                        </div>
                        
                        <div>
                          <Label>Interest Rate (%)</Label>
                          <Input 
                            type="number"
                            step="0.1"
                            value={savingsCalcInputs.interestRate}
                            onChange={(e) => setSavingsCalcInputs({
                              ...savingsCalcInputs,
                              interestRate: parseFloat(e.target.value) || 0
                            })}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg space-y-4">
                      <h3 className="text-lg font-medium">Results</h3>
                      
                      <div>
                        <p className="text-sm text-slate-500">Amount needed</p>
                        <p className="text-2xl font-bold">{formatCurrency(savingsResults.amountNeeded)}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-slate-500">Monthly savings needed</p>
                        <p className="text-2xl font-bold">{formatCurrency(savingsResults.monthlySavingsNeeded)}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-slate-500">Estimated interest earned</p>
                        <p className="text-lg font-medium">{formatCurrency(savingsResults.totalInterest)}</p>
                      </div>
                      
                      <Separator className="my-2" />
                      
                      <div>
                        <p className="text-sm text-slate-500">Goal timeframe</p>
                        <p className="text-lg font-medium">
                          {savingsCalcInputs.timeframeMonths} months 
                          ({(savingsCalcInputs.timeframeMonths / 12).toFixed(1)} years)
                        </p>
                      </div>
                      
                      <Button
                        onClick={() => {
                          if (!finances) return;
                          
                          // Get a date X months in the future
                          const targetDate = new Date();
                          targetDate.setMonth(targetDate.getMonth() + savingsCalcInputs.timeframeMonths);
                          
                          createFinancialGoalMutation.mutate({
                            name: `Save ${formatCurrency(savingsCalcInputs.targetAmount)}`,
                            description: `Savings goal over ${savingsCalcInputs.timeframeMonths} months`,
                            type: "other",
                            targetAmount: savingsCalcInputs.targetAmount.toString(),
                            currentAmount: savingsCalcInputs.currentSavings.toString(),
                            targetDate: targetDate.toISOString().split('T')[0],
                            financesId: finances.id,
                            relatedTaskIds: [],
                            relatedGoalIds: [],
                            linkedToTaskSchedule: true,
                            isArchived: false
                          } as InsertFinancialGoal);
                          
                          setActiveTab('goals');
                        }}
                        className="mt-4 w-full"
                      >
                        Create Savings Goal & Tasks
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Finances;
