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

export const incomeCategoryColRef = collection(db, "incomeCategory");

export const createIncomeCategory = async (category: { name: string }) => {
  const docRef = await addDoc(incomeCategoryColRef, category);
  return docRef.id;
};

export const updateIncomeCategory = async (
  id: string,
  category: { name: string }
) => {
  const docRef = doc(db, "incomeCategory", id);
  return await updateDoc(docRef, category);
};

export const deleteIncomeCategory = async (id: string) => {
  const docRef = doc(db, "incomeCategory", id);
  return await deleteDoc(docRef);
};

export const getAllIncomeCategories = async () => {
  const snapshot = await getDocs(incomeCategoryColRef);
  const categoryList = snapshot.docs.map((categoryRef) => ({
    id: categoryRef.id,
    ...categoryRef.data(),
  })) as Array<{ id: string; name: string }>;
  return categoryList;
};

export const getIncomeCategoryById = async (id: string) => {
  const categoryDocRef = doc(db, "incomeCategory", id);
  const snapshot = await getDoc(categoryDocRef);
  const category = snapshot.exists()
    ? ({ id: snapshot.id, ...snapshot.data() } as { id: string; name: string })
    : null;
  return category;
};
