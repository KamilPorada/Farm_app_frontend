export type ExpenseCategory = {
  id: number;              
  name: string;
  icon?: string | null;    
};

export type Expense = {
  id: number;                  
  expenseCategoryId: number;   
  expenseDate: string;         
  title: string;
  quantity: number;           
  unit: string;
  price: number;             
};
