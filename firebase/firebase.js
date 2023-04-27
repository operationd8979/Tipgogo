import {initializeApp} from 'firebase/app'
import {
    getAuth,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signInWithEmailAndPassword,
} from "firebase/auth"
import {
    getDatabase,
    ref,
    set,
} from "firebase/database"


const firebaseConfig = {
    apiKey: "AIzaSyAjeBTt4AwQhHXaXqKQG6NoZwogPGVY1iU",
    authDomain: "tipgogo-3a1a9.firebaseapp.com",
    databaseURL: "https://tipgogo-3a1a9-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "tipgogo-3a1a9",
    storageBucket: "tipgogo-3a1a9.appspot.com",
    messagingSenderId: "20407314904",
    appId: "1:20407314904:android:72454c12ac3279b7d1eaad",
    measurementId: "G-MEASUREMENT_ID",
}

const app = initializeApp(firebaseConfig)
const auth = getAuth()
const firebaseDatabase = getDatabase()

export {
    auth,
    firebaseDatabase,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    onAuthStateChanged,
    ref,
    set,
}