// firebaseConfig.ts
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDzZ4KQ-4yulLiuzV7jGPRJQ8_lYQQiA3o",
    authDomain: "norastudio-80ccd.firebaseapp.com",
    projectId: "norastudio-80ccd",
    storageBucket: "norastudio-80ccd.firebasestorage.app",
    messagingSenderId: "155668929432",
    appId: "1:155668929432:web:888c81d0b93ab79c7a29ed",
    measurementId: "G-RYYN6WXCM4",
    // kalau nanti pakai Realtime Database, tambahin ini:
    // databaseURL: "https://norastudio-80ccd.firebaseio.com",
};

// biar nggak re-init kalau hot reload
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
