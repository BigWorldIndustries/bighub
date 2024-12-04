// Import the functions you need from the SDKs you need
import { deleteApp, getApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth, setPersistence, inMemoryPersistence } from "firebase/auth";
import { env } from '$env/dynamic/public';
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: env.PUBLIC_FIREBASE_APIKEY,
  authDomain: env.PUBLIC_FIREBASE_AUTHDOMAIN,
  projectId: env.PUBLIC_FIREBASE_PROJECTID,
  storageBucket: env.PUBLIC_FIREBASE_STORAGEBUCKET,
  messagingSenderId: env.PUBLIC_FIREBASE_MESSAGINGSENDERID,
  appId: env.PUBLIC_FIREBASE_APPID,
  measurementId: env.PUBLIC_FIREBASE_MEASUREMENTID
};

// Initialize Firebase
//const app = initializeApp(firebaseConfig);
let firebaseApp;
if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
}
else {
    firebaseApp = getApp();
    deleteApp(firebaseApp);
    firebaseApp = initializeApp(firebaseConfig);
}
//const analytics = getAnalytics(firebaseApp);

export const auth = getAuth(firebaseApp);
export const storage = getStorage(firebaseApp);