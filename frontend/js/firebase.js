import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBnjBn6sTwnqDjrMXdgmFZ2dugrL5OVLTI",
  authDomain: "news-bias-analyzer.firebaseapp.com",
  projectId: "news-bias-analyzer",
  storageBucket: "news-bias-analyzer.appspot.com",
  messagingSenderId: "661563307465",
  appId: "1:661563307465:web:648bdabecbcf57b0d96418",
};

// Initialize Firebase and Firestore
let app;
let db;

export function initializeFirebase() {
  if (!app) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("Firebase and Firestore initialized.");
  } else {
    console.log("Firebase already initialized.");
  }
}

export function getDb() {
  if (!db) {
    console.error("Firestore instance not found. Initializing Firestore...");
    initializeFirebase();
  }
  return db;
}