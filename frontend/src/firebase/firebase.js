import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';



const firebaseConfig = {
  apiKey: "AIzaSyAWI9baGVj3-coKZ67UjOMoUGIYP_Nmi6k",
  authDomain: "urbancove-d39cb.firebaseapp.com",
  projectId: "urbancove-d39cb",
  storageBucket: "urbancove-d39cb.firebasestorage.app",
  messagingSenderId: "951211049648",
  appId: "1:951211049648:web:8f75ff2c4235f48e80b175",
  measurementId: "G-1VV1HWNM3B"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();