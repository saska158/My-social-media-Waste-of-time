import { initializeApp } from "firebase/app"

import { 
  getDatabase, 
  ref, 
  push, 
  set, 
  get,
  remove, 
  onValue, 
  update, 
  onDisconnect,
  orderByChild,
  orderByKey,
  startAt,
  endAt,
  limitToFirst,
  limitToLast
} from "firebase/database"

import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword, 
  updateProfile, 
  sendEmailVerification, 
  onAuthStateChanged, 
  signOut, 
  reload 
} from "firebase/auth"

import { 
  getFirestore, 
  collection, 
  doc,
  addDoc, 
  getDoc,
  getDocs, 
  setDoc,
  updateDoc,
  query, 
  where, 
  orderBy,
  onSnapshot,
  serverTimestamp,
  limit,
  startAfter,
  arrayUnion,
  arrayRemove,
  deleteField
} from "firebase/firestore"

import { getMessaging, getToken, onMessage } from "firebase/messaging"

const firebaseConfig = {
  apiKey: "AIzaSyC0t2HSwwWi7Ok2AzIqWdfRd35cCF7ocLU",
  authDomain: "razgovori-270c3.firebaseapp.com",
  databaseURL: "https://razgovori-270c3-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "razgovori-270c3",
  storageBucket: "razgovori-270c3.firebasestorage.app",
  messagingSenderId: "17666331557",
  appId: "1:17666331557:web:5b365bbde048e27d604e4c"
}

const app = initializeApp(firebaseConfig)

const database = getDatabase(app)
const auth = getAuth(app) //proveri
const firestore = getFirestore(app)
const messaging = getMessaging(app)

export { 
  app, 
  database, 
  firestore,
  auth,
  messaging,
  ref,
  push,
  set,
  get,
  remove,
  onValue,
  orderByChild,
  orderByKey,
  startAt,
  endAt,
  limitToFirst,
  limitToLast,
  update,
  onDisconnect,
  onAuthStateChanged, 
  signOut, 
  reload,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword, 
  updateProfile, 
  sendEmailVerification,  
  getFirestore, 
  collection, 
  doc,
  addDoc, 
  getDoc,
  getDocs, 
  setDoc,
  updateDoc,
  query, 
  where, 
  orderBy,
  onSnapshot,
  serverTimestamp,
  getMessaging,
  getToken,
  onMessage,
  limit,
  startAfter,
  arrayUnion,
  arrayRemove,
  deleteField
}

