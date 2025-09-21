// import { db } from "@/firebase";
// import {
//   addDoc,
//   collection,
//   deleteDoc,
//   doc,
//   getDoc,
//   getDocs,
//   orderBy,
//   query,
//   Timestamp,
//   updateDoc,
//   where,
// } from "firebase/firestore";

// export interface Note {
//   id?: string;
//   message: string;
//   createdAt: Date | Timestamp | string;
//   updatedAt: Date | Timestamp | string;
// }

// export interface NoteInput {
//   message: string;
// }

// // Create a new note
// export const createNote = async (noteData: NoteInput): Promise<string> => {
//   try {
//     const now = new Date();
//     const docRef = await addDoc(collection(db, "notes"), {
//       ...noteData,
//       createdAt: now,
//       updatedAt: now,
//     });
//     return docRef.id;
//   } catch (error) {
//     console.error("Error creating note:", error);
//     throw error;
//   }
// };

// // Get all notes
// export const getAllNotes = async (): Promise<Note[]> => {
//   try {
//     const q = query(collection(db, "notes"), orderBy("updatedAt", "desc"));
//     const querySnapshot = await getDocs(q);

//     return querySnapshot.docs.map((doc) => {
//       const data = doc.data();
//       return {
//         id: doc.id,
//         message: data.message,
//         createdAt:
//           data.createdAt instanceof Timestamp
//             ? data.createdAt.toDate()
//             : new Date(data.createdAt),
//         updatedAt:
//           data.updatedAt instanceof Timestamp
//             ? data.updatedAt.toDate()
//             : new Date(data.updatedAt),
//       } as Note;
//     });
//   } catch (error) {
//     console.error("Error getting notes:", error);
//     throw error;
//   }
// };

// // Get notes filtered by month and year
// export const getNotesByMonth = async (
//   year: number,
//   month: number
// ): Promise<Note[]> => {
//   try {
//     // Create start and end dates for the month (month is 0-indexed)
//     const startOfMonth = new Date(year, month, 1);
//     const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

//     console.log("Filtering notes for:", {
//       year,
//       month: month + 1, // Display month (1-indexed)
//       startOfMonth: startOfMonth.toISOString(),
//       endOfMonth: endOfMonth.toISOString(),
//     });

//     const q = query(
//       collection(db, "notes"),
//       where("createdAt", ">=", startOfMonth),
//       where("createdAt", "<=", endOfMonth),
//       orderBy("createdAt", "desc")
//     );

//     const querySnapshot = await getDocs(q);

//     const notes = querySnapshot.docs.map((doc) => {
//       const data = doc.data();
//       return {
//         id: doc.id,
//         message: data.message,
//         createdAt:
//           data.createdAt instanceof Timestamp
//             ? data.createdAt.toDate()
//             : new Date(data.createdAt),
//         updatedAt:
//           data.updatedAt instanceof Timestamp
//             ? data.updatedAt.toDate()
//             : new Date(data.updatedAt),
//       } as Note;
//     });

//     console.log(`Found ${notes.length} notes for ${year}-${month + 1}`);
//     return notes;
//   } catch (error) {
//     console.error("Error getting notes by month:", error);
//     throw error;
//   }
// };

// // Get a single note by ID
// export const getNoteById = async (id: string): Promise<Note | null> => {
//   try {
//     const docRef = doc(db, "notes", id);
//     const docSnap = await getDoc(docRef);

//     if (docSnap.exists()) {
//       const data = docSnap.data();
//       return {
//         id: docSnap.id,
//         message: data.message,
//         createdAt:
//           data.createdAt instanceof Timestamp
//             ? data.createdAt.toDate()
//             : new Date(data.createdAt),
//         updatedAt:
//           data.updatedAt instanceof Timestamp
//             ? data.updatedAt.toDate()
//             : new Date(data.updatedAt),
//       } as Note;
//     }
//     return null;
//   } catch (error) {
//     console.error("Error getting note:", error);
//     throw error;
//   }
// };

// // Update a note
// export const updateNote = async (
//   id: string,
//   noteData: NoteInput
// ): Promise<void> => {
//   try {
//     const docRef = doc(db, "notes", id);
//     await updateDoc(docRef, {
//       ...noteData,
//       updatedAt: new Date(),
//     });
//   } catch (error) {
//     console.error("Error updating note:", error);
//     throw error;
//   }
// };

// // Delete a note
// export const deleteNote = async (id: string): Promise<void> => {
//   try {
//     const docRef = doc(db, "notes", id);
//     await deleteDoc(docRef);
//   } catch (error) {
//     console.error("Error deleting note:", error);
//     throw error;
//   }
// };

import { auth, db } from "@/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";

export interface Note {
  id?: string;
  message: string;
  email: string; // Added email field
  createdAt: Date | Timestamp | string;
  updatedAt: Date | Timestamp | string;
}

export interface NoteInput {
  message: string;
  // Email will be automatically added from auth, so not required in input
}

// Create a new note
export const createNote = async (noteData: NoteInput): Promise<string> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const now = new Date();
    const docRef = await addDoc(collection(db, "notes"), {
      ...noteData,
      email: currentUser.email, // Automatically add user's email
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating note:", error);
    throw error;
  }
};

// Get all notes for current user
export const getAllNotes = async (): Promise<Note[]> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    // Simple query without orderBy to avoid index requirement
    const q = query(
      collection(db, "notes"),
      where("email", "==", currentUser.email)
    );
    const querySnapshot = await getDocs(q);

    // Sort in JavaScript instead of Firestore
    const notes = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        message: data.message,
        email: data.email,
        createdAt:
          data.createdAt instanceof Timestamp
            ? data.createdAt.toDate()
            : new Date(data.createdAt),
        updatedAt:
          data.updatedAt instanceof Timestamp
            ? data.updatedAt.toDate()
            : new Date(data.updatedAt),
      } as Note;
    });

    // Sort by updatedAt descending
    return notes.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch (error) {
    console.error("Error getting notes:", error);
    throw error;
  }
};

// Get notes filtered by month and year for current user
export const getNotesByMonth = async (
  year: number,
  month: number
): Promise<Note[]> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    console.log("Filtering notes for:", {
      email: currentUser.email,
      year,
      month: month + 1, // Display month (1-indexed)
    });

    // Get all user notes and filter in JavaScript
    const q = query(
      collection(db, "notes"),
      where("email", "==", currentUser.email)
    );

    const querySnapshot = await getDocs(q);

    const allNotes = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        message: data.message,
        email: data.email,
        createdAt:
          data.createdAt instanceof Timestamp
            ? data.createdAt.toDate()
            : new Date(data.createdAt),
        updatedAt:
          data.updatedAt instanceof Timestamp
            ? data.updatedAt.toDate()
            : new Date(data.updatedAt),
      } as Note;
    });

    // Filter by month and year in JavaScript
    const filteredNotes = allNotes.filter((note) => {
      const noteDate = new Date(note.createdAt);
      return noteDate.getFullYear() === year && noteDate.getMonth() === month;
    });

    // Sort by createdAt descending
    const sortedNotes = filteredNotes.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    console.log(
      `Found ${sortedNotes.length} notes for ${currentUser.email} in ${year}-${month + 1}`
    );
    return sortedNotes;
  } catch (error) {
    console.error("Error getting notes by month:", error);
    throw error;
  }
};

// Get a single note by ID (only if it belongs to current user)
export const getNoteById = async (id: string): Promise<Note | null> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const docRef = doc(db, "notes", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      // Check if the note belongs to the current user
      if (data.email !== currentUser.email) {
        throw new Error("Unauthorized access to note");
      }

      return {
        id: docSnap.id,
        message: data.message,
        email: data.email,
        createdAt:
          data.createdAt instanceof Timestamp
            ? data.createdAt.toDate()
            : new Date(data.createdAt),
        updatedAt:
          data.updatedAt instanceof Timestamp
            ? data.updatedAt.toDate()
            : new Date(data.updatedAt),
      } as Note;
    }
    return null;
  } catch (error) {
    console.error("Error getting note:", error);
    throw error;
  }
};

// Update a note (only if it belongs to current user)
export const updateNote = async (
  id: string,
  noteData: NoteInput
): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    // First check if the note belongs to the current user
    const existingNote = await getNoteById(id);
    if (!existingNote) {
      throw new Error("Note not found");
    }

    const docRef = doc(db, "notes", id);
    await updateDoc(docRef, {
      ...noteData,
      updatedAt: new Date(),
      // Don't update email - it should remain the same
    });
  } catch (error) {
    console.error("Error updating note:", error);
    throw error;
  }
};

// Delete a note (only if it belongs to current user)
export const deleteNote = async (id: string): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    // First check if the note belongs to the current user
    const existingNote = await getNoteById(id);
    if (!existingNote) {
      throw new Error("Note not found");
    }

    const docRef = doc(db, "notes", id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting note:", error);
    throw error;
  }
};
