import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAhvjDRln4X6jwSu25YNP8fdOoztnMZwb4",
  authDomain: "coop-tracker.firebaseapp.com",
  projectId: "coop-tracker",
  storageBucket: "coop-tracker.firebasestorage.app",
  messagingSenderId: "273429620116",
  appId: "1:273429620116:web:6b52a190fb42ac89531b81",
  measurementId: "G-8RLKW4C7XC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export default app; 