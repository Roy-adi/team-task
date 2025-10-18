// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCAFjWt3jxhOSHgOyYPExmwaLygItNnLJ4",
  authDomain: "auth-acad8.firebaseapp.com",
  projectId: "auth-acad8",
  storageBucket: "auth-acad8.firebasestorage.app",
  messagingSenderId: "607295711385",
  appId: "1:607295711385:web:f62725c298a06ad4067008",
  measurementId: "G-0PT8SR2EL7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Initialize Firebase Analytics
const analytics = getAnalytics(app);

export { auth , provider}