import React, { useEffect, useState, useRef } from "react"
import { View, Text, Switch, TouchableOpacity, TextInput, Linking, Modal, StyleSheet, Image } from "react-native"
import { colors, fontSizes, icons, images, normalize, split } from "../constants"
import Icon from 'react-native-vector-icons/FontAwesome5'
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
} from "../../firebase/firebase"
import { Camera, useCameraDevices } from 'react-native-vision-camera'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import { StackActions } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Dropdown, CLButton } from '../components'
import ImageResizer from 'react-native-image-resizer';

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


const checkCameraPermission = async () => {
    const cameraPermission = await Camera.getCameraPermissionStatus();
    if (cameraPermission !== 'authorized') {
        const newPermission = await Camera.requestCameraPermission();
        if (newPermission !== 'authorized') {
            FlashMessage({
                message:
                    'Tap on this message to open Settings then allow app to use camera from permissions.',
                onPress: async () => {
                    await Linking.openSettings()
                }
            })
        }
    }
    else {
        console.log("Camera already use!")
    }
}

const Setting = (props) => {

    const [init,setInit] = useState(0);

    const [user, setUser] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [photoPath, setPhotoPath] = useState(null);
    const [fullName, setFullName] = useState(null);

    const camera = useRef(null);
    const devices = useCameraDevices('wide-angle-camera')
    const device = devices.front

    useEffect(() => {
        console.log("__________Init setting__________");
        getUserByTokken().then((user) => {
            setUser(user);
        })
        checkCameraPermission();
    }, [init])

    const handlePressCamera = async () => {
        console.log('-------Press camera--------');
        try {
            const photo = await camera.current.takePhoto({});
            const filePath = "file://" + photo.path;
            const resizedImage = await ImageResizer.createResizedImage(filePath, 800, 800, 'JPEG', 80);
            const { uri: resizedUri, path } = resizedImage;
            console.log(`uri photo:${resizedUri}`);
            setPhotoPath(resizedUri);
        } catch (e) {
            console.error(e)
        }
    };

    const updatePhotoUser = async() => {
        if (photoPath) {
            const uploadedImageUrl = await uploadImage(photoPath);
            const userRef = ref(firebaseDatabase, `users/${user.userID}`);
            update(userRef, { photo: uploadedImageUrl })
                    .then(() => {
                        console.log("Update photo's user successfully!.");
                        setPhotoPath(null);
                        setInit(init+1);
                    })
                    .catch((error) => {
                        console.error("Error updating photo's user: ", error);
                    });
        }
        else{
            console.error("PhotoPath is null!");
        }
        setModalVisible(false);
    }

    const updateNameUser = async() => {
        if (fullName) {
            const userRef = ref(firebaseDatabase, `users/${user.userID}`);
            update(userRef, { name: fullName })
                    .then(() => {
                        console.log("Update name's user successfully!.");
                        setFullName(null);
                        setInit(init+1);
                    })
                    .catch((error) => {
                        console.error("Error updating name's user: ", error);
                    });
        }
        else{
            console.error("PhotoPath is null!");
        }
    }

    const uploadImage = async (uri) => {
        try {
            const ref = storageRef(storage, `UserPhoto/${user.userID}.jpg`);
            const fileData = await fetch(uri);
            const bytes = await fileData.blob();
            const snapshot = await uploadBytes(ref, bytes, { contentType: 'image/jpeg' });
            const url = await getDownloadURL(snapshot.ref);
            console.log("Uploaded OK! URL:", url);
            return url;
        } catch (error) {
            console.error(error);
            return null;
        }
    };

    const { navigation } = props

    const { primary, inactive, success, warning, zalert, placeholder } = colors
    return <KeyboardAwareScrollView
            enableResetScrollToCoords={true}
            contentContainerStyle={{ flexGrow: 1, height:normalize(440) }}
        >
        <View style={{
            flex: 10,
            marginHorizontal: 5,
        }}>
            <Text style={{
                color: 'black',
                fontSize: normalize(20),
                fontWeight: 'bold',
                padding: 10
            }}>Settings</Text>
            <View style={{ height: 1, backgroundColor: primary }} />
        </View>
        <View style={{
            flex: 15,
            marginHorizontal: 10
        }}>
            <Text style={{
                color: primary,
                fontSize: fontSizes.h4,
                fontWeight: '500'
            }}>Update your photo</Text>
            <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={{
                    borderColor: primary,
                    borderWidth: 1,
                    height: 35,
                    width: '80%',
                    borderRadius: 10,
                    marginHorizontal: 17,
                    marginVertical: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'center',
                    backgroundColor: primary
                }}>
                <Text style={{
                    fontSize: fontSizes.h5,
                    color: 'white',
                }}>Open camera</Text>
            </TouchableOpacity>
            <Modal visible={modalVisible} animationType="slide">
                <View style={{
                    flex: 1,
                    marginHorizontal: 5
                }}>
                    <Text style={{
                        color: 'black',
                        fontSize: normalize(20),
                        fontWeight: 'bold',
                        padding: 10
                    }}>Your Photo</Text>
                    <View style={{ height: 1, backgroundColor: primary }} />
                </View>
                <View style={{ 
                    flex: 2, 
                    justifyContent: 'space-around', 
                    flexDirection: 'row',
                    alignItems: 'center',
                }}>
                    <Image
                        source={user?{ uri: user.photo||images.uriUserPhoto }:images.userPhoto}
                        style={{
                            width: "30%",
                            height: "80%",
                            alignSelf: "center",
                            borderRadius: 90,
                        }}
                    />
                    <CLButton 
                        title="Update" 
                        sizeBT="20%" 
                        height="30%" 
                        colorBG={photoPath!=null?primary:inactive}
                        colorBD={"white"}
                        colorT={photoPath!=null?"white":"black"}
                        disabled={photoPath==null}
                        onPress={updatePhotoUser}/>
                    <Image
                        source={photoPath?{ uri: photoPath }:images.userPhoto}
                        style={{
                            width: "30%",
                            height: "80%",
                            alignSelf: "center",
                            borderRadius: 90,
                        }}
                    />
                </View>
                <View style={{ flex: 8, justifyContent: 'center' }}>
                    {modalVisible && device && (
                        <View style={styles.container}>
                            <Camera
                                ref={camera}
                                style={{
                                    height: "85%",
                                    width: "100%",
                                    marginBottom: split.s3,
                                }}
                                device={device}
                                isActive={true}
                                preset="medium"
                                photo={true}
                            />
                            <TouchableOpacity
                                //onPress={handlePressCamera}
                                onPress={() => {
                                    handlePressCamera();
                                    console.log(photoPath);
                                }}
                            >
                                <View
                                    style={{
                                        borderWidth: 2,
                                        borderColor: "white",
                                        height: 50,
                                        width: 50,
                                        borderRadius: 30,
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        marginBottom: 20,
                                        alignSelf: 'center',
                                    }}
                                />
                            </TouchableOpacity>
                        </View>
                    )}
                    <CLButton title="Close Modal" 
                        onPress={() => {
                            setPhotoPath(null);
                            setModalVisible(false)
                    }}/>
                </View>
            </Modal>
        </View>
        <View style={{
            flex: 15,
            marginHorizontal: 15
        }}>
            <Text style={{
                fontSize: fontSizes.h4,
                color: primary,
            }}>Your name</Text>
            <View style={{
                flexDirection:'row',
                alignItems: 'center',
            }}>
                <TextInput
                    autoCorrect={false}
                    placeholder={user ? user.name || "Full Name" : "Full Name"}
                    placeholderTextColor={placeholder}
                    value={fullName}
                    onChangeText={setFullName}
                    style={{
                        color: 'black',
                        flex:1,
                        //backgroundColor:'red'
                }}/>
                <TouchableOpacity 
                    onPress={updateNameUser}
                    style={{
                        padding:normalize(10),
                        borderWidth: 1,
                        borderColor: primary,
                        backgroundColor: primary,
                        borderRadius: 20,
                }}>
                    <Text style={{color:"white"}}>Change</Text>
                </TouchableOpacity>
            </View>
            <View style={{ height: 1, backgroundColor: primary }} />
        </View>
        <View style={{
            flex: 15,
            marginHorizontal: 10,
        }}>
            <Text style={{
                color: primary,
                fontSize: fontSizes.h4,
                fontWeight: '500'
            }}>Theme</Text>
            <View style={{
                flexDirection: 'row',
                margin: 5,
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <Icon name='facebook' size={20} />
                <Text style={{
                    fontSize: fontSizes.h5,
                    color: 'black',
                    marginStart: 5
                }}>Enable Dark mode</Text>
                <View style={{ flex: 1 }} />
                <Switch />
            </View>
        </View>
        <View style={{
            flex: 8,
            marginHorizontal: 10,
            //backgroundColor:"red"
        }}>
            <TouchableOpacity style={{
                flexDirection: 'row',
                paddingVertical: 10,
                alignItems: 'center',
                //backgroundColor:"green"
            }} onPress={async () => {
                auth.signOut()
                await AsyncStorage.removeItem('token');
                navigation.dispatch(StackActions.replace('Welcome'));
                //navigation.dispatch(StackActions.popToTop());
                console.log("Sign out!");
            }}>
                <Icon
                    name='sign-out-alt'
                    style={{ marginStart: 10 }}
                    size={16} color={'black'}
                />
                <Text style={{
                    color: 'black',
                    fontSize: fontSizes.h6,
                    color: 'black',
                    paddingStart: 10,
                }}>Sign out</Text>
                <View style={{ flex: 1 }} />
                <Icon
                    name='chevron-right'
                    style={{
                        paddingEnd: 10,
                        opacity: 0.5,
                    }}
                    size={20} color={'black'}
                />
            </TouchableOpacity>
        </View>
        <View style={{
            flex: 40,
            //backgroundColor: 'purple',
            margin: split.s2,
            paddingHorizontal: split.s3,
            borderColor: primary,
            borderWidth: 1,
            borderRadius: 20,
        }}>
            <Text style={{
                color: primary,
                fontSize: fontSizes.h2,
                fontWeight: '500',
                alignSelf: 'center',
                marginVertical: split.s1,
                //backgroundColor:"green"
            }}>Your information</Text>
            <View style={{
                flexDirection: "row",
                flex: 1,
                //backgroundColor:"red"
            }}>
                <Image
                    source={user ? { uri: user.photo||images.uriUserPhoto } : images.userPhoto}
                    style={{
                        width: "35%",
                        //height: "60%",
                        height: normalize(105),
                        alignSelf: "center",
                        borderRadius: 90,
                    }}
                />
                <View style={{
                    flex: 1,
                    //backgroundColor:"green",
                    margin: split.s1,
                    justifyContent: 'center',
                }}>
                    <Text style={{
                        color: "black",
                        fontSize: fontSizes.h4,
                        fontWeight: 'bold',
                    }}>Email:</Text>
                    <Text style={{
                        color: "black",
                        fontSize: fontSizes.h4,
                        fontWeight: 'bold',
                        alignSelf: 'center'
                    }}>{user ? user.email : "Your email is not seted!"}</Text>
                    <View style={{ height: normalize(8) }} />
                    <Text style={{
                        color: "black",
                        fontSize: fontSizes.h4,
                        fontWeight: 'bold',
                    }}>FullName:</Text>
                    <Text style={{
                        color: "black",
                        fontSize: fontSizes.h4,
                        fontWeight: 'bold',
                        alignSelf: 'center'
                    }}>{user ? user.name || "Your name is not seted!" : "null"}</Text>
                </View>
            </View>
        </View>
        <View style={{
            flex: 10,
        }}/>
    </KeyboardAwareScrollView>
}

const styles = StyleSheet.create({
    pickerContainer: {
        margin: 20,
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 5,
        height: 50,
        width: 350,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 10,
        marginBottom: 60,
    },
    picker: {
        flex: 1,
        height: 50,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
});

export default Setting

