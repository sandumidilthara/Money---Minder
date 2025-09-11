import { Timestamp } from "firebase/firestore";

export interface Transaction {
  id?: string;
  Account: string;
  Amount: number;
  Category: string;
  Date: Date | string | Timestamp;
  Note: string;

  type: "income" | "expences";
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactions: Transaction[];
}
