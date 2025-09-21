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

interface MonthContextType {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
}

const MonthContext = createContext<MonthContextType | undefined>(undefined);

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
      <SafeAreaView className="flex-1 bg-white">
        {/* Month Navigation Header - Compact Design */}
        <View className="flex-row items-center  px-6 pt-2 pb-4 bg-white border-b border-gray-200 shadow-sm mt-6">
          <TouchableOpacity
            onPress={goToPreviousMonth}
            className="p-2 bg-gray-50  shadow-sm border border-gray-100"
          >
            <MaterialIcons name="chevron-left" size={22} color="#2c3e50" />
          </TouchableOpacity>

          <View className="mx-6">
            <Text className="text-lg font-bold text-gray-800 text-center">
              {formatMonthYear(currentDate)}
            </Text>
          </View>

          <TouchableOpacity
            onPress={goToNextMonth}
            className="p-2 bg-gray-50  shadow-sm border border-gray-100"
          >
            <MaterialIcons name="chevron-right" size={22} color="#2c3e50" />
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
                  name="calendar-month"
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
                  name="bar-chart"
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
                  name="sticky-note-2"
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
