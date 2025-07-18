import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
// You also need these if you are going to get them from 'app' later in script.js
// If you are directly exporting them here, you should import getAuth and getFirestore here as well.
// For consistency with script.js, let's just export 'app'.

// Your web app's Firebase configuration
// Replace these with your actual Firebase project configuration (which you already did)
const firebaseConfig = {
  apiKey: "AIzaSyAh_s-jxOaEhJKSB73Sp7oAUzNQnIAssYY",
  authDomain: "invest-bridge.firebaseapp.com",
  projectId: "invest-bridge",
  storageBucket: "invest-bridge.appspot.com",
  messagingSenderId: "1089146712781",
  appId: "1:1089146712781:web:de9f518d0a7109cb2daf84"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the initialized Firebase app instance
// This allows other modules (like script.js) to import and use it
export { app }; // <--- ADD THIS LINE (if not present)
// REMOVE the direct 'export const auth' and 'export const db' if they are there,
// as script.js will get them from the 'app' instance itself.    