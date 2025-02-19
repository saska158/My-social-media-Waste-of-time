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
  startAt 
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
  arrayRemove
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
  startAt,
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
  arrayRemove
}

//BAjUgbwqNYfUpW_4b1dhRjKwbf5TBvn2tndV6iUSOhauHihA9SWNv0ZsadXr-g6_3BmeNDXhG9pkVS2sl684Yvs
/*

// ✅ Function to Save FCM Token in Firestore
export const saveUserToken = async (userUid, token) => {
  if (!userUid || !token) return

  try {
    const userRef = ref(database, `users/${userUid}`)
    
    await update(userRef, { fcmToken: token }) // Store FCM token here
    console.log("FCM token saved in Realtime Database.")
  } catch (error) {
    console.error("Error saving FCM token:", error)
  }
}

// ✅ Function to Request Notification Permission
export const requestNotificationPermission = async (userUid) => {
  try {
    const permission = await Notification.requestPermission()
    if (permission === "granted") {
      console.log("Notification permission granted.")

      // Get FCM Token
      const token = await getToken(messaging, {
        vapidKey: "BAjUgbwqNYfUpW_4b1dhRjKwbf5TBvn2tndV6iUSOhauHihA9SWNv0ZsadXr-g6_3BmeNDXhG9pkVS2sl684Yvs",
      })

      if (token) {
        console.log("FCM Token:", token)
        await saveUserToken(userUid, token) // Save Token in Firestore
      }
    } else {
      console.log("Notification permission denied.")
    }
  } catch (error) {
    console.error("Error getting notification permission:", error)
  }
}

// Listen for foreground messages
export const listenForMessages = () => {
  onMessage(messaging, (payload) => {
    console.log("Message received: ", payload)
    // Handle displaying the notification in the UI if needed
  })
}


// Register the service worker correctly
navigator.serviceWorker
  .register("/firebase-messaging-sw.js")
  .then((registration) => {
    console.log("Service Worker registered:", registration)
  })
  .catch((error) => {
    console.error("Service Worker registration failed:", error)
  })*/