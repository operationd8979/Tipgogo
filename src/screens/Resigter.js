import React, { useState, useEffect, useCallback } from "react";
import { Text, Image, View, Keyboard, KeyboardAvoidingView, TextInput } from "react-native"
import Icon from "react-native-vector-icons/FontAwesome5"

import { CLButton } from "../components"
import { colors, fontSizes, images } from "../constants"
import { isValidEmail, isValidPassword } from "../utilies"

const { logo } = images;
const { primary, placeholder, facebook, google, inactive } = colors;

const Register = (props) => {

    const {navigation,route} = props
    const {navigate,goBack} = navigation

    const MIN_PASSWORD_LENGTH = 5;
    const EMAIL_ERROR_MESSAGE = 'Email not in correct format!';
    const PASSWORD_ERROR_MESSAGE = `Password must be at least ${MIN_PASSWORD_LENGTH} characters!`;

    const [errorEmail, setErrorEmail] = useState('')
    const [errorPassword, setErrorPassword] = useState('')
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })

    const { email, password } = formData

    const isValidationOK = () => isValidEmail(email)&&isValidPassword(password)
    //const isValidationOK = () => true

    const [keyboardIsShow, setKeyboardIsShow] = useState(false)
    useEffect(() => {
        //componentDidMount
        const ShowKeyboard = () => setKeyboardIsShow(true);
        const HideKeyboard = () => setKeyboardIsShow(false);

        Keyboard.addListener('keyboardDidShow', ShowKeyboard)
        Keyboard.addListener('keyboardDidHide', HideKeyboard)
        return () => {
            Keyboard.removeAllListeners('keyboardDidShow')
            Keyboard.removeAllListeners('keyboardDidHide')
        }
    }, [])

    const handleEmailChange = useCallback((text) => {
        setErrorEmail(isValidEmail(text) ? '' : EMAIL_ERROR_MESSAGE)
        setFormData({
            ...formData,
            email: text
        })
    }, [])
    const handlePasswordChange = useCallback((text) => {
        setErrorPassword(isValidPassword(text) ? '' : PASSWORD_ERROR_MESSAGE)
        setFormData({
            ...formData,
            password: text
        })
    }, [])

    return <KeyboardAvoidingView
        style={{
            paddingTop: 60,
            backgroundColor: primary,
            flex: 1,
        }}>
        <View style={{
            flex: 30,
            //backgroundColor:'red',
            flexDirection: 'row',
            alignItems: 'center'
        }}>
            <View style={{
                //backgroundColor:'blue',
                flex: 1,
                alignItems: 'center',
                paddingHorizontal: 10
            }}>
                <Text style={{
                    color: 'white',
                    fontSize: fontSizes.m4,
                    fontWeight: 'bold',
                }}>Here's first step with us!</Text>
            </View>
            <View style={{
                //backgroundColor:'green',
                flex: 1,
                alignItems: 'center',
            }}>
                <Image source={logo}
                    style={{
                        width: 200,
                        height: 200,
                        resizeMode: 'contain',
                        backgroundColor: 'white',
                        borderTopLeftRadius: 60,
                        borderTopRightRadius: 130,
                        borderBottomLeftRadius: 112,
                        borderBottomRightRadius: 70,
                        marginEnd:18
                    }} />
            </View>
        </View>
        <View style={{
            flex: 90,
            backgroundColor: 'white',
            marginHorizontal: 15,
            marginVertical: 30,
            paddingVertical: 20,
            borderRadius: 20
        }}>
            <View style={{
                flex: 15,
                backgroundColor: 'white',
                marginHorizontal: 15
            }}>
                <Text style={{
                    fontSize: fontSizes.h4,
                    color: primary,
                }}>Email:</Text>
                <TextInput
                    autoCorrect={false}
                    onChangeText={handleEmailChange}
                    placeholder='example@gmai.com'
                    placeholderTextColor={placeholder}
                    style={{
                        color: 'black'
                    }}
                />
                <View style={{ height: 1, backgroundColor: primary }} />
                <Text style={{
                    color: 'red',
                    fontSize: fontSizes.h5
                }}>{errorEmail}</Text>
            </View>
            <View style={{
                flex: 15,
                backgroundColor: 'white',
                marginHorizontal: 15
            }}>
                <Text style={{
                    fontSize: fontSizes.h4,
                    color: primary,
                }}>FullName:</Text>
                <TextInput
                    //onChangeText={handleEmailChange}
                    autoCorrect={false}
                    placeholder='Enter your name!'
                    placeholderTextColor={placeholder}
                    style={{
                        color: 'black'
                    }}
                />
                <View style={{ height: 1, backgroundColor: primary }} />
                <Text style={{
                    color: 'red',
                    fontSize: fontSizes.h5
                }}>{errorEmail}</Text>
            </View>
            <View style={{
                flex: 15,
                backgroundColor: 'white',
                marginHorizontal: 15
            }}>
                <Text style={{
                    fontSize: fontSizes.h4,
                    color: primary,
                }}>Password:</Text>
                <TextInput
                    onChangeText={handlePasswordChange}
                    autoCorrect={false}
                    placeholder='Enter your password!'
                    secureTextEntry={true}
                    placeholderTextColor={placeholder}
                    style={{
                        color: 'black'
                    }}
                />
                <View style={{ height: 1, backgroundColor: primary }} />
                <Text style={{
                    color: 'red',
                    fontSize: fontSizes.h5
                }}>{errorPassword}</Text>
            </View>
            <View style={{
                flex: 15,
                backgroundColor: 'white',
                marginHorizontal: 15
            }}>
                <Text style={{
                    fontSize: fontSizes.h4,
                    color: primary,
                }}>ReType-Passowrd:</Text>
                <TextInput
                    onChangeText={handlePasswordChange}
                    autoCorrect={false}
                    placeholder='Re-Enter your password!'
                    placeholderTextColor={placeholder}
                    secureTextEntry={true}
                    style={{
                        color: 'black'
                    }}
                />
                <View style={{ height: 1, backgroundColor: primary }} />
                <Text style={{
                    color: 'red'
                }}>{errorPassword}</Text>
            </View>
            <View style={{
                flex: 10,
                //backgroundColor: 'green',
            }}>
                <View style={{
                    flex: 1
                }} />
                <CLButton title="Register"
                    disabled={!isValidationOK()}
                    onPress={() => {
                        navigate('Login')
                    }}
                    colorBG={isValidationOK() ? primary : inactive}
                    colorBD={'white'}
                    colorT={'white'}
                    sizeF={fontSizes.h4}
                    sizeB={1}
                    sizeBT={"60%"}
                    radius={17}
                />
                <View style={{
                    flex: 1
                }} />
            </View>
            
        </View>
        <View style={{
                flex: 20,
                //backgroundColor: 'purple',
            }}>
                <View style={{
                    flexDirection: 'row',
                    height: 30,
                    alignItems: 'center',
                    marginHorizontal: 20,
                    //backgroundColor:'green'
                }}>
                    <View style={{ height: 1, backgroundColor: 'white', flex: 1 }} />
                    <Text style={{
                        color: 'white',
                        alignSelf: 'center',
                        fontSize: fontSizes.h4,
                        marginHorizontal: 10
                    }}>Use other methods?</Text>
                    <View style={{ height: 1, backgroundColor: 'white', flex: 1 }} />
                </View>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                }}>
                    <Icon name='facebook' size={45} color={facebook}/>
                    <View style={{ width: 15 }} />
                    <Icon name='google' size={45} color={google} />
                </View>
            </View>
        {keyboardIsShow == true && <View style={{ flex: 1 }} />}
    </KeyboardAvoidingView>
}

export default Register