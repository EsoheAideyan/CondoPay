// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDpPtHg66gkuom-pTGjbukiSzIh6t2_dOo",
  authDomain: "condopay-63f90.firebaseapp.com",
  projectId: "condopay-63f90",
  storageBucket: "condopay-63f90.firebasestorage.app",
  messagingSenderId: "118739949556",
  appId: "1:118739949556:web:96cf64c4013b65726b4ba1",
  measurementId: "G-5744CK82C4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };