import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA7bxsH04l6BRhSOr7zlbn9fuL-EJdFOZk",
  authDomain: "traquenard-5ce2f.firebaseapp.com",
  projectId: "traquenard-5ce2f",
  storageBucket: "traquenard-5ce2f.firebasestorage.app",
  messagingSenderId: "634968194263",
  appId: "1:634968194263:web:9512fabc334485c58a8492"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Cloudinary config
export const CLOUDINARY_CLOUD_NAME = 'dp64sdpit';
export const CLOUDINARY_UPLOAD_PRESET = 'traquenard';