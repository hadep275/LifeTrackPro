import { Card, CardContent } from "@/components/ui/card";
import { Finances } from "@shared/schema";

interface FinanceSummaryProps {
  finances: Finances;
  onViewAll: () => void;
}

const FinanceSummary = ({ finances, onViewAll }: FinanceSummaryProps) => {
  const balance = finances.income - finances.expenses;
  
  return (
    <Card className="bg-white shadow-sm border border-slate-200">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Financial Overview</h3>
          <button 
            onClick={onViewAll}
            className="text-primary-dark text-sm hover:underline"
          >
            View All
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-xs text-green-700 mb-1">Monthly Income</p>
            <p className="text-xl font-bold text-green-700">${finances.income.toFixed(2)}</p>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <p className="text-xs text-red-700 mb-1">Monthly Expenses</p>
            <p className="text-xl font-bold text-red-700">${finances.expenses.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg">
          <p className="text-xs text-slate-700 mb-1">Net Worth</p>
          <p className={`text-xl font-bold ${balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            ${balance.toFixed(2)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinanceSummary;
