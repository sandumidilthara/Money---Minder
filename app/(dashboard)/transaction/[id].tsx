import { useLoader } from "@/context/LoaderContext";
import {
  createIncomeCategory,
  getAllIncomeCategories,
} from "@/services/incomeCategoryService";
import {
  createExpense,
  createIncome,
  getExpenseById,
  getIncomeById,
  updateExpense,
  updateIncome,
} from "@/services/transactionService";

import {
  createExpenseCategory,
  getAllExpenseCategories,
} from "@/services/expenseCategoryService";

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Timestamp } from "firebase/firestore";

let dateValue: Date;

const { width, height } = Dimensions.get("window");

interface Category {
  id: string;
  name: string;
}

const TransactionFormScreen = () => {
  const { id, type } = useLocalSearchParams<{
    id?: string;
    type?: "income" | "expences";
  }>();
  const isNew = !id || id === "new";
  const [transactionType, setTransactionType] = useState<"income" | "expences">(
    type || "expences"
  );
  const [account, setAccount] = useState<string>("Cash");
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<string>("");

  // Initialize with proper date format
  const now = new Date();
  const [date, setDate] = useState<string>(
    now.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    })
  );
  const [time, setTime] = useState<string>(
    now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  );

  const [note, setNote] = useState<string>("");
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [showAddCategoryModal, setShowAddCategoryModal] =
    useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>("");

  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);

  const router = useRouter();
  const { hideLoader, showLoader } = useLoader();

  const accounts = ["Cash", "Bank", "Credit Card", "Savings"];

  const parseDateTime = (dateStr: string, timeStr: string): Date => {
    try {
      const [month, day, year] = dateStr
        .split("/")
        .map((num) => parseInt(num, 10));
      const [hours, minutes] = timeStr
        .split(":")
        .map((num) => parseInt(num, 10));
      const parsedDate = new Date(year, month - 1, day, hours, minutes);

      if (isNaN(parsedDate.getTime())) {
        throw new Error("Invalid date");
      }
      return parsedDate;
    } catch (error) {
      console.error("Date parsing error:", error);
      return new Date();
    }
  };

  const formatDateForDisplay = (date: Date): { date: string; time: string } => {
    return {
      date: date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    };
  };

  const loadCategories = async () => {
    try {
      showLoader();
      const [incomeData, expenseData] = await Promise.all([
        getAllIncomeCategories(),
        getAllExpenseCategories(),
      ]);

      setIncomeCategories(incomeData);
      setExpenseCategories(expenseData);
    } catch (error) {
      console.error("Error loading categories:", error);
      Alert.alert("Error", "Failed to load categories");
    } finally {
      hideLoader();
    }
  };

  const handleAddNewCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert("Validation", "Category name is required");
      return;
    }

    try {
      showLoader();
      let newCategoryId: string;

      if (transactionType === "income") {
        newCategoryId = await createIncomeCategory({
          name: newCategoryName.trim(),
        });

        const newCategory = { id: newCategoryId, name: newCategoryName.trim() };
        setIncomeCategories((prev) => [...prev, newCategory]);
      } else {
        newCategoryId = await createExpenseCategory({
          name: newCategoryName.trim(),
        });

        const newCategory = { id: newCategoryId, name: newCategoryName.trim() };
        setExpenseCategories((prev) => [...prev, newCategory]);
      }

      // Set the new category as selected
      setCategory(newCategoryName.trim());

      setShowAddCategoryModal(false);
      setShowCategoryModal(false);
      setNewCategoryName("");

      Alert.alert("Success", "Category added successfully!");
    } catch (error) {
      console.error("Error adding category:", error);
      Alert.alert("Error", "Failed to add category");
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const loadTransactionData = async () => {
      if (!isNew && id) {
        try {
          showLoader();
          let transaction = null;
          let actualTransactionType: "income" | "expences" = "expences";

          try {
            transaction = await getIncomeById(id);
            if (transaction) {
              actualTransactionType = "income";
            }
          } catch (incomeError) {
            console.log("Not an income transaction, trying expense...");
          }

          if (!transaction) {
            try {
              transaction = await getExpenseById(id);
              if (transaction) {
                actualTransactionType = "expences";
              }
            } catch (expenseError) {
              console.error("Transaction not found in either collection");
              Alert.alert("Error", "Transaction not found");
              router.back();
              return;
            }
          }

          setTransactionType(actualTransactionType);

          if (transaction) {
            setAccount(transaction.Account);
            setAmount(transaction.Amount.toString());
            setCategory(transaction.Category);
            setNote(transaction.Note || "");

            if (transaction.Date instanceof Date) {
              dateValue = transaction.Date;
            } else if (transaction.Date instanceof Timestamp) {
              dateValue = transaction.Date.toDate();
            } else if (typeof transaction.Date === "string") {
              dateValue = new Date(transaction.Date);
            } else {
              dateValue = new Date();
            }

            const formatted = formatDateForDisplay(dateValue);
            setDate(formatted.date);
            setTime(formatted.time);
          }
        } catch (error) {
          console.error("Error loading transaction:", error);
          Alert.alert("Error", "Failed to load transaction data");
        } finally {
          hideLoader();
        }
      }
    };

    loadTransactionData();
  }, [id, isNew]);

  const handleSubmit = async () => {
    if (!amount.trim() || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert("Validation", "Valid amount is required");
      return;
    }
    if (!category.trim()) {
      Alert.alert("Validation", "Category is required");
      return;
    }

    try {
      showLoader();
      const dateTime = parseDateTime(date, time);
      const transactionData = {
        Account: account,
        Amount: Number(amount),
        Category: category,
        Date: dateTime,
        Note: note,
      };

      console.log("Submitting transaction data:", {
        ...transactionData,
        Date: dateTime.toISOString(),
      });

      if (isNew) {
        if (transactionType === "income") {
          await createIncome(transactionData);
        } else {
          await createExpense(transactionData);
        }
      } else {
        if (transactionType === "income") {
          await updateIncome(id!, transactionData);
        } else {
          await updateExpense(id!, transactionData);
        }
      }
      router.back();
    } catch (err) {
      console.error("Error saving transaction:", err);
      Alert.alert("Error", "Failed to save transaction");
    } finally {
      hideLoader();
    }
  };

  const getCurrentCategories = (): Category[] => {
    return transactionType === "income" ? incomeCategories : expenseCategories;
  };

  const AddCategoryModal = () => (
    <Modal
      visible={showAddCategoryModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {
        setShowAddCategoryModal(false);
        setNewCategoryName("");
      }}
    >
      <View className="flex-1 bg-green-50 bg-opacity-50 justify-center items-center">
        <View className="bg-gray-400 rounded-lg p-6 mx-8 w-80">
          <Text className="text-white text-xl font-bold mb-4 text-center">
            Add New Category
          </Text>

          <TextInput
            className="bg-gray-700 text-white p-4 rounded-lg mb-6 text-lg"
            value={newCategoryName}
            onChangeText={setNewCategoryName}
            placeholder="Enter category name"
            placeholderTextColor="#9CA3AF"
            autoFocus={true}
          />

          <View className="flex-row space-x-3">
            <TouchableOpacity
              className="flex-1 bg-gray-600 py-3 rounded-lg"
              onPress={() => {
                setShowAddCategoryModal(false);
                setNewCategoryName("");
              }}
            >
              <Text className="text-white text-center font-medium">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 py-3 rounded-lg ${
                transactionType === "income" ? "bg-green-600" : "bg-red-600"
              }`}
              onPress={handleAddNewCategory}
            >
              <Text className="text-white text-center font-medium">Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const CategoryModal = () => (
    <Modal
      visible={showCategoryModal}
      transparent={false}
      animationType="slide"
      onRequestClose={() => setShowCategoryModal(false)}
      hardwareAccelerated={false}
    >
      <View className="flex-1 bg-green-50 pt-6 android:pt-0">
        {/* Header */}
        <View className="flex-row justify-between items-center px-5 py-4 border-b border-gray-600">
          <Text className="text-green-600 text-xl font-bold">
            Select Category
          </Text>
          <TouchableOpacity
            onPress={() => setShowCategoryModal(false)}
            className="w-9 h-9 rounded-full bg-gray-600 justify-center items-center"
          >
            <Text className="text-white text-xl font-bold">×</Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 15 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row flex-wrap justify-between">
            {/* Add Category Button */}
            <TouchableOpacity
              className={`border-2 border-dashed py-5 px-2.5 rounded-lg mb-4 items-center justify-center min-h-[85px] ${
                transactionType === "income"
                  ? "border-green-500 bg-green-900 bg-opacity-20"
                  : "border-red-500 bg-red-900 bg-opacity-20"
              }`}
              style={{
                width: (width - 45) / 3,
              }}
              activeOpacity={0.8}
              onPress={() => setShowAddCategoryModal(true)}
            >
              <Text
                className={`text-4xl mb-1 ${
                  transactionType === "income"
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                +
              </Text>
              <Text
                className={`text-xs text-center font-medium ${
                  transactionType === "income"
                    ? "text-green-300"
                    : "text-red-300"
                }`}
              >
                Add New
              </Text>
            </TouchableOpacity>

            {/* Existing Categories */}
            {getCurrentCategories().map((cat, index) => (
              <TouchableOpacity
                key={cat.id}
                className="bg-green-200 py-5 px-2.5 rounded-lg mb-4 items-center justify-center min-h-[85px]"
                style={{
                  width: (width - 45) / 3,
                }}
                activeOpacity={0.8}
                onPress={() => {
                  setCategory(cat.name);
                  setShowCategoryModal(false);
                }}
              >
                <Text className="text-green-600 text-sm text-center font-medium leading-tight">
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView className="flex-1 bg-green-50">
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center p-4 border-b border-gray-700">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-green-600 text-2xl">←</Text>
          </TouchableOpacity>
          <Text className="text-green-600 text-xl font-bold capitalize">
            {isNew ? transactionType : `Edit ${transactionType}`}
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-green-600 text-2xl">×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1">
          {/* Transaction Type Tabs */}
          <View className="flex-row p-4 space-x-2">
            <TouchableOpacity
              className={`flex-1 py-3 px-4 rounded-lg border-2 ${
                transactionType === "income"
                  ? "bg-green-600 border-green-500"
                  : "bg-gray-200 border-gray-300"
              }`}
              onPress={() => {
                setTransactionType("income");
                setCategory("");
              }}
              disabled={!isNew}
            >
              <Text className="text-white text-center font-medium">Income</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 px-4 rounded-lg border-2 ${
                transactionType === "expences"
                  ? "bg-red-600 border-red-500"
                  : "bg-gray-200 border-gray-300"
              }`}
              onPress={() => {
                setTransactionType("expences");
                setCategory("");
              }}
              disabled={!isNew}
            >
              <Text className="text-white text-center font-medium">
                Expense
              </Text>
            </TouchableOpacity>
          </View>

          {/* Date & Time */}
          <View className="px-4 py-2">
            <Text className="text-gray-400 text-sm mb-2">Date</Text>
            <View className="flex-row space-x-4">
              <TextInput
                className="text-green-600 text-lg bg-transparent flex-1"
                value={date}
                onChangeText={setDate}
                placeholder="MM/DD/YYYY"
                placeholderTextColor="#9CA3AF"
              />
              <TextInput
                className="text-green-600 text-lg bg-transparent flex-1"
                value={time}
                onChangeText={setTime}
                placeholder="HH:MM"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View className="h-px bg-gray-700 mt-3" />
          </View>

          {/* Amount */}
          <View className="px-4 py-4">
            <Text className="text-gray-400 text-sm mb-2">Amount</Text>
            <TextInput
              className="text-green-600 text-2xl bg-transparent"
              value={amount}
              onChangeText={setAmount}
              placeholder="$ 0.00"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
            <View className="h-px bg-gray-700 mt-3" />
          </View>

          {/* Category */}
          <TouchableOpacity
            className="px-4 py-4"
            onPress={() => setShowCategoryModal(true)}
          >
            <Text className="text-gray-400 text-sm mb-2">Category</Text>
            <View className="flex-row items-center">
              <Text className="text-green-600 text-lg">
                {category || "Select category"}
              </Text>
            </View>
            <View className="h-px bg-red-500 mt-3" />
          </TouchableOpacity>

          {/* Account */}
          <View className="px-4 py-4">
            <Text className="text-gray-400 text-sm mb-2">Account</Text>
            <View className="flex-row flex-wrap space-x-2">
              {accounts.map((acc) => (
                <TouchableOpacity
                  key={acc}
                  className={`py-2 px-4 rounded-lg border mb-2 ${
                    account === acc
                      ? "bg-blue-600 border-blue-500"
                      : "bg-gray-800 border-gray-600"
                  }`}
                  onPress={() => setAccount(acc)}
                >
                  <Text className="text-white">{acc}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View className="h-px bg-gray-700 mt-3" />
          </View>

          {/* Note */}
          <View className="px-4 py-4">
            <Text className="text-gray-400 text-sm mb-2">Note</Text>
            <TextInput
              className="text-green-600 text-lg bg-transparent"
              value={note}
              onChangeText={setNote}
              placeholder="Add note..."
              placeholderTextColor="#9CA3AF"
              multiline
            />
            <View className="h-px bg-gray-700 mt-3" />
          </View>

          {/* Save Button */}
          <View className="p-4 mt-8">
            <TouchableOpacity
              className={`py-4 rounded-lg ${
                transactionType === "income" ? "bg-green-600" : "bg-red-600"
              }`}
              onPress={handleSubmit}
            >
              <Text className="text-white text-center text-lg font-bold">
                {isNew ? "Save" : "Update"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <CategoryModal />
        <AddCategoryModal />
      </View>
    </SafeAreaView>
  );
};

export default TransactionFormScreen;
