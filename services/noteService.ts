import { db } from "@/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";

export interface Note {
  id?: string;
  message: string;
  createdAt: Date | Timestamp | string;
  updatedAt: Date | Timestamp | string;
}

export interface NoteInput {
  message: string;
}

// Create a new note
export const createNote = async (noteData: NoteInput): Promise<string> => {
  try {
    const now = new Date();
    const docRef = await addDoc(collection(db, "notes"), {
      ...noteData,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating note:", error);
    throw error;
  }
};

// Get all notes
export const getAllNotes = async (): Promise<Note[]> => {
  try {
    const q = query(collection(db, "notes"), orderBy("updatedAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        message: data.message,
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
  } catch (error) {
    console.error("Error getting notes:", error);
    throw error;
  }
};

// Get notes filtered by month and year
export const getNotesByMonth = async (
  year: number,
  month: number
): Promise<Note[]> => {
  try {
    // Create start and end dates for the month (month is 0-indexed)
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

    console.log("Filtering notes for:", {
      year,
      month: month + 1, // Display month (1-indexed)
      startOfMonth: startOfMonth.toISOString(),
      endOfMonth: endOfMonth.toISOString(),
    });

    const q = query(
      collection(db, "notes"),
      where("createdAt", ">=", startOfMonth),
      where("createdAt", "<=", endOfMonth),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);

    const notes = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        message: data.message,
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

    console.log(`Found ${notes.length} notes for ${year}-${month + 1}`);
    return notes;
  } catch (error) {
    console.error("Error getting notes by month:", error);
    throw error;
  }
};

// Get a single note by ID
export const getNoteById = async (id: string): Promise<Note | null> => {
  try {
    const docRef = doc(db, "notes", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        message: data.message,
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

// Update a note
export const updateNote = async (
  id: string,
  noteData: NoteInput
): Promise<void> => {
  try {
    const docRef = doc(db, "notes", id);
    await updateDoc(docRef, {
      ...noteData,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error updating note:", error);
    throw error;
  }
};

// Delete a note
export const deleteNote = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, "notes", id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting note:", error);
    throw error;
  }
};
