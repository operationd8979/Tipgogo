import {
    auth,
    firebaseDatabase,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    onAuthStateChanged,
    ref,
    get,
    set,
    orderByChild,
    uploadBytes,
    getDownloadURL,
    storageRef,
    storage,
    app,
    onValue,
    child,
    equalTo,
    query,
    update,
    updatePassword,
    orderByKey,
} from "../../firebase/firebase"
import AsyncStorage from '@react-native-async-storage/async-storage'

const getUserIDByTokken = async () => {
    const accessToken = await AsyncStorage.getItem('token');
    const dbRef = ref(firebaseDatabase, "users");
    const dbQuery = query(dbRef, orderByChild("accessToken"), equalTo(accessToken));
    const data = await get(dbQuery);
    const userID = Object.keys(data.val())[0];
    return userID;
}

const getUserByTokken = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const accessToken = await AsyncStorage.getItem('token');
            const dbRef = ref(firebaseDatabase, "users");
            const dbQuery = query(dbRef, orderByChild("accessToken"), equalTo(accessToken));
            const data = await get(dbQuery);
            const userID = Object.keys(data.val())[0];
            const snapshotObject = data.val();
            const userData = snapshotObject[userID];
            const user = {
                userID: userID,
                email: userData.email,
                name: userData.name,
                photo: userData.photo,
                phone: userData.phone,
                emailVerified: userData.emailVerified,
            }
            console.log("User getting OK!", user);
            resolve(user);
        }
        catch (error) {
            console.error('Error getting user:', error);
            resolve(null);
        }
    });
}

const getUserByUserID = (userID) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (userID) {
                const dbRef = ref(firebaseDatabase, `users/${userID}`);
                const dbQuery = query(dbRef);
                const data = await get(dbQuery);
                const snapshotObject = data.val();
                console.log(userID)
                if (snapshotObject) {
                    console.log("User getting OK!", snapshotObject);
                    resolve(snapshotObject);
                }
                resolve(null);
            }
            else {
                console.log("No driver!");
                resolve(null);
            }
        }
        catch (error) {
            console.error('Error getting user:', error);
            resolve(null);
        }
    });
}




export {
    getUserByTokken,
    getUserIDByTokken,
    getUserByUserID,
}