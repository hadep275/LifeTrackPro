import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  TrendingUp, 
  PiggyBank, 
  CreditCard, 
  LineChart, 
  Target,
  AlertCircle
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Finances } from "@shared/schema";

interface FinanceSummaryProps {
  finances: Finances;
  onViewAll: () => void;
}

const FinanceSummary = ({ finances, onViewAll }: FinanceSummaryProps) => {
  const balance = Number(finances.income) - Number(finances.expenses);
  const savings = Number(finances.savings || 0);
  const netWorth = Number(finances.netWorth || 0);
  
  // Format currency helper function
  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numAmount);
  };
  
  // Get top financial goal by progress percentage
  const topGoal = finances.financialGoals && finances.financialGoals.length > 0
    ? finances.financialGoals.reduce((prev, current) => {
        const prevProgress = Number(prev.currentAmount) / Number(prev.targetAmount) * 100;
        const currProgress = Number(current.currentAmount) / Number(current.targetAmount) * 100;
        return prevProgress > currProgress ? prev : current;
      })
    : null;

  // Calculate goal progress percentage
  const goalProgress = topGoal 
    ? (Number(topGoal.currentAmount) / Number(topGoal.targetAmount) * 100) 
    : 0;
    
  // Get due bills
  const dueBills = finances.recurringBills && finances.recurringBills.length > 0 
    ? finances.recurringBills.filter(bill => {
        const dueDate = new Date(bill.nextDueDate);
        const today = new Date();
        const differenceInDays = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
        return differenceInDays >= 0 && differenceInDays <= 7;
      })
    : [];
    
  // Count investments and accounts
  const investmentCount = finances.investments?.length || 0;
  const accountCount = finances.accounts?.length || 0;
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Financial Overview
          </CardTitle>
        </div>
        <CardDescription>
          {netWorth > 0 ? `Net Worth: ${formatCurrency(netWorth)}` : "Track your finances"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-emerald-500/10 dark:bg-emerald-500/20 p-3 rounded-lg">
            <p className="text-xs text-emerald-700 dark:text-emerald-300 mb-1">Monthly Income</p>
            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
              {formatCurrency(finances.income)}
            </p>
          </div>
          <div className="bg-red-500/10 dark:bg-red-500/20 p-3 rounded-lg">
            <p className="text-xs text-red-700 dark:text-red-300 mb-1">Monthly Expenses</p>
            <p className="text-xl font-bold text-red-700 dark:text-red-300">
              {formatCurrency(finances.expenses)}
            </p>
          </div>
        </div>
        
        <div className="bg-muted/50 p-3 rounded-lg">
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">Net Balance</p>
            <p className={`text-base font-bold ${
              balance >= 0 
                ? 'text-emerald-700 dark:text-emerald-300' 
                : 'text-red-700 dark:text-red-300'
            }`}>
              {formatCurrency(balance)}
            </p>
          </div>
          
          {savings > 0 && (
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-muted-foreground flex items-center">
                <PiggyBank className="h-3 w-3 mr-1" />
                Savings
              </p>
              <p className="text-base font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(savings)}
              </p>
            </div>
          )}
        </div>
        
        {/* Top Financial Goal */}
        {topGoal && (
          <div className="bg-blue-500/10 dark:bg-blue-500/20 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-1">
              <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center">
                <Target className="h-3 w-3 mr-1" />
                Top Goal: {topGoal.name}
              </p>
              <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                {goalProgress.toFixed(0)}%
              </p>
            </div>
            <Progress 
              value={goalProgress} 
              className="h-1.5 mb-1" 
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(topGoal.currentAmount)} of {formatCurrency(topGoal.targetAmount)}
            </p>
          </div>
        )}
        
        {/* Accounts & Investments Summary */}
        {(accountCount > 0 || investmentCount > 0) && (
          <div className="grid grid-cols-2 gap-2">
            {accountCount > 0 && (
              <div className="bg-purple-500/10 dark:bg-purple-500/20 p-2 rounded-lg">
                <p className="text-xs text-purple-700 dark:text-purple-300 flex items-center">
                  <CreditCard className="h-3 w-3 mr-1" />
                  Accounts
                </p>
                <p className="text-sm font-bold text-purple-700 dark:text-purple-300">
                  {accountCount}
                </p>
              </div>
            )}
            
            {investmentCount > 0 && (
              <div className="bg-amber-500/10 dark:bg-amber-500/20 p-2 rounded-lg">
                <p className="text-xs text-amber-700 dark:text-amber-300 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Investments
                </p>
                <p className="text-sm font-bold text-amber-700 dark:text-amber-300">
                  {investmentCount}
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Upcoming Bills */}
        {dueBills.length > 0 && (
          <div className="bg-orange-500/10 dark:bg-orange-500/20 p-3 rounded-lg">
            <p className="text-xs text-orange-700 dark:text-orange-300 flex items-center mb-1">
              <AlertCircle className="h-3 w-3 mr-1" />
              Upcoming Bills ({dueBills.length})
            </p>
            {dueBills.slice(0, 2).map((bill, index) => (
              <div key={index} className="flex justify-between items-center mt-1">
                <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                  {bill.name}
                </p>
                <p className="text-xs font-medium text-orange-700 dark:text-orange-300">
                  {formatCurrency(bill.amount)}
                </p>
              </div>
            ))}
            {dueBills.length > 2 && (
              <p className="text-xs text-muted-foreground mt-1">
                +{dueBills.length - 2} more bills due soon
              </p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" onClick={onViewAll} className="w-full">
          View All Finances
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FinanceSummary;
