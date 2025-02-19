// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: "mern-estate-fa280.firebaseapp.com",
    projectId: "mern-estate-fa280",
    storageBucket: "mern-estate-fa280.firebasestorage.app",
    messagingSenderId: "565408455194",
    appId: "1:565408455194:web:6ef06cdf2682863f73cfa3",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
