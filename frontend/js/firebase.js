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

let db;

export function initializeFirebase() {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
}

export function getDb() {
  return db;
}

export function getAuthInstance() {
  return auth;
}