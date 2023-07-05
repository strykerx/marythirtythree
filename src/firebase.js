import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBkkB4OSXzgG5z4ANYXYJMLliSPn_BaeqQ",
    authDomain: "marythirtythree-d4f57.firebaseapp.com",
    projectId: "marythirtythree-d4f57",
    storageBucket: "marythirtythree-d4f57.appspot.com",
    messagingSenderId: "690465052944",
    appId: "1:690465052944:web:1e731db780fc2b68b0ed95"    // your firebase configuration
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

export { db, storage };