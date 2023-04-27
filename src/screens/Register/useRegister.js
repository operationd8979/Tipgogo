import { useState, useContext } from 'react'
import { emailRegex, passRegex, nameRegex } from '../../utilies/regx'
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
} from "../../../firebase/firebase"

import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage'

async function saveToken(token) {
  try {
    await Keychain.setGenericPassword('token', token);
    console.log('Token saved successfully');
  } catch (error) {
    console.log("Could not save token:", error);
  }
}
async function getToken() {
  try {
    const result = await Keychain.getInternetCredentials('token');
    if (result) {
      return result.password;
    } else {
      console.log('No token found in Keychain');
    }
  } catch (error) {
    console.log('Could not get token:', error);
  }
}
async function deleteToken() {
  try {
    await Keychain.resetGenericPassword();
    console.log('Token deleted successfully');
  } catch (error) {
    console.log("Could not delete token:", error);
  }
}

const useRegister = () => {

  const navigation = useNavigation()

  const [email, setEmail] = useState('')
  const [fullname, setFullname] = useState('')
  const [password, setPassword] = useState('')
  const [repassword, setRePassword] = useState('')
  const [showPassword, setShowPassword] = useState(true)
  const [fullnameError, setFullnameError] = useState(null)
  const [emailError, setEmailError] = useState(null)
  const [passwordError, setPasswordError] = useState(null)
  const [repasswordError, setRePasswordError] = useState(null)

  function validateCredentials() {
    let result = true

    setEmailError(null)
    setPasswordError(null)
    setFullnameError(null)

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
      createUserWithEmailAndPassword(auth, email, password).then((userCreate) => {
        const user = userCreate.user;
        signInWithEmailAndPassword(auth, email, password)
          .then((userLogin) => {
            sendEmailVerification(user)
              .then(() => {
                console.log('Email verification sent');
              })
              .catch((error) => {
                console.log(error);
              });
            onAuthStateChanged(auth, (responseUser) => { 
              if(responseUser) {     
                  //saveToken(responseUser.accessToken).then(()=>{debugger});   
                  AsyncStorage.setItem(
                    'token',
                    responseUser.accessToken,
                  ) 
                  /*                                       
                  firebaseSet(firebaseDatabaseRef(
                      firebaseDatabase,
                      `users/${responseUser.uid}`
                  ), user)*/             
              } 
            })
          })
          .catch((error) => {
            console.log(error);
          });
          navigation.navigate('Login')
      }).catch((error)=>{
        Alert.alert(error.name, error.message , [{text: 'Ok'}])
      })
  }}
  return {
    email,
    setEmail,
    emailError,
    fullname,
    setFullname,
    fullnameError,
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
