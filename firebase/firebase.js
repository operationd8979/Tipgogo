import {initializeApp}  from 'firebase/app'
import {
    getAuth,
    onAuthStateChanged,
    onIdTokenChanged,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signInWithEmailAndPassword,
    updatePassword,
} from "firebase/auth"
import {
    getDatabase,
    ref,
    set,
    child,
    get,
    onValue,
    orderByChild,
    equalTo,
    query,
    update,
} from "firebase/database"
import {
    getStorage, 
    ref as storageRef, 
    uploadBytes, 
    getDownloadURL
} from "firebase/storage"


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

const firebaseDatabase = getDatabase(app)

const storage = getStorage(app);


export {
    auth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    onAuthStateChanged,
    onIdTokenChanged,
    firebaseDatabase,
    ref,
    set,
    child,
    get,
    onValue,
    orderByChild,
    storage,
    storageRef,
    uploadBytes,
    getDownloadURL,
    app,
    equalTo,
    query,
    update,
    updatePassword,
}