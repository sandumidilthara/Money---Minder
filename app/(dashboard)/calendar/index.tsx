import { useMonthContext } from "@/app/(dashboard)/_layout";
import { getTransactionsByMonth } from "@/services/transactionService";
import { Transaction } from "@/types/transaction";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface DayData {
  date: number;
  hasIncome: boolean;
  hasExpense: boolean;
  incomeAmount: number;
  expenseAmount: number;
  transactions: Transaction[];
  isCurrentMonth: boolean;
}

const TransactionCalendar: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [calendarData, setCalendarData] = useState<DayData[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  const { currentDate } = useMonthContext();

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatMonthYear = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const generateCalendarData = (transactions: Transaction[]): DayData[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startDayOfWeek = firstDayOfMonth.getDay();

    const prevMonth = new Date(year, month - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();

    const calendarDays: DayData[] = [];

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = daysInPrevMonth - i;
      calendarDays.push({
        date,
        hasIncome: false,
        hasExpense: false,
        incomeAmount: 0,
        expenseAmount: 0,
        transactions: [],
        isCurrentMonth: false,
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayTransactions = transactions.filter((transaction) => {
        let transactionDate: Date;

        const dateField = transaction.Date as any;

        if (dateField && typeof dateField === "object" && dateField.seconds) {
          transactionDate = new Date(dateField.seconds * 1000);
        } else {
          transactionDate = new Date(dateField);
        }

        return transactionDate.getDate() === day;
      });

      const incomeAmount = dayTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + Number(t.Amount), 0);

      const expenseAmount = dayTransactions
        .filter((t) => t.type === "expences")
        .reduce((sum, t) => sum + Number(t.Amount), 0);

      calendarDays.push({
        date: day,
        hasIncome: incomeAmount > 0,
        hasExpense: expenseAmount > 0,
        incomeAmount,
        expenseAmount,
        transactions: dayTransactions,
        isCurrentMonth: true,
      });
    }

    const remainingCells = 42 - calendarDays.length;
    for (let day = 1; day <= remainingCells; day++) {
      calendarDays.push({
        date: day,
        hasIncome: false,
        hasExpense: false,
        incomeAmount: 0,
        expenseAmount: 0,
        transactions: [],
        isCurrentMonth: false,
      });
    }

    return calendarDays;
  };

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      console.log("Loading calendar data for:", {
        year,
        month: month + 1,
        date: currentDate.toDateString(),
      });

      const transactions = await getTransactionsByMonth(year, month);
      const calendarData = generateCalendarData(transactions);
      setCalendarData(calendarData);
    } catch (error) {
      console.error("Error loading calendar data:", error);
      Alert.alert("Error", "Failed to load calendar data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendarData();
    setSelectedDay(null);
  }, [currentDate]);

  useFocusEffect(
    useCallback(() => {
      loadCalendarData();
    }, [currentDate])
  );

  const renderDayCell = (dayData: DayData, index: number) => {
    const isSelected =
      selectedDay?.date === dayData.date &&
      selectedDay?.isCurrentMonth === dayData.isCurrentMonth;

    return (
      <TouchableOpacity
        key={index}
        className={`
          h-16 border border-gray-200 p-1 justify-center items-center
          ${!dayData.isCurrentMonth ? "bg-gray-100" : "bg-white"}
          ${isSelected ? "bg-blue-100 border-blue-300" : ""}
        `}
        style={{ width: "14.28%" }}
        onPress={() => {
          if (dayData.isCurrentMonth && dayData.transactions.length > 0) {
            setSelectedDay(dayData);
          }
        }}
        disabled={!dayData.isCurrentMonth || dayData.transactions.length === 0}
      >
        <Text
          className={`
            text-sm font-medium mb-1
            ${!dayData.isCurrentMonth ? "text-gray-400" : "text-gray-800"}
          `}
        >
          {dayData.date}
        </Text>

        {/* Income indicator */}
        {dayData.hasIncome && (
          <View className="w-2 h-1 bg-green-500 rounded-full mb-0.5" />
        )}

        {/* Expense indicator */}
        {dayData.hasExpense && (
          <View className="w-2 h-1 bg-red-500 rounded-full" />
        )}
      </TouchableOpacity>
    );
  };

  const renderSelectedDayDetails = () => {
    if (!selectedDay) return null;

    return (
      <View className="bg-white mx-4 mb-4 rounded-lg shadow-sm border border-gray-200">
        <View className="p-4 border-b border-gray-200">
          <Text className="text-lg font-semibold text-gray-800">
            {formatMonthYear(currentDate)} {selectedDay.date}
          </Text>
          <View className="flex-row justify-between mt-2">
            {selectedDay.hasIncome && (
              <Text className="text-sm text-green-600 font-medium">
                Income: {formatCurrency(selectedDay.incomeAmount)}
              </Text>
            )}
            {selectedDay.hasExpense && (
              <Text className="text-sm text-red-600 font-medium">
                Expense: {formatCurrency(selectedDay.expenseAmount)}
              </Text>
            )}
          </View>
        </View>

        {/* Mobile Optimized Transaction List */}
        <ScrollView
          style={{ maxHeight: 200 }}
          showsVerticalScrollIndicator={true}
          scrollIndicatorInsets={{ right: 1 }}
          indicatorStyle="black"
          bounces={true}
          alwaysBounceVertical={true}
          nestedScrollEnabled={true}
        >
          {selectedDay.transactions.map((transaction, index) => (
            <View
              key={transaction.id || index}
              className="flex-row justify-between items-center p-4 border-b border-gray-100 bg-white"
            >
              <View className="flex-1 mr-3">
                <Text className="text-sm font-medium text-gray-800 mb-1">
                  {transaction.Category}
                </Text>
                <Text className="text-xs text-gray-500">
                  {transaction.Account}
                </Text>
              </View>
              <View className="items-end">
                <Text
                  className={`text-sm font-bold ${
                    transaction.type === "income"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(transaction.Amount)}
                </Text>
              </View>
            </View>
          ))}

          {/* Scroll indicator for mobile */}
          {selectedDay.transactions.length > 3 && (
            <View className="p-2 bg-gray-50">
              <Text className="text-xs text-gray-500 text-center">
                ↕ Scroll to see all transactions
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#2196F3" />
        <Text className="mt-2 text-gray-600">Loading calendar...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-100"
      showsVerticalScrollIndicator={true}
      scrollIndicatorInsets={{ right: 2 }}
      indicatorStyle="black"
      bounces={true}
      alwaysBounceVertical={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      {/* Header */}
      <View className="p-4 bg-white border-b border-gray-200">
        <Text className="text-xl font-bold text-green-300 mb-1">
          Transaction Calendar
        </Text>
        <Text className="text-sm text-gray-600">
          {formatMonthYear(currentDate)}
        </Text>
        <Text className="text-xs text-gray-500 mt-1">
          Green: Income • Red: Expense • Tap on days with transactions
        </Text>
      </View>

      {/* Calendar Grid */}
      <View className="bg-white mx-4 my-4 rounded-lg shadow-sm overflow-hidden">
        {/* Weekday headers */}
        <View className="flex-row bg-gray-50">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <View
              key={day}
              className="h-10 justify-center items-center border-b border-gray-200"
              style={{ width: "14.28%" }}
            >
              <Text className="text-xs font-medium text-gray-600">{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar days */}
        <View className="flex-row flex-wrap">
          {calendarData.map((dayData, index) => renderDayCell(dayData, index))}
        </View>
      </View>

      {/* Selected day details */}
      {renderSelectedDayDetails()}

      {/* Legend */}
      <View className="bg-white mx-4 mb-4 p-4 rounded-lg shadow-sm">
        <Text className="text-sm font-semibold text-gray-800 mb-2">Legend</Text>
        <View className="flex-row justify-around">
          <View className="flex-row items-center">
            <View className="w-3 h-2 bg-green-500 rounded-full mr-2" />
            <Text className="text-xs text-gray-600">Income</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-2 bg-red-500 rounded-full mr-2" />
            <Text className="text-xs text-gray-600">Expense</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-2 bg-blue-300 rounded mr-2" />
            <Text className="text-xs text-gray-600">Selected</Text>
          </View>
        </View>
      </View>

      {/* Mobile scroll hint */}
      <View className="mx-4 mb-4 p-2 bg-blue-50 rounded-lg">
        <Text className="text-xs text-blue-600 text-center">
          📱 Swipe up/down to scroll • Tap calendar days to view transactions
        </Text>
      </View>
    </ScrollView>
  );
};

export default TransactionCalendar;
