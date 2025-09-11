// screens/NoteFormScreen.tsx
import { useLoader } from "@/context/LoaderContext";
import {
  createNote,
  getNoteById,
  NoteInput,
  updateNote,
} from "@/services/noteService";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const NoteFormScreen = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isNew = !id || id === "new";

  const [message, setMessage] = useState<string>("");

  const router = useRouter();
  const { hideLoader, showLoader } = useLoader();

  // Load existing note data for editing
  useEffect(() => {
    const loadNoteData = async () => {
      if (!isNew && id) {
        try {
          showLoader();
          const note = await getNoteById(id);
          if (note) {
            setMessage(note.message);
          } else {
            Alert.alert("Error", "Note not found");
            router.back();
          }
        } catch (error) {
          console.error("Error loading note:", error);
          Alert.alert("Error", "Failed to load note data");
        } finally {
          hideLoader();
        }
      }
    };

    loadNoteData();
  }, [id, isNew]);

  // Handle form submission
  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert("Validation", "Message is required");
      return;
    }

    try {
      showLoader();
      const noteData: NoteInput = {
        message: message.trim(),
      };

      if (isNew) {
        await createNote(noteData);
      } else {
        await updateNote(id!, noteData);
      }

      router.back();
    } catch (error) {
      console.error("Error saving note:", error);
      Alert.alert("Error", "Failed to save note");
    } finally {
      hideLoader();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center p-4 border-b border-gray-700">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-white text-2xl">←</Text>
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold capitalize">
            {isNew ? "New Note" : "Edit Note"}
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-white text-2xl">×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1">
          {/* Message */}
          <View className="px-4 py-4">
            <Text className="text-gray-400 text-sm mb-2">Message</Text>
            <TextInput
              className="text-white text-lg bg-transparent"
              value={message}
              onChangeText={setMessage}
              placeholder="Write your note here..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <View className="h-px bg-gray-700 mt-3" />
          </View>

          {/* Character Count */}
          <View className="px-4 py-2">
            <Text className="text-gray-500 text-xs">
              Title:0/30 characters | Message: {message.length} characters
            </Text>
          </View>

          {/* Save Button */}
          <View className="p-4 mt-8">
            <TouchableOpacity
              className="bg-blue-600 py-4 rounded-lg"
              onPress={handleSubmit}
            >
              <Text className="text-white text-center text-lg font-bold">
                {isNew ? "Save" : "Update"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default NoteFormScreen;

// // screens/NoteFormScreen.tsx
// import React, { useEffect, useState } from "react";
// import {
//   Alert,
//   SafeAreaView,
//   ScrollView,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import { useLoader } from "@/context/LoaderContext";
// import {
//   createNote,
//   updateNote,
//   getNoteById,
//   Note
// } from "@/services/noteService";

// const NoteFormScreen = () => {
//   const { id } = useLocalSearchParams<{ id?: string }>();
//   const isNew = !id || id === "new";

//   const [message, setMessage] = useState<string>("");

//   const router = useRouter();
//   const { hideLoader, showLoader } = useLoader();

//   // Load existing note data for editing
//   useEffect(() => {
//     const loadNoteData = async () => {
//       if (!isNew && id) {
//         try {
//           showLoader();
//           const note = await getNoteById(id);
//           if (note) {
//             setMessage(note.message);
//           } else {
//             Alert.alert("Error", "Note not found");
//             router.back();
//           }
//         } catch (error) {
//           console.error("Error loading note:", error);
//           Alert.alert("Error", "Failed to load note data");
//         } finally {
//           hideLoader();
//         }
//       }
//     };

//     loadNoteData();
//   }, [id, isNew]);

//   // Handle form submission
//   const handleSubmit = async () => {
//     if (!message.trim()) {
//       Alert.alert("Validation", "Message is required");
//       return;
//     }

//     try {
//       showLoader();
//       const noteData = {
//         message: message.trim(),
//       };

//       if (isNew) {
//         await createNote(noteData);
//       } else {
//         await updateNote(id!, noteData);
//       }

//       router.back();
//     } catch (error) {
//       console.error("Error saving note:", error);
//       Alert.alert("Error", "Failed to save note");
//     } finally {
//       hideLoader();
//     }
//   };

//   return (
//     <SafeAreaView className="flex-1 bg-gray-900">
//       <View className="flex-1">
//         {/* Header */}
//         <View className="flex-row justify-between items-center p-4 border-b border-gray-700">
//           <TouchableOpacity onPress={() => router.back()}>
//             <Text className="text-white text-2xl">←</Text>
//           </TouchableOpacity>
//           <Text className="text-white text-xl font-bold capitalize">
//             {isNew ? "New Note" : "Edit Note"}
//           </Text>
//           <TouchableOpacity onPress={() => router.back()}>
//             <Text className="text-white text-2xl">×</Text>
//           </TouchableOpacity>
//         </View>

//         <ScrollView className="flex-1">
//           {/* Message */}
//           <View className="px-4 py-4">
//             <Text className="text-gray-400 text-sm mb-2">Message</Text>
//             <TextInput
//               className="text-white text-lg bg-transparent"
//               value={message}
//               onChangeText={setMessage}
//               placeholder="Write your note here..."
//               placeholderTextColor="#9CA3AF"
//               multiline
//               numberOfLines={15}
//               textAlignVertical="top"
//             />
//             <View className="h-px bg-gray-700 mt-3" />
//           </View>

//           {/* Character Count */}
//           <View className="px-4 py-2">
//             <Text className="text-gray-500 text-xs">
//               Message: {message.length} characters
//             </Text>
//           </View>

//           {/* Save Button */}
//           <View className="p-4 mt-8">
//             <TouchableOpacity
//               className="bg-blue-600 py-4 rounded-lg"
//               onPress={handleSubmit}
//             >
//               <Text className="text-white text-center text-lg font-bold">
//                 {isNew ? "Save" : "Update"}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </ScrollView>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default NoteFormScreen;
