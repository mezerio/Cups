import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import Constants from "expo-constants";
// Firebase config
const firebaseConfig = {
  // apiKey: Constants.manifest.extra.apiKey,
  apiKey: "AIzaSyDH-_zBQVqd_xtltCq6bgq97nx6JVNRaWY",
  authDomain: "no-shmanks.firebaseapp.com",
  databaseURL:
    "https://no-shmanks-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "no-shmanks",
  storageBucket: "no-shmanks.appspot.com",
  messagingSenderId: "705679120600",
  appId: "1:705679120600:web:a9db63fc0144acef8f1fad",
  measurementId: "G-5T1WYYLC3N",
};
// initialize firebase
initializeApp(firebaseConfig);
export const auth = getAuth();
export const database = getFirestore();
