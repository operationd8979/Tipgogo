import React, { useEffect, useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native'
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
} from "./firebase/firebase"

const Test = () => {

  const requestID = "T5f3qz2FchSkXKd5KXs50egOYeX2-1686656570442";
  const newID = "SfKYs9SDvhQv5jPGEWavTmfttiM2-1686656570442";

  useEffect(()=>{
    // getRequest(requestID)
    //   .then((request)=>{
    //     console.log(request);
    //     handlePostRequest(request);
    //   })
    //   .catch((error)=>{
    //     console.log(error);
    //   })

  },[])

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