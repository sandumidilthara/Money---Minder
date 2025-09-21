import { auth, db } from "@/firebase";
import { Transaction, TransactionSummary } from "@/types/transaction";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

export const incomeColRef = collection(db, "income");
export const expensesColRef = collection(db, "expences");

const convertToDate = (date: any): Date => {
  if (!date) return new Date();
  if (date instanceof Date) return date;
  if (date.seconds) return new Date(date.seconds * 1000);
  if (typeof date === "string") return new Date(date);
  if (typeof date === "number") return new Date(date);
  return new Date();
};

export const getAllIncome = async (): Promise<Transaction[]> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    // Simple query to avoid index issues
    const q = query(incomeColRef, where("email", "==", currentUser.email));
    const snapshot = await getDocs(q);

    const incomeList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      type: "income" as const,
    })) as Transaction[];

    // Sort in JavaScript by Date descending
    return incomeList.sort((a, b) => {
      try {
        const dateA = convertToDate(a.Date).getTime();
        const dateB = convertToDate(b.Date).getTime();
        return dateB - dateA; // Most recent first
      } catch (error) {
        console.error("Date sorting error:", error);
        return 0;
      }
    });
  } catch (error) {
    console.error("Error fetching income:", error);
    return [];
  }
};

export const getAllExpenses = async (): Promise<Transaction[]> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const q = query(expensesColRef, where("email", "==", currentUser.email));
    const snapshot = await getDocs(q);

    const expensesList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      type: "expences" as const,
    })) as unknown as Transaction[];

    // Sort in JavaScript by Date descending
    return expensesList.sort((a, b) => {
      try {
        const dateA = convertToDate(a.Date).getTime();
        const dateB = convertToDate(b.Date).getTime();
        return dateB - dateA; // Most recent first
      } catch (error) {
        console.error("Date sorting error:", error);
        return 0;
      }
    });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return [];
  }
};

export const getIncomeByMonth = async (
  year: number,
  month: number
): Promise<Transaction[]> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    console.log("Filtering income for:", {
      email: currentUser.email,
      year,
      month: month + 1, // Display month (1-indexed)
    });

    const q = query(incomeColRef, where("email", "==", currentUser.email));
    const snapshot = await getDocs(q);

    const allIncome = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      type: "income" as const,
    })) as Transaction[];

    const filteredIncome = allIncome.filter((transaction) => {
      const transactionDate = convertToDate(transaction.Date);
      return (
        transactionDate.getFullYear() === year &&
        transactionDate.getMonth() === month
      );
    });

    // Sort by Date descending
    const sortedIncome = filteredIncome.sort((a, b) => {
      try {
        const dateA = convertToDate(a.Date).getTime();
        const dateB = convertToDate(b.Date).getTime();
        return dateB - dateA; // Most recent first
      } catch (error) {
        console.error("Date sorting error:", error);
        return 0;
      }
    });

    console.log(
      `Found ${sortedIncome.length} income transactions for ${currentUser.email} in ${year}-${month + 1}`
    );
    return sortedIncome;
  } catch (error) {
    console.error("Error fetching income by month:", error);
    return [];
  }
};

export const getExpensesByMonth = async (
  year: number,
  month: number
): Promise<Transaction[]> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    console.log("Filtering expenses for:", {
      email: currentUser.email,
      year,
      month: month + 1,
    });

    const q = query(expensesColRef, where("email", "==", currentUser.email));
    const snapshot = await getDocs(q);

    const allExpenses = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      type: "expences" as const,
    })) as unknown as Transaction[];

    // Filter by month and year in JavaScript
    const filteredExpenses = allExpenses.filter((transaction) => {
      const transactionDate = convertToDate(transaction.Date);
      return (
        transactionDate.getFullYear() === year &&
        transactionDate.getMonth() === month
      );
    });

    // Sort by Date descending
    const sortedExpenses = filteredExpenses.sort((a, b) => {
      try {
        const dateA = convertToDate(a.Date).getTime();
        const dateB = convertToDate(b.Date).getTime();
        return dateB - dateA; // Most recent first
      } catch (error) {
        console.error("Date sorting error:", error);
        return 0;
      }
    });

    console.log(
      `Found ${sortedExpenses.length} expense transactions for ${currentUser.email} in ${year}-${month + 1}`
    );
    return sortedExpenses;
  } catch (error) {
    console.error("Error fetching expenses by month:", error);
    return [];
  }
};

export const getTransactionsByMonth = async (
  year: number,
  month: number
): Promise<Transaction[]> => {
  try {
    const [incomeList, expensesList] = await Promise.all([
      getIncomeByMonth(year, month),
      getExpensesByMonth(year, month),
    ]);

    // Combine and sort by date
    const allTransactions = [...incomeList, ...expensesList];
    return allTransactions.sort((a, b) => {
      try {
        const dateA = convertToDate(a.Date).getTime();
        const dateB = convertToDate(b.Date).getTime();
        return dateB - dateA; // Most recent first
      } catch (error) {
        console.error("Date sorting error:", error);
        return 0;
      }
    });
  } catch (error) {
    console.error("Error fetching transactions by month:", error);
    return [];
  }
};

export const getTransactionSummaryByMonth = async (
  year: number,
  month: number
): Promise<TransactionSummary> => {
  try {
    const transactions = await getTransactionsByMonth(year, month);

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((transaction) => {
      if (transaction.type === "income") {
        totalIncome += Number(transaction.Amount);
      } else if (transaction.type === "expences") {
        totalExpense += Number(transaction.Amount);
      }
    });

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactions,
    };
  } catch (error) {
    console.error("Error calculating monthly summary:", error);
    return {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      transactions: [],
    };
  }
};

export const getAllTransactions = async (): Promise<Transaction[]> => {
  try {
    const [incomeList, expensesList] = await Promise.all([
      getAllIncome(),
      getAllExpenses(),
    ]);

    // Combine and sort by date
    const allTransactions = [...incomeList, ...expensesList];
    return allTransactions.sort((a, b) => {
      try {
        const dateA = convertToDate(a.Date).getTime();
        const dateB = convertToDate(b.Date).getTime();
        return dateB - dateA; // Most recent first
      } catch (error) {
        console.error("Date sorting error:", error);
        return 0;
      }
    });
  } catch (error) {
    console.error("Error fetching all transactions:", error);
    return [];
  }
};

export const getTransactionSummary = async (): Promise<TransactionSummary> => {
  try {
    const transactions = await getAllTransactions();

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((transaction) => {
      if (transaction.type === "income") {
        totalIncome += Number(transaction.Amount);
      } else if (transaction.type === "expences") {
        totalExpense += Number(transaction.Amount);
      }
    });

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactions,
    };
  } catch (error) {
    console.error("Error calculating summary:", error);
    return {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      transactions: [],
    };
  }
};

export const createIncome = async (
  income: Omit<Transaction, "id" | "type">
) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const docRef = await addDoc(incomeColRef, {
      ...income,
      email: currentUser.email, // Automatically add user's email
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating income:", error);
    throw error;
  }
};

export const createExpense = async (
  expense: Omit<Transaction, "id" | "type">
) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const docRef = await addDoc(expensesColRef, {
      ...expense,
      email: currentUser.email, // Automatically add user's email
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating expense:", error);
    throw error;
  }
};

export const updateIncome = async (
  id: string,
  income: Partial<Transaction>
) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    // First check if the income belongs to the current user
    const existingIncome = await getIncomeById(id);
    if (!existingIncome) {
      throw new Error("Income transaction not found");
    }

    const docRef = doc(db, "income", id);
    const { id: _id, type, ...incomeData } = income;
    return await updateDoc(docRef, incomeData);
  } catch (error) {
    console.error("Error updating income:", error);
    throw error;
  }
};

export const updateExpense = async (
  id: string,
  expense: Partial<Transaction>
) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    // First check if the expense belongs to the current user
    const existingExpense = await getExpenseById(id);
    if (!existingExpense) {
      throw new Error("Expense transaction not found");
    }

    const docRef = doc(db, "expences", id);
    const { id: _id, type, ...expenseData } = expense;
    return await updateDoc(docRef, expenseData);
  } catch (error) {
    console.error("Error updating expense:", error);
    throw error;
  }
};

export const deleteIncome = async (id: string) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    // First check if the income belongs to the current user
    const existingIncome = await getIncomeById(id);
    if (!existingIncome) {
      throw new Error("Income transaction not found");
    }

    const docRef = doc(db, "income", id);
    return await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting income:", error);
    throw error;
  }
};

export const deleteExpense = async (id: string) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    // First check if the expense belongs to the current user
    const existingExpense = await getExpenseById(id);
    if (!existingExpense) {
      throw new Error("Expense transaction not found");
    }

    const docRef = doc(db, "expences", id);
    return await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting expense:", error);
    throw error;
  }
};

export const getIncomeById = async (
  id: string
): Promise<Transaction | null> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const docRef = doc(db, "income", id);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      const data = snapshot.data();

      // Check if the income belongs to the current user
      if (data.email !== currentUser.email) {
        throw new Error("Unauthorized access to income transaction");
      }

      return { id: snapshot.id, ...data, type: "income" } as Transaction;
    }
    return null;
  } catch (error) {
    console.error("Error getting income by ID:", error);
    return null;
  }
};

export const getExpenseById = async (
  id: string
): Promise<Transaction | null> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const docRef = doc(db, "expences", id);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      const data = snapshot.data();

      // Check if the expense belongs to the current user
      if (data.email !== currentUser.email) {
        throw new Error("Unauthorized access to expense transaction");
      }

      return {
        id: snapshot.id,
        ...data,
        type: "expences",
      } as unknown as Transaction;
    }
    return null;
  } catch (error) {
    console.error("Error getting expense by ID:", error);
    return null;
  }
};

export const getTransactionsByCategory = async (
  category: string
): Promise<Transaction[]> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const [incomeQuery, expenseQuery] = await Promise.all([
      getDocs(
        query(
          incomeColRef,
          where("email", "==", currentUser.email),
          where("Category", "==", category)
        )
      ),
      getDocs(
        query(
          expensesColRef,
          where("email", "==", currentUser.email),
          where("Category", "==", category)
        )
      ),
    ]);

    const incomeList = incomeQuery.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      type: "income" as const,
    })) as Transaction[];

    const expensesList = expenseQuery.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      type: "expense" as const,
    })) as unknown as Transaction[];

    return [...incomeList, ...expensesList];
  } catch (error) {
    console.error("Error getting transactions by category:", error);
    return [];
  }
};

export const getTransactionsByAccount = async (
  account: string
): Promise<Transaction[]> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const [incomeQuery, expenseQuery] = await Promise.all([
      getDocs(
        query(
          incomeColRef,
          where("email", "==", currentUser.email),
          where("Account", "==", account)
        )
      ),
      getDocs(
        query(
          expensesColRef,
          where("email", "==", currentUser.email),
          where("Account", "==", account)
        )
      ),
    ]);

    const incomeList = incomeQuery.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      type: "income" as const,
    })) as Transaction[];

    const expensesList = expenseQuery.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      type: "expences" as const,
    })) as unknown as Transaction[];

    return [...incomeList, ...expensesList];
  } catch (error) {
    console.error("Error getting transactions by account:", error);
    return [];
  }
};
