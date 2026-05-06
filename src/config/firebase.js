import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyASYrnYrzQY-8k91q8bPsbjlkOSieZNFOs",
  authDomain: "futhub-734e0.firebaseapp.com",
  projectId: "futhub-734e0",
  storageBucket: "futhub-734e0.firebasestorage.app",
  messagingSenderId: "161638744581",
  appId: "1:161638744581:ios:c9e25bfd61333fa197526c",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
