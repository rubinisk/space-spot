// ==============================================================================
// SpaceSpot – Firebase Configuration & SDK Initialization
// ==============================================================================
// INSTRUCTIONS FOR SETUP:
// 1. Go to Firebase Console (https://console.firebase.google.com/)
// 2. Select or create your Firebase project (e.g., "spacespot-project")
// 3. Go to Project Settings -> General -> Your apps -> Web app (</>)
// 4. Register app and copy the "firebaseConfig" object values
// 5. Replace the placeholder values below with your real project credentials
// ==============================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  initializeFirestore, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { 
  getAuth, 
  GoogleAuthProvider 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Real Firebase project configuration
export const firebaseConfig = {
  apiKey: "AIzaSyDcyDAizOd5uoEE6FZ8j0tiw49elaMiD4s",
  authDomain: "spacespot-137e6.firebaseapp.com",
  projectId: "spacespot-137e6",
  storageBucket: "spacespot-137e6.firebasestorage.app",
  messagingSenderId: "983436618123",
  appId: "1:983436618123:web:0b54ac943e8e39b77aa78e",
  measurementId: "G-KMYFGK7M4K"
};

// Check if credentials have been replaced
export const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey && firebaseConfig.apiKey !== "PASTE_HERE";
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore database with optimized connection settings
// experimentalForceLongPolling connects immediately via HTTP without waiting 30s for streaming timeouts
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
});

// Initialize Firebase Authentication & Google Auth Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Re-export serverTimestamp for consistent timestamp handling
export { serverTimestamp };
