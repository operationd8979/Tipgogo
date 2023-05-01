import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, Image, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Keyboard, Alert, ActivityIndicator } from "react-native";
import { images, fontSizes, colors } from "../../constants"
import { CLButton } from '../../components';
import Icon from 'react-native-vector-icons/FontAwesome5'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import i18n from '../../../i18n';

import userLogin  from './useLogin';


const { logo } = images;
const { primary, placeholder, facebook, google, inactive } = colors;

const Login = (props) => {

    const {
        email,
        setEmail,
        password,
        setPassword,
        showPassword,
        setShowPassword,
        emailError,
        passwordError,
        signInAction,
    } = userLogin()

    const { navigation, route } = props
    const { navigate, goBack } = navigation

    const [error, setError] = useState('')
    const [showIndicator,setShowIndicator] = useState(false)

    const startLoading = () =>{
        setShowIndicator(true);
        setTimeout(()=>{
            setShowIndicator(false);
        }, 1500)
    }


    const isValidationOK = () => true

    return <KeyboardAwareScrollView
        style={{
            paddingTop: 60,
            backgroundColor: 'white',
        }}
        enableResetScrollToCoords={true}
        contentContainerStyle={{ flexGrow: 1 }}
    >
        <View style={{
            flex: 30,
            flexDirection: 'row',
            alignItems: 'center'
        }}>
            <View style={{
                flex: 1,
                alignItems: 'center'
            }}>
                <Text style={{
                    color: 'black',
                    fontSize: fontSizes.m4,
                    fontWeight: 'bold',
                }}>{i18n.t('l_tile')}</Text>
            </View>
            <View style={{
                flex: 1,
                alignItems: 'center',
            }}>
                <Image source={logo}
                    style={{
                        width: 210,
                        height: 210,
                        resizeMode: 'contain',
                        backgroundColor: primary,
                        borderTopLeftRadius: 60,
                        borderTopRightRadius: 130,
                        borderBottomLeftRadius: 112,
                        borderBottomRightRadius: 70,
                        marginEnd: 15
                    }} />
            </View>
        </View>
        <View style={{
            flex: 15,
            marginHorizontal: 15
        }}>
            <Text style={{
                fontSize: fontSizes.h3,
                color: primary,
            }}>{i18n.t('r_email')}</Text>
            <TextInput
                value={email}
                onChangeText={setEmail}
                autoCorrect={false}
                placeholder={i18n.t('r_placehold_email')}
                placeholderTextColor={placeholder}
                style={{
                    color: 'black'
                }}
            />
            <View style={{ height: 1, backgroundColor: primary }} />
            <Text style={{
                    color: 'red',
                    fontSize: fontSizes.h5
                }}>{emailError}</Text>
        </View>
        <View style={{
            flex: 15,
            marginHorizontal: 15
        }}>
            <Text style={{
                fontSize: fontSizes.h3,
                color: primary,
            }}>{i18n.t('r_password')}</Text>
            <View style={{
                    flexDirection: 'row',
                    alignItems: 'center'
                }}>
                    <TextInput
                        autoCorrect={false}
                        placeholder={i18n.t('r_placehold_password')}
                        placeholderTextColor={placeholder}
                        style={{
                            color: 'black',
                            flex: 9,
                        }}
                        secureTextEntry={showPassword}
                        value={password}
                        onChangeText={setPassword}
                    />
                    <Icon
                        onPress={() => setShowPassword(!showPassword)}
                        name={showPassword ? 'eye' : 'eye-slash'}
                        size={24}
                        color={primary}
                        style={{
                            flex: 1,
                            padding: 10,
                        }}
                    />
                </View>
            <View style={{ height: 1, backgroundColor: primary }} />
            <Text style={{
                    color: 'red',
                    fontSize: fontSizes.h5
                }}>{passwordError}</Text>
        </View>
        <View style={{
            flex: 20,
        }}>
            <View style={{
                flex: 1
            }} />
            <ActivityIndicator size={'large'} animating={showIndicator}/>
            <CLButton title={i18n.t('login').toUpperCase()}
                disabled={!isValidationOK()}
                onPress={() => {
                    startLoading();
                    signInAction();
                }}
                colorBG={isValidationOK() ? primary : inactive}
                colorBD={'white'}
                colorT={'white'}
                sizeF={fontSizes.h4}
                sizeB={1}
                sizeBT={"60%"}
                radius={17}
            />
            <TouchableOpacity
                onPress={() => {
                    navigate('Register')
                }}
                style={{
                    padding: 7,
                }}>
                <Text style={{
                    color: primary,
                    alignSelf: 'center',
                    fontSize: fontSizes.h4,
                }}>{i18n.t('l_desUnder')}</Text>
            </TouchableOpacity>
            <View style={{
                flex: 1
            }} />
        </View>
        <View style={{
            flex: 20,
        }}>
            <View style={{
                flexDirection: 'row',
                height: 30,
                alignItems: 'center',
                marginHorizontal: 20,
            }}>
                <View style={{ height: 1, backgroundColor: 'black', flex: 1 }} />
                <Text style={{
                    color: 'black',
                    alignSelf: 'center',
                    fontSize: fontSizes.h4,
                    marginHorizontal: 10
                }}>{i18n.t('r_method')}</Text>
                <View style={{ height: 1, backgroundColor: 'black', flex: 1 }} />
            </View>
            <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
            }}>
                <Icon name='facebook' size={45} color={facebook} />
                <View style={{ width: 15 }} />
                <Icon name='google' size={45} color={google} />
            </View>
        </View>
    </KeyboardAwareScrollView>
}
export default Login