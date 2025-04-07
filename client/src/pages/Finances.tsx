import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Finances as FinancesType, ExpenseCategory } from "@shared/schema";

const Finances = () => {
  const [finances, setFinances] = useLocalStorage<FinancesType>("finances", {
    id: 1,
    income: 0,
    expenses: 0,
    expenseCategories: []
  });
  
  const [newExpenseCategory, setNewExpenseCategory] = useState<Omit<ExpenseCategory, "id">>({
    name: "",
    amount: 0
  });
  
  const updateFinances = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure total expenses reflect the sum of expense categories
    const totalExpenses = finances.expenseCategories.reduce(
      (total, category) => total + category.amount, 
      0
    );
    
    setFinances({
      ...finances,
      expenses: totalExpenses
    });
  };
  
  const addExpenseCategory = (e: React.FormEvent) => {
    e.preventDefault();
    
    const category: ExpenseCategory = {
      id: Date.now(),
      name: newExpenseCategory.name,
      amount: parseFloat(newExpenseCategory.amount.toString())
    };
    
    const updatedCategories = [...finances.expenseCategories, category];
    const totalExpenses = updatedCategories.reduce(
      (total, cat) => total + cat.amount, 
      0
    );
    
    setFinances({
      ...finances,
      expenseCategories: updatedCategories,
      expenses: totalExpenses
    });
    
    // Reset form
    setNewExpenseCategory({
      name: "",
      amount: 0
    });
  };
  
  const deleteExpenseCategory = (id: number) => {
    const updatedCategories = finances.expenseCategories.filter(
      category => category.id !== id
    );
    
    const totalExpenses = updatedCategories.reduce(
      (total, cat) => total + cat.amount, 
      0
    );
    
    setFinances({
      ...finances,
      expenseCategories: updatedCategories,
      expenses: totalExpenses
    });
  };
  
  const handleIncomeChange = (value: string) => {
    const income = parseFloat(value) || 0;
    setFinances({
      ...finances,
      income
    });
  };
  
  const balance = finances.income - finances.expenses;
  
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold mb-6">Finances</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Income & Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={updateFinances} className="space-y-4">
              <div>
                <Label htmlFor="incomeAmount">Monthly Income</Label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500">$</span>
                  </div>
                  <Input 
                    id="incomeAmount"
                    type="number"
                    step="0.01"
                    value={finances.income}
                    onChange={(e) => handleIncomeChange(e.target.value)}
                    className="pl-7"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="expensesAmount">Monthly Expenses (Calculated)</Label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500">$</span>
                  </div>
                  <Input 
                    id="expensesAmount"
                    type="number"
                    value={finances.expenses}
                    disabled
                    className="pl-7 bg-slate-50"
                  />
                </div>
              </div>
              
              <Button type="submit">Update Budget</Button>
            </form>
          </CardContent>
        </Card>
        
        {/* Budget Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-700 mb-1">Monthly Income</p>
                <p className="text-2xl font-bold text-green-700">${finances.income.toFixed(2)}</p>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-700 mb-1">Monthly Expenses</p>
                <p className="text-2xl font-bold text-red-700">${finances.expenses.toFixed(2)}</p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-700 mb-1">Monthly Balance</p>
                <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  ${balance.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Expense Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form onSubmit={addExpenseCategory} className="space-y-4">
              <div>
                <Label htmlFor="categoryName">Category Name</Label>
                <Input 
                  id="categoryName"
                  value={newExpenseCategory.name}
                  onChange={(e) => setNewExpenseCategory({...newExpenseCategory, name: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="categoryAmount">Amount</Label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500">$</span>
                  </div>
                  <Input 
                    id="categoryAmount"
                    type="number"
                    step="0.01"
                    value={newExpenseCategory.amount}
                    onChange={(e) => setNewExpenseCategory({
                      ...newExpenseCategory, 
                      amount: parseFloat(e.target.value) || 0
                    })}
                    className="pl-7"
                    required
                  />
                </div>
              </div>
              
              <Button type="submit">Add Category</Button>
            </form>
            
            <div>
              <h4 className="font-medium text-sm mb-3">Expense Categories</h4>
              
              <ul className="space-y-2">
                {finances.expenseCategories.length > 0 ? (
                  finances.expenseCategories.map((category) => (
                    <li key={category.id} className="flex justify-between items-center p-2 border-b border-slate-100">
                      <span>{category.name}</span>
                      <div className="flex items-center">
                        <span className="text-slate-700 mr-2">${category.amount.toFixed(2)}</span>
                        <Button
                          variant="ghost"
                          onClick={() => deleteExpenseCategory(category.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-slate-500 text-center py-2">
                    No expense categories yet!
                  </li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Finances;
