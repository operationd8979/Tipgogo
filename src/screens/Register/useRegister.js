import { useState, useContext } from 'react'
import { emailRegex, passRegex, nameRegex, phoneRegex } from '../../utilies'
import { useNavigation, useRoute } from '@react-navigation/native'
import i18n from '../../../i18n'
import { Alert } from 'react-native'
import {
  auth,
  firebaseDatabase,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  onAuthStateChanged,
  ref,
  set,
} from "../../../firebase/firebase"

import { StackActions } from '@react-navigation/native'

import AsyncStorage from '@react-native-async-storage/async-storage'

const useRegister = () => {

  const navigation = useNavigation()

  const [email, setEmail] = useState('')
  const [fullname, setFullname] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [repassword, setRePassword] = useState('')
  const [showPassword, setShowPassword] = useState(true)
  const [fullnameError, setFullnameError] = useState(null)
  const [phoneError, setPhoneError] = useState(null)
  const [emailError, setEmailError] = useState(null)
  const [passwordError, setPasswordError] = useState(null)
  const [repasswordError, setRePasswordError] = useState(null)

  function validateCredentials() {
    let result = true

    setEmailError(null)
    setPasswordError(null)
    setFullnameError(null)
    setPhoneError(null)
    setRePasswordError(null)

    if (!email) {
      setEmailError(i18n.t('emailErr1'))
      result = false
    } else if (!emailRegex.test(email.trim())) {
      setEmailError(i18n.t('emailErr2'))
      result = false
    }

    if (!password) {
      setPasswordError(i18n.t('passErr1'))
      result = false
    } else if (passRegex.test(password) !== true) {
      setPasswordError(i18n.t('passErr2'))
      result = false
    }

    if (!fullname) {
      setFullnameError(i18n.t('fullnameErr1'))
      result = false
    } else if (!nameRegex.test(fullname)) {
      setFullnameError(i18n.t('fullnameErr2'))
      result = false
    }

    if (!phone) {
      setPhoneError(i18n.t('mobileErr1'))
      result = false
    } else if (!phoneRegex.test(phone)) {
      setPhoneError(i18n.t('mobileErr2'))
      result = false
    }

    if (!repassword) {
      setRePasswordError(i18n.t('repassErr1'))
      result = false
    } else if (repassword !== password) {
      setRePasswordError(i18n.t('repassErr2'))
      result = false
    }

    return result
  }

  function registerAction() {
    if (validateCredentials()) {
      createUserWithEmailAndPassword(auth, email, password).then((userCredential) => {
        console.log('Create account sucessfully!');
        sendEmailVerification(userCredential.user)
          .then(() => {
            console.log('Email verification sent');
          })
          .catch((error) => {
            console.log("Error send email verification: ", error);
          });
        signInWithEmailAndPassword(auth, email, password)
          .then(() => {
            console.log("Logined to app");
            const unsubscribe = onAuthStateChanged(auth, async (responseUser) => {
              if (responseUser) {
                console.log("Auth successfully!");
                AsyncStorage.setItem('token', responseUser.accessToken)
                  .then(() => {
                    //navigation.dispatch(StackActions.replace('UItab'));
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'UItab' }],
                    });
                    console.log("Set Token successfully!");
                  }).catch(() => {
                    console.log("Error set Token!");
                  })
                const fcmToken = await AsyncStorage.getItem("fcmToken");
                let userapp = {
                  userId: responseUser.uid,
                  email: responseUser.email,
                  name: fullname,
                  phone: phone,
                  emailVerified: responseUser.emailVerified,
                  accessToken: responseUser.accessToken,
                  fcmToken: fcmToken,
                }
                set(ref(firebaseDatabase, `users/${userapp.userId}`), userapp)
                  .then(() => {
                    console.log("Data written to Firebase Realtime Database.");
                  })
                  .catch((error) => {
                    console.log("Error writing data to Firebase Realtime Database: ", error);
                  });
              }
            })
            unsubscribe();
          })
          .catch((error) => {
            console.log(error);
          });
      }).catch((error) => {
        console.log("Error create account: ", error);
        Alert.alert(error.name, error.message, [{ text: 'Ok' }])
      })
    }
  }
  return {
    email,
    setEmail,
    emailError,
    fullname,
    setFullname,
    fullnameError,
    phone,
    setPhone,
    phoneError,
    password,
    setPassword,
    passwordError,
    repassword,
    setRePassword,
    repasswordError,
    showPassword,
    setShowPassword,
    registerAction,
    validateCredentials,
  }
}

export default useRegister
