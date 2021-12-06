import firebase from "firebase/app";
import "firebase/messaging";

const initializedFirebaseApp = firebase.initializeApp({
  apiKey: "AIzaSyACTFNoZYQYj8VedJVioBvt33UN2VKRndk",
  authDomain: "fsm79-1f2b0.firebaseapp.com",
  databaseURL: "https://fsm79-1f2b0.firebaseio.com",
  projectId: "fsm79-1f2b0",
  storageBucket: "fsm79-1f2b0.appspot.com",
  messagingSenderId: "555364408004",
  appId: "1:555364408004:web:6d1aa94e339ac4f456c791",
  measurementId: "G-YCK29MXYXF"
})

const messaging = initializedFirebaseApp.messaging();

messaging.usePublicVapidKey(
  "BGBOCWXTfY8B2WhoWVUuNhnZmDr0JLKunlxsat9sPLCVpEimY9JIVbThZL6fCnO6E7Bi_ZTrYVTWQr1vjpfAYD0"
);

export { messaging };
