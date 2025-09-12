// import { db } from "@/firebase";
// import { Transaction, TransactionSummary } from "@/types/transaction";
// import {
//   addDoc,
//   collection,
//   deleteDoc,
//   doc,
//   getDoc,
//   getDocs,
//   orderBy,
//   query,
//   updateDoc,
//   where,
// } from "firebase/firestore";

// // Collection references
// export const incomeColRef = collection(db, "income");
// export const expensesColRef = collection(db, "expences");

// // Get all income transactions
// export const getAllIncome = async (): Promise<Transaction[]> => {
//   try {
//     const q = query(incomeColRef, orderBy("Date", "desc"));
//     const snapshot = await getDocs(q);
//     const incomeList = snapshot.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//       type: "income" as const,
//     })) as Transaction[];
//     return incomeList;
//   } catch (error) {
//     console.error("Error fetching income:", error);
//     return [];
//   }
// };

// // Get all expense transactions
// export const getAllExpenses = async (): Promise<Transaction[]> => {
//   try {
//     const q = query(expensesColRef, orderBy("Date", "desc"));
//     const snapshot = await getDocs(q);
//     const expensesList = snapshot.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//       type: "expences" as const,
//     })) as unknown as Transaction[];
//     return expensesList;
//   } catch (error) {
//     console.error("Error fetching expenses:", error);
//     return [];
//   }
// };

// // Get all transactions (income + expenses)
// export const getAllTransactions = async (): Promise<Transaction[]> => {
//   try {
//     const [incomeList, expensesList] = await Promise.all([
//       getAllIncome(),
//       getAllExpenses(),
//     ]);

//     // Combine and sort by date
//     const allTransactions = [...incomeList, ...expensesList];
//     return allTransactions.sort((a, b) => {
//       try {
//         // Handle different date formats
//         const getTimeFromDate = (date: any) => {
//           if (!date) return 0;
//           if (date.seconds) return date.seconds * 1000; // Firebase Timestamp
//           if (typeof date === "string") return new Date(date).getTime();
//           if (date instanceof Date) return date.getTime();
//           if (typeof date === "number") return date;
//           return 0;
//         };

//         const dateA = getTimeFromDate(a.Date);
//         const dateB = getTimeFromDate(b.Date);
//         return dateB - dateA; // Most recent first
//       } catch (error) {
//         console.error("Date sorting error:", error);
//         return 0;
//       }
//     });
//   } catch (error) {
//     console.error("Error fetching all transactions:", error);
//     return [];
//   }
// };

// // Get transaction summary
// export const getTransactionSummary = async (): Promise<TransactionSummary> => {
//   try {
//     const transactions = await getAllTransactions();

//     let totalIncome = 0;
//     let totalExpense = 0;

//     transactions.forEach((transaction) => {
//       if (transaction.type === "income") {
//         totalIncome += Number(transaction.Amount);
//       } else if (transaction.type === "expences") {
//         totalExpense += Number(transaction.Amount);
//       }
//     });

//     return {
//       totalIncome,
//       totalExpense,
//       balance: totalIncome - totalExpense,
//       transactions,
//     };
//   } catch (error) {
//     console.error("Error calculating summary:", error);
//     return {
//       totalIncome: 0,
//       totalExpense: 0,
//       balance: 0,
//       transactions: [],
//     };
//   }
// };

// // Create income transaction
// export const createIncome = async (
//   income: Omit<Transaction, "id" | "type">
// ) => {
//   try {
//     const docRef = await addDoc(incomeColRef, income);
//     return docRef.id;
//   } catch (error) {
//     console.error("Error creating income:", error);
//     throw error;
//   }
// };

// // Create expense transaction
// export const createExpense = async (
//   expense: Omit<Transaction, "id" | "type">
// ) => {
//   try {
//     const docRef = await addDoc(expensesColRef, expense);
//     return docRef.id;
//   } catch (error) {
//     console.error("Error creating expense:", error);
//     throw error;
//   }
// };

// // Update income transaction
// export const updateIncome = async (
//   id: string,
//   income: Partial<Transaction>
// ) => {
//   try {
//     const docRef = doc(db, "income", id);
//     const { id: _id, type, ...incomeData } = income;
//     return await updateDoc(docRef, incomeData);
//   } catch (error) {
//     console.error("Error updating income:", error);
//     throw error;
//   }
// };

// // Update expense transaction
// export const updateExpense = async (
//   id: string,
//   expense: Partial<Transaction>
// ) => {
//   try {
//     const docRef = doc(db, "expences", id);
//     const { id: _id, type, ...expenseData } = expense;
//     return await updateDoc(docRef, expenseData);
//   } catch (error) {
//     console.error("Error updating expense:", error);
//     throw error;
//   }
// };

// // Delete income transaction
// export const deleteIncome = async (id: string) => {
//   try {
//     const docRef = doc(db, "income", id);
//     return await deleteDoc(docRef);
//   } catch (error) {
//     console.error("Error deleting income:", error);
//     throw error;
//   }
// };

// // Delete expense transaction
// export const deleteExpense = async (id: string) => {
//   try {
//     const docRef = doc(db, "expences", id);
//     return await deleteDoc(docRef);
//   } catch (error) {
//     console.error("Error deleting expense:", error);
//     throw error;
//   }
// };

// // Get income by ID
// export const getIncomeById = async (
//   id: string
// ): Promise<Transaction | null> => {
//   try {
//     const docRef = doc(db, "income", id);
//     const snapshot = await getDoc(docRef);
//     return snapshot.exists()
//       ? ({ id: snapshot.id, ...snapshot.data(), type: "income" } as Transaction)
//       : null;
//   } catch (error) {
//     console.error("Error getting income by ID:", error);
//     return null;
//   }
// };

// // Get expense by ID
// export const getExpenseById = async (
//   id: string
// ): Promise<Transaction | null> => {
//   try {
//     const docRef = doc(db, "expences", id);
//     const snapshot = await getDoc(docRef);
//     return snapshot.exists()
//       ? ({
//           id: snapshot.id,
//           ...snapshot.data(),
//           type: "expences",
//         } as unknown as Transaction)
//       : null;
//   } catch (error) {
//     console.error("Error getting expense by ID:", error);
//     return null;
//   }
// };

// // Get transactions by category
// export const getTransactionsByCategory = async (
//   category: string
// ): Promise<Transaction[]> => {
//   try {
//     const [incomeQuery, expenseQuery] = await Promise.all([
//       getDocs(query(incomeColRef, where("Category", "==", category))),
//       getDocs(query(expensesColRef, where("Category", "==", category))),
//     ]);

//     const incomeList = incomeQuery.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//       type: "income" as const,
//     })) as Transaction[];

//     const expensesList = expenseQuery.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//       type: "expense" as const,
//     })) as unknown as Transaction[];

//     return [...incomeList, ...expensesList];
//   } catch (error) {
//     console.error("Error getting transactions by category:", error);
//     return [];
//   }
// };

// // Get transactions by account
// export const getTransactionsByAccount = async (
//   account: string
// ): Promise<Transaction[]> => {
//   try {
//     const [incomeQuery, expenseQuery] = await Promise.all([
//       getDocs(query(incomeColRef, where("Account", "==", account))),
//       getDocs(query(expensesColRef, where("Account", "==", account))),
//     ]);

//     const incomeList = incomeQuery.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//       type: "income" as const,
//     })) as Transaction[];

//     const expensesList = expenseQuery.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//       type: "expences" as const,
//     })) as unknown as Transaction[];

//     return [...incomeList, ...expensesList];
//   } catch (error) {
//     console.error("Error getting transactions by account:", error);
//     return [];
//   }
// };

import { db } from "@/firebase";
import { Transaction, TransactionSummary } from "@/types/transaction";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

// Collection references
export const incomeColRef = collection(db, "income");
export const expensesColRef = collection(db, "expences");

// Helper function to convert various date formats to Date object
const convertToDate = (date: any): Date => {
  if (!date) return new Date();
  if (date instanceof Date) return date;
  if (date.seconds) return new Date(date.seconds * 1000); // Firebase Timestamp
  if (typeof date === "string") return new Date(date);
  if (typeof date === "number") return new Date(date);
  return new Date();
};

// Get all income transactions
export const getAllIncome = async (): Promise<Transaction[]> => {
  try {
    const q = query(incomeColRef, orderBy("Date", "desc"));
    const snapshot = await getDocs(q);
    const incomeList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      type: "income" as const,
    })) as Transaction[];
    return incomeList;
  } catch (error) {
    console.error("Error fetching income:", error);
    return [];
  }
};

// Get all expense transactions
export const getAllExpenses = async (): Promise<Transaction[]> => {
  try {
    const q = query(expensesColRef, orderBy("Date", "desc"));
    const snapshot = await getDocs(q);
    const expensesList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      type: "expences" as const,
    })) as unknown as Transaction[];
    return expensesList;
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return [];
  }
};

// Get income transactions by month and year
export const getIncomeByMonth = async (
  year: number,
  month: number
): Promise<Transaction[]> => {
  try {
    // Create start and end dates for the month (month is 0-indexed)
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

    console.log("Filtering income for:", {
      year,
      month: month + 1, // Display month (1-indexed)
      startOfMonth: startOfMonth.toISOString(),
      endOfMonth: endOfMonth.toISOString(),
    });

    const q = query(
      incomeColRef,
      where("Date", ">=", startOfMonth),
      where("Date", "<=", endOfMonth),
      orderBy("Date", "desc")
    );

    const snapshot = await getDocs(q);
    const incomeList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      type: "income" as const,
    })) as Transaction[];

    console.log(
      `Found ${incomeList.length} income transactions for ${year}-${month + 1}`
    );
    return incomeList;
  } catch (error) {
    console.error("Error fetching income by month:", error);
    return [];
  }
};

// Get expense transactions by month and year
export const getExpensesByMonth = async (
  year: number,
  month: number
): Promise<Transaction[]> => {
  try {
    // Create start and end dates for the month (month is 0-indexed)
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

    console.log("Filtering expenses for:", {
      year,
      month: month + 1, // Display month (1-indexed)
      startOfMonth: startOfMonth.toISOString(),
      endOfMonth: endOfMonth.toISOString(),
    });

    const q = query(
      expensesColRef,
      where("Date", ">=", startOfMonth),
      where("Date", "<=", endOfMonth),
      orderBy("Date", "desc")
    );

    const snapshot = await getDocs(q);
    const expensesList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      type: "expences" as const,
    })) as unknown as Transaction[];

    console.log(
      `Found ${expensesList.length} expense transactions for ${year}-${month + 1}`
    );
    return expensesList;
  } catch (error) {
    console.error("Error fetching expenses by month:", error);
    return [];
  }
};

// Get all transactions by month and year (income + expenses)
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

// Get transaction summary by month
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

// Get all transactions (income + expenses) - existing function
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

// Get transaction summary - existing function
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

// Create income transaction
export const createIncome = async (
  income: Omit<Transaction, "id" | "type">
) => {
  try {
    const docRef = await addDoc(incomeColRef, income);
    return docRef.id;
  } catch (error) {
    console.error("Error creating income:", error);
    throw error;
  }
};

// Create expense transaction
export const createExpense = async (
  expense: Omit<Transaction, "id" | "type">
) => {
  try {
    const docRef = await addDoc(expensesColRef, expense);
    return docRef.id;
  } catch (error) {
    console.error("Error creating expense:", error);
    throw error;
  }
};

// Update income transaction
export const updateIncome = async (
  id: string,
  income: Partial<Transaction>
) => {
  try {
    const docRef = doc(db, "income", id);
    const { id: _id, type, ...incomeData } = income;
    return await updateDoc(docRef, incomeData);
  } catch (error) {
    console.error("Error updating income:", error);
    throw error;
  }
};

// Update expense transaction
export const updateExpense = async (
  id: string,
  expense: Partial<Transaction>
) => {
  try {
    const docRef = doc(db, "expences", id);
    const { id: _id, type, ...expenseData } = expense;
    return await updateDoc(docRef, expenseData);
  } catch (error) {
    console.error("Error updating expense:", error);
    throw error;
  }
};

// Delete income transaction
export const deleteIncome = async (id: string) => {
  try {
    const docRef = doc(db, "income", id);
    return await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting income:", error);
    throw error;
  }
};

// Delete expense transaction
export const deleteExpense = async (id: string) => {
  try {
    const docRef = doc(db, "expences", id);
    return await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting expense:", error);
    throw error;
  }
};

// Get income by ID
export const getIncomeById = async (
  id: string
): Promise<Transaction | null> => {
  try {
    const docRef = doc(db, "income", id);
    const snapshot = await getDoc(docRef);
    return snapshot.exists()
      ? ({ id: snapshot.id, ...snapshot.data(), type: "income" } as Transaction)
      : null;
  } catch (error) {
    console.error("Error getting income by ID:", error);
    return null;
  }
};

// Get expense by ID
export const getExpenseById = async (
  id: string
): Promise<Transaction | null> => {
  try {
    const docRef = doc(db, "expences", id);
    const snapshot = await getDoc(docRef);
    return snapshot.exists()
      ? ({
          id: snapshot.id,
          ...snapshot.data(),
          type: "expences",
        } as unknown as Transaction)
      : null;
  } catch (error) {
    console.error("Error getting expense by ID:", error);
    return null;
  }
};

// Get transactions by category
export const getTransactionsByCategory = async (
  category: string
): Promise<Transaction[]> => {
  try {
    const [incomeQuery, expenseQuery] = await Promise.all([
      getDocs(query(incomeColRef, where("Category", "==", category))),
      getDocs(query(expensesColRef, where("Category", "==", category))),
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

// Get transactions by account
export const getTransactionsByAccount = async (
  account: string
): Promise<Transaction[]> => {
  try {
    const [incomeQuery, expenseQuery] = await Promise.all([
      getDocs(query(incomeColRef, where("Account", "==", account))),
      getDocs(query(expensesColRef, where("Account", "==", account))),
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
