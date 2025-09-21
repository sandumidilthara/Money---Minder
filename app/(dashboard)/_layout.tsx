// import { useAuth } from "@/context/AuthContext";
// import { MaterialIcons } from "@expo/vector-icons";
// import { Tabs, useRouter } from "expo-router";
// import React, { useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   SafeAreaView,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";

// const DashboardLayout = () => {
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const { user, loading } = useAuth();
//   const router = useRouter();
//   console.log("User Data :", user);

//   useEffect(() => {
//     if (!loading && !user) {
//       router.push("/login");
//     }
//   }, [user, loading]);

//   const goToPreviousMonth = () => {
//     setCurrentDate((prevDate) => {
//       const newDate = new Date(prevDate);
//       newDate.setMonth(newDate.getMonth() - 1);
//       return newDate;
//     });
//   };

//   const goToNextMonth = () => {
//     setCurrentDate((prevDate) => {
//       const newDate = new Date(prevDate);
//       newDate.setMonth(newDate.getMonth() + 1);
//       return newDate;
//     });
//   };

//   // Format month display
//   const formatMonthYear = (date: any) => {
//     const options = {
//       year: "numeric",
//       month: "short",
//     };
//     return date.toLocaleDateString("en-US", options);
//   };

//   if (loading) {
//     return (
//       <View className="flex-1 w-full justify-center align-items-center">
//         <ActivityIndicator size="large" />
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView className="flex-1 bg-white">
//       {/* Month Navigation Header */}
//       <View className="flex-row items-center px-5 py-4 bg-gray-50 border-b border-gray-200">
//         <TouchableOpacity
//           onPress={goToPreviousMonth}
//           className="p-2 bg-white rounded-full shadow-sm"
//         >
//           <MaterialIcons name="chevron-left" size={24} color="#2c3e50" />
//         </TouchableOpacity>

//         <Text className="text-lg font-bold text-gray-800 ml-3">
//           {formatMonthYear(currentDate)}
//         </Text>

//         <TouchableOpacity
//           onPress={goToNextMonth}
//           className="p-2 bg-white rounded-full shadow-sm ml-3"
//         >
//           <MaterialIcons name="chevron-right" size={24} color="#2c3e50" />
//         </TouchableOpacity>
//       </View>

//       <Tabs
//         screenOptions={{
//           headerShown: false,
//           tabBarActiveTintColor: "#2ecc71",
//           tabBarInactiveTintColor: "#2c3e50",
//           tabBarStyle: {
//             backgroundColor: "#bdc3c7",
//           },
//         }}
//       >
//         <Tabs.Screen
//           name="transaction"
//           options={{
//             title: "transaction",
//             tabBarIcon: (data) => (
//               <MaterialIcons
//                 name="home-filled"
//                 size={data.size}
//                 color={data.color}
//               />
//             ),
//           }}
//         />
//         <Tabs.Screen
//           name="tasks"
//           // name="tasks/index"
//           options={{
//             title: "Task",
//             tabBarIcon: (data) => (
//               <MaterialIcons
//                 name="check-circle"
//                 size={data.size}
//                 color={data.color}
//               />
//             ),
//           }}
//         />
//         <Tabs.Screen
//           name="profile"
//           options={{
//             title: "Profile",
//             tabBarIcon: (data) => (
//               <MaterialIcons
//                 name="person"
//                 size={data.size}
//                 color={data.color}
//               />
//             ),
//           }}
//         />
//         <Tabs.Screen
//           name="notes"
//           options={{
//             title: "notes",
//             tabBarIcon: (data) => (
//               <MaterialIcons
//                 name="settings"
//                 size={data.size}
//                 color={data.color}
//               />
//             ),
//           }}
//         />
//       </Tabs>
//     </SafeAreaView>
//   );
// };

// export default DashboardLayout;

// app/(dashboard)/_layout.tsx
import { useAuth } from "@/context/AuthContext";
import { MaterialIcons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Create context for sharing month state
interface MonthContextType {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
}

const MonthContext = createContext<MonthContextType | undefined>(undefined);

// Custom hook to use month context
export const useMonthContext = () => {
  const context = useContext(MonthContext);
  if (context === undefined) {
    throw new Error(
      "useMonthContext must be used within MonthContext.Provider"
    );
  }
  return context;
};

const DashboardLayout = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { user, loading } = useAuth();
  const router = useRouter();
  console.log("User Data :", user);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading]);

  const goToPreviousMonth = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  // Format month display
  const formatMonthYear = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
    };
    return date.toLocaleDateString("en-US", options);
  };

  if (loading) {
    return (
      <View className="flex-1 w-full justify-center align-items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <MonthContext.Provider value={{ currentDate, setCurrentDate }}>
      <SafeAreaView className="flex-1 bg-white ">
        {/* Month Navigation Header */}
        <View className="flex-row items-center  m-10 px-5 py-4 bg-gray-50 border-b border-gray-200">
          <TouchableOpacity
            onPress={goToPreviousMonth}
            className="p-2 bg-white rounded-full shadow-sm"
          >
            <MaterialIcons name="chevron-left" size={24} color="#2c3e50" />
          </TouchableOpacity>

          <Text className="text-lg font-bold text-gray-800 ml-3">
            {formatMonthYear(currentDate)}
          </Text>

          <TouchableOpacity
            onPress={goToNextMonth}
            className="p-2 bg-white rounded-full shadow-sm ml-3"
          >
            <MaterialIcons name="chevron-right" size={24} color="#2c3e50" />
          </TouchableOpacity>
        </View>

        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: "#2ecc71",
            tabBarInactiveTintColor: "#2c3e50",
            tabBarStyle: {
              backgroundColor: "#bdc3c7",
            },
          }}
        >
          <Tabs.Screen
            name="transaction"
            options={{
              title: "Transaction",
              tabBarIcon: (data) => (
                <MaterialIcons
                  name="home-filled"
                  size={data.size}
                  color={data.color}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="calendar"
            options={{
              title: "Calendar",
              tabBarIcon: (data) => (
                <MaterialIcons
                  name="check-circle"
                  size={data.size}
                  color={data.color}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="stats"
            options={{
              title: "Stats",
              tabBarIcon: (data) => (
                <MaterialIcons
                  name="person"
                  size={data.size}
                  color={data.color}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="notes"
            options={{
              title: "Notes",
              tabBarIcon: (data) => (
                <MaterialIcons
                  name="settings"
                  size={data.size}
                  color={data.color}
                />
              ),
            }}
          />
        </Tabs>
      </SafeAreaView>
    </MonthContext.Provider>
  );
};

export default DashboardLayout;
