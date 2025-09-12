// import { getAllNotes, Note } from "@/services/noteService";

// import {
//   deleteExpense,
//   deleteIncome,
//   getTransactionSummary,
// } from "@/services/transactionService";
// import { Transaction, TransactionSummary } from "@/types/transaction";
// import { MaterialIcons } from "@expo/vector-icons";
// import { useFocusEffect } from "@react-navigation/native";
// import { router } from "expo-router";
// import React, { useCallback, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   FlatList,
//   Pressable,
//   RefreshControl,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";

// const Home = () => {
//   const [summary, setSummary] = useState<TransactionSummary>({
//     totalIncome: 0,
//     totalExpense: 0,
//     balance: 0,
//     transactions: [],
//   });
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [notes, setNotes] = useState<Note[]>([]);
//   // Fetch data from service
//   const loadTransactionData = async () => {
//     try {
//       setLoading(true);
//       const summaryData = await getTransactionSummary();
//       setSummary(summaryData);
//       await loadNotes();
//     } catch (error) {
//       console.error("Error loading transaction data:", error);
//       Alert.alert("Error", "Failed to load transaction data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadNotes = async () => {
//     try {
//       const notesData = await getAllNotes();
//       setNotes(notesData);
//     } catch (error) {
//       console.error("Error loading notes:", error);
//     }
//   };

//   // Pull to refresh
//   const onRefresh = async () => {
//     setRefreshing(true);
//     await loadTransactionData();
//     setRefreshing(false);
//   };

//   // Reload data on screen focus
//   useFocusEffect(
//     useCallback(() => {
//       loadTransactionData();
//     }, [])
//   );

//   // Currency format
//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat("en-US", {
//       style: "currency",
//       currency: "USD",
//     }).format(amount);
//   };

//   // Date format
//   const formatDate = (date: Date | string | any) => {
//     try {
//       let dateObj: Date;

//       if (!date) return "No date";

//       if (typeof date === "object" && date.seconds) {
//         dateObj = new Date(date.seconds * 1000);
//       } else if (typeof date === "string") {
//         dateObj = new Date(date);
//       } else if (date instanceof Date) {
//         dateObj = date;
//       } else if (typeof date === "number") {
//         dateObj = new Date(date);
//       } else {
//         return "Invalid date";
//       }

//       if (isNaN(dateObj.getTime())) return "Invalid date";

//       return dateObj.toLocaleDateString("en-US", {
//         year: "numeric",
//         month: "short",
//         day: "numeric",
//       });
//     } catch (error) {
//       console.error("Date formatting error:", error);
//       return "Date error";
//     }
//   };

//   // Delete transaction
//   const handleDeleteTransaction = (transaction: Transaction) => {
//     Alert.alert(
//       "Delete Transaction",
//       `Are you sure you want to delete this ${transaction.type}?`,
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: async () => {
//             try {
//               if (transaction.id) {
//                 if (transaction.type === "income") {
//                   await deleteIncome(transaction.id);
//                 } else {
//                   await deleteExpense(transaction.id);
//                 }
//                 await loadTransactionData();
//                 Alert.alert("Success", "Transaction deleted successfully");
//               }
//             } catch (error) {
//               console.error("Error deleting transaction:", error);
//               Alert.alert("Error", "Failed to delete transaction");
//             }
//           },
//         },
//       ]
//     );
//   };

//   // Render each transaction row
//   const renderTransactionItem = ({ item }: { item: Transaction }) => {
//     const isIncome = item.type === "income";
//     const amountColorClass = isIncome ? "text-green-500" : "text-red-500";
//     const amountPrefix = isIncome ? "+" : "-";

//     return (
//       <TouchableOpacity
//         className="flex-row justify-between items-center p-4 bg-white border-b border-gray-100"
//         onLongPress={() => handleDeleteTransaction(item)}
//         onPress={() => {
//           router.push(`/(dashboard)/transaction/${item.id}`);
//           // if needed
//         }}
//       >
//         <View className="flex-1">
//           <View className="flex-row items-center mb-1">
//             <View>
//               <Text className="text-base font-semibold text-gray-800 mb-0.5">
//                 {item.Category}
//               </Text>
//               <Text className="text-xs text-gray-500">{item.Account}</Text>
//             </View>
//           </View>
//           {item.Note && (
//             <Text className="text-xs text-gray-600 italic ml-8">
//               {item.Note}
//             </Text>
//           )}
//         </View>

//         <View className="items-end">
//           <Text className={`text-base font-bold mb-0.5 ${amountColorClass}`}>
//             {amountPrefix}
//             {formatCurrency(Math.abs(item.Amount))}
//           </Text>
//           <Text className="text-xs text-gray-500">{formatDate(item.Date)}</Text>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   // Render summary card
//   const renderCompactSummaryCard = (
//     title: string,
//     amount: number,
//     colorClass: string,
//     icon: string
//   ) => (
//     <View className="flex-1 items-center bg-gray-800 py-4 px-2 mx-1 rounded-lg min-h-[90px] justify-center">
//       <Text className="text-xl mb-2">{icon}</Text>
//       <Text className="text-xs font-medium text-gray-400 mb-1.5 text-center">
//         {title}
//       </Text>
//       <Text className={`text-sm font-bold text-center ${colorClass}`}>
//         {formatCurrency(amount)}
//       </Text>
//     </View>
//   );

//   if (loading) {
//     return (
//       <View className="flex-1 justify-center items-center bg-gray-100">
//         <ActivityIndicator size="large" color="#2196F3" />
//         <Text className="mt-2.5 text-base text-gray-600">
//           Loading transactions...
//         </Text>
//       </View>
//     );
//   }

//   return (
//     <View className="flex-1 bg-gray-100">
//       {/* Summary Cards */}
//       <View className="flex-row px-4 py-5 bg-gray-900 justify-between">
//         {renderCompactSummaryCard(
//           "Income",
//           summary.totalIncome,
//           "text-green-500",
//           "💰"
//         )}
//         {renderCompactSummaryCard(
//           "Expense",
//           summary.totalExpense,
//           "text-red-500",
//           "💸"
//         )}
//         {renderCompactSummaryCard(
//           "Balance",
//           summary.balance,
//           summary.balance >= 0 ? "text-green-500" : "text-red-500",
//           "💳"
//         )}
//       </View>

//       <View className="p-4 bg-white border-b border-gray-200">
//         <Text className="text-lg font-semibold text-gray-800 mb-1">
//           Recent Notes
//         </Text>
//         <View className="space-y-1 mt-2">
//           {notes.slice(0, 3).map((note, index) => (
//             <View key={note.id || index} className="flex-row items-start">
//               <Text className="text-gray-400 mr-2 text-xs">•</Text>
//               <Text className="text-xs text-gray-600 flex-1" numberOfLines={1}>
//                 {note.message}
//               </Text>
//             </View>
//           ))}
//           {notes.length === 0 && (
//             <Text className="text-xs text-gray-500">No notes available</Text>
//           )}
//         </View>
//       </View>

//       {/* Transactions list */}
//       <FlatList
//         data={summary.transactions}
//         renderItem={renderTransactionItem}
//         keyExtractor={(item) => item.id || Math.random().toString()}
//         className="flex-1 bg-white"
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//         ListEmptyComponent={
//           <View className="flex-1 justify-center items-center py-12">
//             <Text className="text-lg font-semibold text-gray-600 mb-2">
//               No transactions found
//             </Text>
//             <Text className="text-sm text-gray-500 text-center">
//               Add your first transaction to get started
//             </Text>
//           </View>
//         }
//       />

//       {/* Floating Add button */}
//       <View className="absolute bottom-5 right-5 z-40">
//         <Pressable
//           className="bg-blue-500 rounded-full p-5 shadow-lg"
//           onPress={() => {
//             router.push("/(dashboard)/transaction/new");
//           }}
//         >
//           <MaterialIcons name="add" size={28} color={"#fff"} />
//         </Pressable>
//       </View>
//     </View>
//   );
// };

// export default Home;

import { useMonthContext } from "@/app/(dashboard)/_layout";
import { getNotesByMonth, Note } from "@/services/noteService";
import {
  deleteExpense,
  deleteIncome,
  getTransactionSummaryByMonth,
} from "@/services/transactionService";
import { Transaction, TransactionSummary } from "@/types/transaction";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const Home = () => {
  const [summary, setSummary] = useState<TransactionSummary>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    transactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);

  // Get current selected month from dashboard
  const { currentDate } = useMonthContext();

  // Format month year for display
  const formatMonthYear = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
    };
    return date.toLocaleDateString("en-US", options);
  };

  // Fetch data from service for selected month
  const loadTransactionData = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth(); // 0-indexed

      console.log("Loading home data for:", {
        year,
        month: month + 1, // Display month (1-indexed)
        date: currentDate.toDateString(),
      });

      const summaryData = await getTransactionSummaryByMonth(year, month);
      setSummary(summaryData);
      await loadNotes();
    } catch (error) {
      console.error("Error loading transaction data:", error);
      Alert.alert("Error", "Failed to load transaction data");
    } finally {
      setLoading(false);
    }
  };

  const loadNotes = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth(); // 0-indexed
      const notesData = await getNotesByMonth(year, month);
      setNotes(notesData);
    } catch (error) {
      console.error("Error loading notes:", error);
    }
  };

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactionData();
    setRefreshing(false);
  };

  // Load data when currentDate changes
  useEffect(() => {
    loadTransactionData();
  }, [currentDate]);

  // Reload data on screen focus
  useFocusEffect(
    useCallback(() => {
      loadTransactionData();
    }, [currentDate])
  );

  // Currency format
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Date format
  const formatDate = (date: Date | string | any) => {
    try {
      let dateObj: Date;

      if (!date) return "No date";

      if (typeof date === "object" && date.seconds) {
        dateObj = new Date(date.seconds * 1000);
      } else if (typeof date === "string") {
        dateObj = new Date(date);
      } else if (date instanceof Date) {
        dateObj = date;
      } else if (typeof date === "number") {
        dateObj = new Date(date);
      } else {
        return "Invalid date";
      }

      if (isNaN(dateObj.getTime())) return "Invalid date";

      return dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Date error";
    }
  };

  // Delete transaction
  const handleDeleteTransaction = (transaction: Transaction) => {
    Alert.alert(
      "Delete Transaction",
      `Are you sure you want to delete this ${transaction.type}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (transaction.id) {
                if (transaction.type === "income") {
                  await deleteIncome(transaction.id);
                } else {
                  await deleteExpense(transaction.id);
                }
                await loadTransactionData();
                Alert.alert("Success", "Transaction deleted successfully");
              }
            } catch (error) {
              console.error("Error deleting transaction:", error);
              Alert.alert("Error", "Failed to delete transaction");
            }
          },
        },
      ]
    );
  };

  // Render each transaction row
  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const isIncome = item.type === "income";
    const amountColorClass = isIncome ? "text-green-500" : "text-red-500";
    const amountPrefix = isIncome ? "+" : "-";

    return (
      <TouchableOpacity
        className="flex-row justify-between items-center p-4 bg-white border-b border-gray-100"
        onLongPress={() => handleDeleteTransaction(item)}
        onPress={() => {
          router.push(`/(dashboard)/transaction/${item.id}`);
          // if needed
        }}
      >
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <View>
              <Text className="text-base font-semibold text-gray-800 mb-0.5">
                {item.Category}
              </Text>
              <Text className="text-xs text-gray-500">{item.Account}</Text>
            </View>
          </View>
          {item.Note && (
            <Text className="text-xs text-gray-600 italic ml-8">
              {item.Note}
            </Text>
          )}
        </View>

        <View className="items-end">
          <Text className={`text-base font-bold mb-0.5 ${amountColorClass}`}>
            {amountPrefix}
            {formatCurrency(Math.abs(item.Amount))}
          </Text>
          <Text className="text-xs text-gray-500">{formatDate(item.Date)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Render summary card
  const renderCompactSummaryCard = (
    title: string,
    amount: number,
    colorClass: string,
    icon: string
  ) => (
    <View className="flex-1 items-center bg-gray-800 py-4 px-2 mx-1 rounded-lg min-h-[90px] justify-center">
      <Text className="text-xl mb-2">{icon}</Text>
      <Text className="text-xs font-medium text-gray-400 mb-1.5 text-center">
        {title}
      </Text>
      <Text className={`text-sm font-bold text-center ${colorClass}`}>
        {formatCurrency(amount)}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#2196F3" />
        <Text className="mt-2.5 text-base text-gray-600">
          Loading transactions...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      {/* Summary Cards */}
      <View className="flex-row px-4 py-5 bg-gray-900 justify-between">
        {renderCompactSummaryCard(
          "Income",
          summary.totalIncome,
          "text-green-500",
          "💰"
        )}
        {renderCompactSummaryCard(
          "Expense",
          summary.totalExpense,
          "text-red-500",
          "💸"
        )}
        {renderCompactSummaryCard(
          "Balance",
          summary.balance,
          summary.balance >= 0 ? "text-green-500" : "text-red-500",
          "💳"
        )}
      </View>

      <View className="p-4 bg-white border-b border-gray-200">
        <Text className="text-lg font-semibold text-gray-800 mb-1">
          Recent Notes - {formatMonthYear(currentDate)}
        </Text>
        <View className="space-y-1 mt-2">
          {notes.slice(0, 3).map((note, index) => (
            <View key={note.id || index} className="flex-row items-start">
              <Text className="text-gray-400 mr-2 text-xs">•</Text>
              <Text className="text-xs text-gray-600 flex-1" numberOfLines={1}>
                {note.message}
              </Text>
            </View>
          ))}
          {notes.length === 0 && (
            <Text className="text-xs text-gray-500">
              No notes available for this month
            </Text>
          )}
        </View>
      </View>

      {/* Transactions list */}
      <FlatList
        data={summary.transactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id || Math.random().toString()}
        className="flex-1 bg-white"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-12">
            <Text className="text-lg font-semibold text-gray-600 mb-2">
              No transactions found
            </Text>
            <Text className="text-sm text-gray-500 text-center">
              No transactions found for {formatMonthYear(currentDate)}. Add your
              first transaction to get started.
            </Text>
          </View>
        }
      />

      {/* Floating Add button */}
      <View className="absolute bottom-5 right-5 z-40">
        <Pressable
          className="bg-blue-500 rounded-full p-5 shadow-lg"
          onPress={() => {
            router.push("/(dashboard)/transaction/new");
          }}
        >
          <MaterialIcons name="add" size={28} color={"#fff"} />
        </Pressable>
      </View>
    </View>
  );
};

export default Home;
