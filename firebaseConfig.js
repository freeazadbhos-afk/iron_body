import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// REPLACE THIS with your actual keys from your web project
const firebaseConfig = {
  apiKey: "AIzaSyAYl7kGDqnHVdDU0bxtaFdqto_7KdeN_SE",
  authDomain: "iron-body-b1e75.firebaseapp.com",
  projectId: "iron-body-b1e75",
  storageBucket: "iron-body-b1e75.firebasestorage.app",
  messagingSenderId: "370346548163",
  appId: "1:370346548163:web:c1243987e21dca182fbb76"
  measurementId: "G-4519ELG9ZB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with React Native persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

// Export them so you can use them in other files
export { auth, db };
