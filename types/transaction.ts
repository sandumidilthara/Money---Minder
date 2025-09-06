export interface Transaction {
  id?: string;
  Account: string;
  Amount: number;
  Category: string;
  Date: Date | string;
  Note: string;
  type: "income" | "expense";
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactions: Transaction[];
}
