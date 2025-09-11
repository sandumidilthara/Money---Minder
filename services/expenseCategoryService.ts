import { db } from "@/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

export const expenseCategoryColRef = collection(db, "expensesCategory");

export const createExpenseCategory = async (category: { name: string }) => {
  const docRef = await addDoc(expenseCategoryColRef, category);
  return docRef.id;
};

export const updateExpenseCategory = async (
  id: string,
  category: { name: string }
) => {
  const docRef = doc(db, "expensesCategory", id);
  return await updateDoc(docRef, category);
};

export const deleteExpenseCategory = async (id: string) => {
  const docRef = doc(db, "expensesCategory", id);
  return await deleteDoc(docRef);
};

export const getAllExpenseCategories = async () => {
  const snapshot = await getDocs(expenseCategoryColRef);
  const categoryList = snapshot.docs.map((categoryRef) => ({
    id: categoryRef.id,
    ...categoryRef.data(),
  })) as Array<{ id: string; name: string }>;
  return categoryList;
};

export const getExpenseCategoryById = async (id: string) => {
  const categoryDocRef = doc(db, "expensesCategory", id);
  const snapshot = await getDoc(categoryDocRef);
  const category = snapshot.exists()
    ? ({ id: snapshot.id, ...snapshot.data() } as { id: string; name: string })
    : null;
  return category;
};
