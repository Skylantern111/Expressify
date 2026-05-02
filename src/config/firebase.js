import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAaLesQbGWpZXAiQp8F8kcRrWptnO8wWoM",
    authDomain: "expressify-db.firebaseapp.com",
    projectId: "expressify-db",
    storageBucket: "expressify-db.firebasestorage.app",
    messagingSenderId: "389987278105",
    appId: "1:389987278105:web:eb7d0d4d6a87ceb68a3988",
    measurementId: "G-TQR5GBGT9F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export the database so App.jsx can use it!
export const db = getFirestore(app);