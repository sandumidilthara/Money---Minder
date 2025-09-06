import {
  deleteExpense,
  deleteIncome,
  getTransactionSummary,
} from "@/services/transactionService";
import { Transaction, TransactionSummary } from "@/types/transaction";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface HomeScreenProps {
  navigation: any; // Replace with proper navigation type
}

const Home: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [summary, setSummary] = useState<TransactionSummary>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    transactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load data from Firestore
  const loadTransactionData = async () => {
    try {
      setLoading(true);
      const summaryData = await getTransactionSummary();
      setSummary(summaryData);
    } catch (error) {
      console.error("Error loading transaction data:", error);
      Alert.alert("Error", "Failed to load transaction data");
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactionData();
    setRefreshing(false);
  };

  // Load data when screen focuses
  useFocusEffect(
    useCallback(() => {
      loadTransactionData();
    }, [])
  );

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format date
  const formatDate = (date: Date | string | any) => {
    try {
      let dateObj: Date;

      if (!date) {
        return "No date";
      }

      // Handle Firebase Timestamp
      if (date && typeof date === "object" && date.seconds) {
        dateObj = new Date(date.seconds * 1000);
      }
      // Handle string dates
      else if (typeof date === "string") {
        dateObj = new Date(date);
      }
      // Handle Date objects
      else if (date instanceof Date) {
        dateObj = date;
      }
      // Handle timestamp numbers
      else if (typeof date === "number") {
        dateObj = new Date(date);
      } else {
        return "Invalid date";
      }

      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        return "Invalid date";
      }

      // Format the date
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
                await loadTransactionData(); // Refresh data
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

  // Render transaction item
  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const isIncome = item.type === "income";
    const amountColorClass = isIncome ? "text-green-500" : "text-red-500";
    const amountPrefix = isIncome ? "+" : "-";

    return (
      <TouchableOpacity
        className="flex-row justify-between items-center p-4 bg-white border-b border-gray-100"
        onLongPress={() => handleDeleteTransaction(item)}
        onPress={() => {
          // Navigate to edit screen if needed
          // navigation.navigate('EditTransaction', { transaction: item })
        }}
      >
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="text-xl mr-3">
              {item.Category.includes("food")
                ? "🍽️"
                : item.Category.includes("salary")
                  ? "💰"
                  : item.Category.includes("junk")
                    ? "🍟"
                    : "📝"}
            </Text>
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

  // Render compact summary card for horizontal layout
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
      {/* Horizontal Summary Cards */}
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

      {/* Quick Stats */}
      <View className="p-4 bg-white border-b border-gray-200">
        <Text className="text-lg font-semibold text-gray-800 mb-1">
          Recent Transactions
        </Text>
        <Text className="text-sm text-gray-600">
          {summary.transactions.length} transactions total
        </Text>
      </View>

      {/* Transactions List */}
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
              Add your first transaction to get started
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-5 right-5 w-14 h-14 rounded-full bg-blue-500 justify-center items-center shadow-lg"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
        onPress={() => {
          // Navigate to add transaction screen
          // navigation.navigate('AddTransaction')
        }}
      >
        <Text className="text-2xl text-white font-bold">+</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Home;
