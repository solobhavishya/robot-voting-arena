import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBtTB5VVIRC74zQR2ovU12rAhM1hhPjPNA",
  authDomain: "robot-voting-4161c.firebaseapp.com",
  databaseURL: "https://robot-voting-4161c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "robot-voting-4161c",
  storageBucket: "robot-voting-4161c.firebasestorage.app",
  messagingSenderId: "493135633593",
  appId: "1:493135633593:web:4334325723567bf3108f68"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); 