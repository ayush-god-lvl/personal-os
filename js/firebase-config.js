/* ============================================
   PERSONAL OS — Firebase Configuration
   ============================================ */

const firebaseConfig = {
    apiKey: "AIzaSyCpumyqtd1LhLolxW0saJNIZA2MN6MaCRk",
    authDomain: "personal-os-6f3a8.firebaseapp.com",
    projectId: "personal-os-6f3a8",
    storageBucket: "personal-os-6f3a8.firebasestorage.app",
    messagingSenderId: "714414102403",
    appId: "1:714414102403:web:8fba0c8315586756d248b6",
    measurementId: "G-8GE8PEYEQB"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Global references
const FirebaseAuth = firebase.auth();
const FirebaseDB = firebase.firestore();
