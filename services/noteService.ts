// services/noteService.ts
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
} from "firebase/firestore";

export interface Note {
  id?: string;

  message: string;
  createdAt: Date;
  updatedAt: Date;
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
