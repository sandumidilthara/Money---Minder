import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAa3wCLfLKMjZL2ND7FW_NDQ2MHGcOVxQA",
  authDomain: "money-manager-d874a.firebaseapp.com",
  projectId: "money-manager-d874a",
  storageBucket: "money-manager-d874a.firebasestorage.app",
  messagingSenderId: "99505730846",
  appId: "1:99505730846:web:28284d4e442798ad6bc50f",
  measurementId: "G-05KHKL3003",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
