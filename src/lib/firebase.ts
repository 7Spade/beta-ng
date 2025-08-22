// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "ngbeta-learn",
  "appId": "1:240796632166:web:893dda9b3a1341becd59a7",
  "storageBucket": "ngbeta-learn.firebasestorage.app",
  "apiKey": "AIzaSyC-itgeQQShEcRda3Gj2ZC5ZUXtM6OUBV8",
  "authDomain": "ngbeta-learn.firebaseapp.com",
  "measurementId": "G-B5TBVN0H3L",
  "messagingSenderId": "240796632166"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize App Check on the client only
if (typeof window !== "undefined") {
  // Use dynamic import to avoid SSR bundling issues
  import("firebase/app-check")
    .then(({ initializeAppCheck, ReCaptchaV3Provider }) => {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(
          "6LfoH6ErAAAAAO9PNTdxPVgt4nAF6XKGgo99Ogcg"
        ),
        isTokenAutoRefreshEnabled: true,
      });
    })
    .catch((err) => {
      console.error("Failed to initialize Firebase App Check", err);
    });
}

export { app, db };
