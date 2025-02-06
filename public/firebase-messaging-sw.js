importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js")


firebase.initializeApp({
    apiKey: "AIzaSyC0t2HSwwWi7Ok2AzIqWdfRd35cCF7ocLU",
    authDomain: "razgovori-270c3.firebaseapp.com",
    databaseURL: "https://razgovori-270c3-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "razgovori-270c3",
    storageBucket: "razgovori-270c3.firebasestorage.app",
    messagingSenderId: "17666331557",
    appId: "1:17666331557:web:5b365bbde048e27d604e4c"
})

const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("Received background message: ", payload)
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: payload.notification.icon,
  })
})
