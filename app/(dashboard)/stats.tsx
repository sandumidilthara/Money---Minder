// import { useLoader } from "@/context/LoaderContext";
// import { getAllExpenses } from "@/services/transactionService";
// import { Transaction } from "@/types/transaction";
// import { useFocusEffect } from "@react-navigation/native";
// import React, { useCallback, useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   Dimensions,
//   RefreshControl,
//   ScrollView,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { PieChart } from "react-native-chart-kit";

// const { width: screenWidth } = Dimensions.get("window");

// interface CategoryData {
//   name: string;
//   amount: number;
//   percentage: number;
//   color: string;
//   legendFontColor: string;
//   legendFontSize: number;
// }

// interface CategorySummary {
//   [category: string]: number;
// }

// const ExpensePieChart: React.FC = () => {
//   const [chartData, setChartData] = useState<CategoryData[]>([]);
//   const [totalExpenses, setTotalExpenses] = useState<number>(0);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [refreshing, setRefreshing] = useState<boolean>(false);
//   const { showLoader, hideLoader } = useLoader();

//   // Color palette for different categories
//   const colors = [
//     "#FF6384", // Red
//     "#36A2EB", // Blue
//     "#FFCE56", // Yellow
//     "#4BC0C0", // Teal
//     "#9966FF", // Purple
//     "#FF9F40", // Orange
//     "#FF6384", // Pink
//     "#C9CBCF", // Gray
//     "#4BC0C0", // Cyan
//     "#FF6384", // Coral
//   ];

//   // Format currency
//   const formatCurrency = (amount: number): string => {
//     return new Intl.NumberFormat("en-US", {
//       style: "currency",
//       currency: "USD",
//     }).format(amount);
//   };

//   // Load and process expense data
//   const loadExpenseData = async (showLoadingIndicator = true) => {
//     try {
//       if (showLoadingIndicator) {
//         setLoading(true);
//         showLoader();
//       }

//       const expenses = await getAllExpenses();

//       if (expenses.length === 0) {
//         setChartData([]);
//         setTotalExpenses(0);
//         return;
//       }

//       // Group expenses by category
//       const categorySummary: CategorySummary = {};
//       let total = 0;

//       expenses.forEach((expense: Transaction) => {
//         const category = expense.Category || "Other";
//         const amount = Number(expense.Amount) || 0;

//         if (categorySummary[category]) {
//           categorySummary[category] += amount;
//         } else {
//           categorySummary[category] = amount;
//         }

//         total += amount;
//       });

//       // Convert to chart data format
//       const processedData: CategoryData[] = Object.entries(categorySummary)
//         .map(([category, amount], index) => ({
//           name: category,
//           amount: amount,
//           percentage: total > 0 ? (amount / total) * 100 : 0,
//           color: colors[index % colors.length],
//           legendFontColor: "#333333",
//           legendFontSize: 12,
//         }))
//         .sort((a, b) => b.amount - a.amount); // Sort by amount descending

//       setChartData(processedData);
//       setTotalExpenses(total);
//     } catch (error) {
//       console.error("Error loading expense data:", error);
//       Alert.alert("Error", "Failed to load expense data");
//       setChartData([]);
//       setTotalExpenses(0);
//     } finally {
//       if (showLoadingIndicator) {
//         setLoading(false);
//         hideLoader();
//       }
//     }
//   };

//   // Pull to refresh function
//   const onRefresh = async () => {
//     setRefreshing(true);
//     await loadExpenseData(false); // Don't show loading indicator during pull-to-refresh
//     setRefreshing(false);
//   };

//   // Auto-refresh when screen comes into focus (like your Home screen)
//   useFocusEffect(
//     useCallback(() => {
//       loadExpenseData();
//     }, [])
//   );

//   // Initial load
//   useEffect(() => {
//     loadExpenseData();
//   }, []);

//   // Render loading state
//   if (loading) {
//     return (
//       <View className="flex-1 justify-center items-center p-4">
//         <ActivityIndicator size="large" color="#2196F3" />
//         <Text className="mt-2 text-gray-600">Loading expense data...</Text>
//       </View>
//     );
//   }

//   // Render empty state
//   if (chartData.length === 0) {
//     return (
//       <View className="flex-1 justify-center items-center p-4">
//         <Text className="text-lg font-semibold text-gray-600 mb-2">
//           No Expense Data
//         </Text>
//         <Text className="text-sm text-gray-500 text-center">
//           Add some expenses to see the breakdown chart
//         </Text>
//         <TouchableOpacity
//           className="mt-4 bg-blue-500 px-6 py-3 rounded-lg"
//           onPress={() => loadExpenseData()}
//         >
//           <Text className="text-white font-medium">Refresh</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   return (
//     <ScrollView
//       className="flex-1 bg-gray-100"
//       refreshControl={
//         <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//       }
//     >
//       {/* Header */}
//       <View className="p-4 bg-white border-b border-gray-200">
//         <Text className="text-xl font-bold text-gray-800 mb-1">
//           Expense Breakdown
//         </Text>
//         <Text className="text-sm text-gray-600">
//           Total: {formatCurrency(totalExpenses)}
//         </Text>
//       </View>

//       {/* Pie Chart */}
//       <View className="bg-white mx-4 my-4 p-4 rounded-lg shadow-sm">
//         <PieChart
//           data={chartData}
//           width={screenWidth - 64} // Adjust for margins
//           height={220}
//           chartConfig={{
//             backgroundColor: "#ffffff",
//             backgroundGradientFrom: "#ffffff",
//             backgroundGradientTo: "#ffffff",
//             color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
//           }}
//           accessor="amount"
//           backgroundColor="transparent"
//           paddingLeft="15"
//           center={[10, 10]}
//           absolute // Show absolute values instead of percentages
//         />
//       </View>

//       {/* Category Details */}
//       <View className="bg-white mx-4 mb-4 rounded-lg shadow-sm">
//         <View className="p-4 border-b border-gray-200">
//           <Text className="text-lg font-semibold text-gray-800">
//             Category Details
//           </Text>
//         </View>

//         {chartData.map((item, index) => (
//           <View
//             key={item.name}
//             className="flex-row items-center justify-between p-4 border-b border-gray-100"
//           >
//             {/* Category indicator and name */}
//             <View className="flex-row items-center flex-1">
//               <View
//                 className="w-4 h-4 rounded-full mr-3"
//                 style={{ backgroundColor: item.color }}
//               />
//               <View>
//                 <Text className="text-base font-medium text-gray-800">
//                   {item.name}
//                 </Text>
//                 <Text className="text-sm text-gray-500">
//                   {item.percentage.toFixed(1)}%
//                 </Text>
//               </View>
//             </View>

//             {/* Amount */}
//             <Text className="text-base font-bold text-red-600">
//               {formatCurrency(item.amount)}
//             </Text>
//           </View>
//         ))}
//       </View>
//     </ScrollView>
//   );
// };

// export default ExpensePieChart;

import { useMonthContext } from "@/app/(dashboard)/_layout";
import { useLoader } from "@/context/LoaderContext";
import { getExpensesByMonth } from "@/services/transactionService";
import { Transaction } from "@/types/transaction";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PieChart } from "react-native-chart-kit";

const { width: screenWidth } = Dimensions.get("window");

interface CategoryData {
  name: string;
  amount: number;
  percentage: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

interface CategorySummary {
  [category: string]: number;
}

const ExpensePieChart: React.FC = () => {
  const [chartData, setChartData] = useState<CategoryData[]>([]);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { showLoader, hideLoader } = useLoader();

  // Get current selected month from dashboard
  const { currentDate } = useMonthContext();

  // Color palette for different categories
  const colors = [
    "#F39F9F", // Red
    "#A3CCDA", // Blue
    "#F8F7BA", // Yellow
    "#A0C878", // Teal
    "#9966FF", // Purple
    "#FF9F40", // Orange
    "#A35C7A", // Pink
    "#C9CBCF", // Gray
    "#4BC0C0", // Cyan
    "#FF6384", // Coral
  ];

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "LKR",
    }).format(amount);
  };

  // Format month year for display
  const formatMonthYear = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
    };
    return date.toLocaleDateString("en-US", options);
  };

  // Load and process expense data for selected month
  const loadExpenseData = async (showLoadingIndicator = true) => {
    try {
      if (showLoadingIndicator) {
        setLoading(true);
        showLoader();
      }

      const year = currentDate.getFullYear();
      const month = currentDate.getMonth(); // 0-indexed

      console.log("Loading expense chart data for:", {
        year,
        month: month + 1, // Display month (1-indexed)
        date: currentDate.toDateString(),
      });

      const expenses = await getExpensesByMonth(year, month);

      if (expenses.length === 0) {
        setChartData([]);
        setTotalExpenses(0);
        return;
      }

      // Group expenses by category
      const categorySummary: CategorySummary = {};
      let total = 0;

      expenses.forEach((expense: Transaction) => {
        const category = expense.Category || "Other";
        const amount = Number(expense.Amount) || 0;

        if (categorySummary[category]) {
          categorySummary[category] += amount;
        } else {
          categorySummary[category] = amount;
        }

        total += amount;
      });

      // Convert to chart data format
      const processedData: CategoryData[] = Object.entries(categorySummary)
        .map(([category, amount], index) => ({
          name: category,
          amount: amount,
          percentage: total > 0 ? (amount / total) * 100 : 0,
          color: colors[index % colors.length],
          legendFontColor: "#333333",
          legendFontSize: 12,
        }))
        .sort((a, b) => b.amount - a.amount); // Sort by amount descending

      setChartData(processedData);
      setTotalExpenses(total);
    } catch (error) {
      console.error("Error loading expense data:", error);
      Alert.alert("Error", "Failed to load expense data");
      setChartData([]);
      setTotalExpenses(0);
    } finally {
      if (showLoadingIndicator) {
        setLoading(false);
        hideLoader();
      }
    }
  };

  // Pull to refresh function
  const onRefresh = async () => {
    setRefreshing(true);
    await loadExpenseData(false); // Don't show loading indicator during pull-to-refresh
    setRefreshing(false);
  };

  // Load data when currentDate changes
  useEffect(() => {
    loadExpenseData();
  }, [currentDate]);

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadExpenseData();
    }, [currentDate])
  );

  // Render loading state
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <ActivityIndicator size="large" color="#2196F3" />
        <Text className="mt-2 text-gray-600">Loading expense data...</Text>
      </View>
    );
  }

  // Render empty state
  if (chartData.length === 0) {
    return (
      <ScrollView
        className="flex-1 bg-gray-100"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="p-4 bg-white border-b border-gray-200">
          <Text className="text-xl font-bold text-gray-800 mb-1">
            Expense Breakdown
          </Text>
          <Text className="text-sm text-gray-600">
            {formatMonthYear(currentDate)}
          </Text>
        </View>

        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-lg font-semibold text-gray-600 mb-2">
            No Expense Data
          </Text>
          <Text className="text-sm text-gray-500 text-center">
            No expenses found for {formatMonthYear(currentDate)}. Add some
            expenses to see the breakdown chart.
          </Text>
          <TouchableOpacity
            className="mt-4 bg-blue-500 px-6 py-3 rounded-lg"
            onPress={() => loadExpenseData()}
          >
            <Text className="text-white font-medium">Refresh</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-100"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View className="p-4 bg-white border-b border-gray-200">
        <Text className="text-xl font-bold text-green-300 mb-1">
          Expense Breakdown
        </Text>
        <Text className="text-sm text-gray-600">
          {formatMonthYear(currentDate)} - Total:{" "}
          {formatCurrency(totalExpenses)}
        </Text>
      </View>

      {/* Pie Chart */}
      <View className="bg-white mx-4 my-4 p-4 rounded-lg shadow-sm">
        <PieChart
          data={chartData}
          width={screenWidth - 64} // Adjust for margins
          height={220}
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="15"
          center={[10, 10]}
          absolute // Show absolute values instead of percentages
        />
      </View>

      {/* Category Details */}
      <View className="bg-white mx-4 mb-4 rounded-lg shadow-sm">
        <View className="p-4 border-b border-gray-200">
          <Text className="text-lg font-semibold text-gray-800">
            Category Details
          </Text>
        </View>

        {chartData.map((item, index) => (
          <View
            key={item.name}
            className="flex-row items-center justify-between p-4 border-b border-gray-100"
          >
            {/* Category indicator and name */}
            <View className="flex-row items-center flex-1">
              <View
                className="w-4 h-4 rounded-full mr-3"
                style={{ backgroundColor: item.color }}
              />
              <View>
                <Text className="text-base font-medium text-gray-800">
                  {item.name}
                </Text>
                <Text className="text-sm text-gray-500">
                  {item.percentage.toFixed(1)}%
                </Text>
              </View>
            </View>

            {/* Amount */}
            <Text className="text-base font-bold text-red-600">
              {formatCurrency(item.amount)}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default ExpensePieChart;
