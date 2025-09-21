// import {
//   View,
//   Text,
//   Pressable,
//   ScrollView,
//   TouchableOpacity,
//   Alert
// } from "react-native"
// import React, { useEffect, useState } from "react"
// import { getAllTask, getAllTaskData, taskColRef } from "@/services/taskService"
// import { MaterialIcons } from "@expo/vector-icons"
// import { useRouter, useSegments } from "expo-router"
// import { Task } from "@/types/task"
// import { useLoader } from "@/context/LoaderContext"
// import { onSnapshot } from "firebase/firestore"

// const TasksScreen = () => {
//   const [tasks, setTasks] = useState<Task[]>([])
//   const segment = useSegments()
//   const router = useRouter()
//   const { hideLoader, showLoader } = useLoader()

//   const handleFetchData = async () => {
//     showLoader()
//     await getAllTaskData()
//       .then((data) => {
//         setTasks(data)
//         console.log(data)
//       })
//       .catch((err) => {
//         console.error(err)
//       })
//       .finally(() => {
//         hideLoader()
//       })
//     //  await getAllTask()
//     // .then((data) => {
//     //   console.log(data)
//     // })
//     // .catch((err) => {
//     //   console.error(err)
//     // })
//   }

//   // useEffect(() => {
//   //   handleFetchData()
//   // }, [segment])

//   useEffect(() => {
//     const unsubcribe = onSnapshot(
//       taskColRef,
//       (snapshot) => {
//         const taskList = snapshot.docs.map((taskRef) => ({
//           id: taskRef.id,
//           ...taskRef.data()
//         })) as Task[]
//         setTasks(taskList)
//       },
//       (err) => {
//         console.error(err)
//       }
//     )
//     return () => unsubcribe()
//   }, [])

//   const hadnleDelete = () => {
//     Alert.alert("Alert Title", "Alert Desc", [
//       { text: "Cancel" },
//       {
//         text: "Delete",
//         onPress: async () => {
//           // user is confirmed
//           // so delete task
//           //
//         }
//       }
//     ])
//   }

//   return (
//     <View className="flex-1 w-full justify-center align-items-center">
//       <Text className="text-center text-4xl">Tasks screen</Text>
//       <View className="absolute bottom-5 right-5 z-40">
//         <Pressable
//           className="bg-blue-500 rounded-full p-5 shadow-lg"
//           onPress={() => {
//             router.push("/(dashboard)/tasks/new")
//           }}
//         >
//           <MaterialIcons name="add" size={28} color={"#fff"} />
//         </Pressable>
//       </View>

//       <ScrollView className="mt-4">
//         {tasks.map((task) => {
//           return (
//             <View
//               key={task.id}
//               className="bg-gray-200 p-4 mb-3 rounded-lg mx-4 border border-gray-400"
//             >
//               <Text className="text-lg font-semibold">{task.title}</Text>
//               <Text className="text-sm text-gray-700 mb-2">
//                 {task.description}
//               </Text>
//               <View className="flex-row">
//                 <TouchableOpacity
//                   className="bg-yellow-300 px-3 py-1 rounded"
//                   onPress={() => router.push(`/(dashboard)/tasks/${task.id}`)}
//                 >
//                   <Text className="text-xl">Edit</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity className="bg-red-500 px-3 py-1 rounded ml-3">
//                   <Text className="text-xl">Delete</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           )
//         })}
//       </ScrollView>
//     </View>
//   )
// }

// export default TasksScreen

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

  // Get current selected month from dashboard
  const { currentDate } = useMonthContext();

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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

  // Generate calendar data
  const generateCalendarData = (transactions: Transaction[]): DayData[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get first day of month and number of days
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

    // Get previous month's last days to fill the grid
    const prevMonth = new Date(year, month - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();

    const calendarDays: DayData[] = [];

    // Add previous month's trailing days
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

    // Add current month's days
    // for (let day = 1; day <= daysInMonth; day++) {
    //   const dayTransactions = transactions.filter((transaction) => {
    //     const transactionDate = new Date(

    //       typeof transaction.Date === "object" && transaction.Date.seconds
    //         ? transaction.Date.seconds * 1000
    //         : transaction.Date
    //     );
    //     return transactionDate.getDate() === day;
    //   });

    for (let day = 1; day <= daysInMonth; day++) {
      const dayTransactions = transactions.filter((transaction) => {
        let transactionDate: Date;

        const dateField = transaction.Date as any;

        if (dateField && typeof dateField === "object" && dateField.seconds) {
          // Firestore Timestamp
          transactionDate = new Date(dateField.seconds * 1000);
        } else {
          // String, number, or Date
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

    // Add next month's leading days to complete the grid
    const remainingCells = 42 - calendarDays.length; // 6 rows × 7 days
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

  // Load transactions for the month
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

  // Load data when currentDate changes
  useEffect(() => {
    loadCalendarData();
    setSelectedDay(null); // Clear selection when month changes
  }, [currentDate]);

  // Load data on screen focus
  useFocusEffect(
    useCallback(() => {
      loadCalendarData();
    }, [currentDate])
  );

  // Render day cell
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
        style={{ width: "14.28%" }} // 100% / 7 days
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

  // Render selected day details
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

        <View className="max-h-32">
          <ScrollView>
            {selectedDay.transactions.map((transaction, index) => (
              <View
                key={transaction.id || index}
                className="flex-row justify-between items-center p-3 border-b border-gray-100"
              >
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-800">
                    {transaction.Category}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {transaction.Account}
                  </Text>
                </View>
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
            ))}
          </ScrollView>
        </View>
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
    <ScrollView className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="p-4 bg-white border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-800 mb-1">
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
    </ScrollView>
  );
};

export default TransactionCalendar;
