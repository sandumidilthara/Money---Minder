// screens/NotesHomeScreen.tsx
import { deleteNote, getAllNotes, Note } from "@/services/noteService";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
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

const NotesHomeScreen = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load notes from Firestore
  const loadNotes = async () => {
    try {
      setLoading(true);
      const notesData = await getAllNotes();
      setNotes(notesData);
    } catch (error) {
      console.error("Error loading notes:", error);
      Alert.alert("Error", "Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotes();
    setRefreshing(false);
  };

  // Load data on screen focus
  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [])
  );

  // Format date
  const formatDate = (date: Date) => {
    try {
      if (isNaN(date.getTime())) return "Invalid date";

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Date error";
    }
  };

  // Delete note
  const handleDeleteNote = (note: Note) => {
    Alert.alert(
      "Delete Note",
      `Are you sure you want to delete "${note.message}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (note.id) {
                await deleteNote(note.id);
                await loadNotes(); // Refresh list
                Alert.alert("Success", "Note deleted successfully");
              }
            } catch (error) {
              console.error("Error deleting note:", error);
              Alert.alert("Error", "Failed to delete note");
            }
          },
        },
      ]
    );
  };

  // Render each note item
  const renderNoteItem = ({ item }: { item: Note }) => (
    <TouchableOpacity
      className="flex-row justify-between items-center p-4 bg-white border-b border-gray-100"
      onLongPress={() => handleDeleteNote(item)}
      onPress={() => {
        router.push(`/(dashboard)/notes/${item.id}`);
      }}
    >
      <View className="flex-1">
        <View className="flex-row items-center mb-1"></View>
        {item.message && (
          <Text className="text-xs text-gray-600 italic ml-0" numberOfLines={2}>
            {item.message}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#2196F3" />
        <Text className="mt-2.5 text-base text-gray-600">Loading notes...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="p-4 bg-white border-b border-gray-200">
        <Text className="text-lg font-semibold text-gray-800 mb-1">
          My Notes
        </Text>
        <Text className="text-sm text-gray-600">
          {notes.length} notes total
        </Text>
      </View>

      {/* Notes List */}
      <FlatList
        data={notes}
        renderItem={renderNoteItem}
        keyExtractor={(item) => item.id || Math.random().toString()}
        className="flex-1 bg-white"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-12">
            <Text className="text-lg font-semibold text-gray-600 mb-2">
              No notes found
            </Text>
            <Text className="text-sm text-gray-500 text-center">
              Add your first note to get started
            </Text>
          </View>
        }
      />

      {/* Floating Add Button */}
      <View className="absolute bottom-5 right-5 z-40">
        <Pressable
          className="bg-blue-500 rounded-full p-5 shadow-lg"
          onPress={() => {
            router.push("/(dashboard)/notes/new");
          }}
        >
          <MaterialIcons name="add" size={28} color={"#fff"} />
        </Pressable>
      </View>
    </View>
  );
};

export default NotesHomeScreen;
