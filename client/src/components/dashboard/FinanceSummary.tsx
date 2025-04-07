import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";
import { Finances } from "@shared/schema";

interface FinanceSummaryProps {
  finances: Finances;
  onViewAll: () => void;
}

const FinanceSummary = ({ finances, onViewAll }: FinanceSummaryProps) => {
  const balance = Number(finances.income) - Number(finances.expenses);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Financial Overview
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-emerald-500/10 dark:bg-emerald-500/20 p-3 rounded-lg">
            <p className="text-xs text-emerald-700 dark:text-emerald-300 mb-1">Monthly Income</p>
            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
              ${Number(finances.income).toFixed(2)}
            </p>
          </div>
          <div className="bg-red-500/10 dark:bg-red-500/20 p-3 rounded-lg">
            <p className="text-xs text-red-700 dark:text-red-300 mb-1">Monthly Expenses</p>
            <p className="text-xl font-bold text-red-700 dark:text-red-300">
              ${Number(finances.expenses).toFixed(2)}
            </p>
          </div>
        </div>
        <div className="bg-muted/50 p-3 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Net Balance</p>
          <p className={`text-xl font-bold ${
            balance >= 0 
              ? 'text-emerald-700 dark:text-emerald-300' 
              : 'text-red-700 dark:text-red-300'
          }`}>
            ${balance.toFixed(2)}
          </p>
        </div>
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
