import React, { useEffect, useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { colors, fontSizes, normalize, split } from './src/constants'
import { CLButton, QuickView } from './src/components'
import Icon from 'react-native-vector-icons/FontAwesome5'
import useMap from './src/screens/FullMap/FullMap'
import {
  firebaseDatabase,
  ref,
  set,
  onValue,
  update,
  query,
  get,
  orderByKey,
  equalTo,
  auth,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "./firebase/firebase"
import { sendNotification } from "./firebase/notification"
// import {getUserByUserID} from "./src/service/UserService"
const Test = () => {

  // const requestID = "T5f3qz2FchSkXKd5KXs50egOYeX2-1686656570442";
  // const newID = "SfKYs9SDvhQv5jPGEWavTmfttiM2-1686656570442";
  const requestID = "T5f3qz2FchSkXKd5KXs50egOYeX2-1687549823993";

  const getUserByUserID = (userID) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (userID) {
          const dbRef = ref(firebaseDatabase, `users/${userID}`);
          // const dbQuery = query(dbRef, orderByKey(), equalTo(userID));
          const dbQuery = query(dbRef);
          const data = await get(dbQuery);
          const snapshotObject = data.val();
          if (snapshotObject) {
            const data = snapshotObject;
            const user = {
              userID: userID,
              email: data.email,
              name: data.name,
              photo: data.photo,
              phone: data.phone,
              fcmToken: data.fcmToken,
            }
            resolve(user);
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

  useEffect(() => {
    testNotication();
  }, [])


  const testNotication = async () => {
    const senderID = requestID.split('-')[0];
    const sender = await getUserByUserID(senderID);
    const token = sender.fcmToken;
    const title = "tipgogo";
    const body = "Yêu cầu của bạn đã được nhận";
    console.log(token)
    sendNotification(token, title, body);
  }

  const getRequest = (requestId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const dbRef = ref(firebaseDatabase, `request/${requestId}`)
        //const dbQuery = query(dbRef, orderByKey(), equalTo(requestId));
        const dbQuery = query(dbRef);
        const data = await get(dbQuery);
        const snapshotObject = data.val();
        resolve(snapshotObject);
      }
      catch (error) {
        console.error('Error getting direction:', error);
        resolve(null);
      }
    });
  }

  const handlePostRequest = async (request) => {
    const timestamp = requestID.split('-')[1];
    set(ref(firebaseDatabase, `request/${newID}`), request)
      .then(() => {
        console.log("Data written to Firebase Realtime Database.");
      })
      .catch((error) => {
        console.log("Error writing data to Firebase Realtime Database: ", error);
      });
  }

  return (
    <View></View>
  );
};


export default Test;