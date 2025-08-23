import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyCpO5lkD1noS2InjbqtaROPFv-qc640-Jo",
  authDomain: "med-prep-auth.firebaseapp.com",
  projectId: "med-prep-auth",
  storageBucket: "med-prep-auth.appspot.com", 
  messagingSenderId: "372070626620",
  appId: "1:372070626620:web:1dfe7fc6bc1ef1fda41a39",
  measurementId: "G-M7BQWSM53K",
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
