import React, { useState, useEffect, useCallback } from "react";
import { Text, Image, View, TextInput, Alert, ActivityIndicator } from "react-native"
import Icon from "react-native-vector-icons/FontAwesome5"
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { CLButton } from "../../components"
import { colors, fontSizes, images } from "../../constants"
import i18n from "../../../i18n";

import useRegister from './useRegister'

const { logo } = images;
const { primary, placeholder, facebook, google, inactive } = colors;

const Register = (props) => {

    const {
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
    } = useRegister()


    const { navigation, route } = props
    const { navigate, goBack } = navigation

    const [showIndicator,setShowIndicator] = useState(false)

    const startLoading = () =>{
        setShowIndicator(true);
        setTimeout(()=>{
            setShowIndicator(false);
        }, 1500)
    }


    return <KeyboardAwareScrollView
        enableResetScrollToCoords={true}
        contentContainerStyle={{ flexGrow: 1 }}
        style={{
            paddingTop: 15,
            backgroundColor: primary,
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
                }}>{i18n.t('r_tile')}</Text>
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
                        marginEnd: 18
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
                }}>{i18n.t('r_email')}</Text>
                <TextInput
                    autoCorrect={false}
                    placeholder={i18n.t('r_placehold_email')}
                    placeholderTextColor={placeholder}
                    style={{
                        color: 'black'
                    }}
                    value={email}
                    onChangeText={setEmail}
                />
                <View style={{ height: 1, backgroundColor: primary }} />
                <Text style={{
                    color: 'red',
                    fontSize: fontSizes.h5
                }}>{emailError}</Text>
            </View>
            <View style={{
                flex: 15,
                backgroundColor: 'white',
                marginHorizontal: 15
            }}>
                <Text style={{
                    fontSize: fontSizes.h4,
                    color: primary,
                }}>{i18n.t('r_fullname')}</Text>
                <TextInput
                    autoCorrect={false}
                    placeholder={i18n.t('r_placehold_name')}
                    placeholderTextColor={placeholder}
                    style={{
                        color: 'black'
                    }}
                    value={fullname}
                    onChangeText={setFullname}
                />
                <View style={{ height: 1, backgroundColor: primary }} />
                <Text style={{
                    color: 'red',
                    fontSize: fontSizes.h5
                }}>{fullnameError}</Text>
            </View>
            <View style={{
                flex: 15,
                backgroundColor: 'white',
                marginHorizontal: 15
            }}>
                <Text style={{
                    fontSize: fontSizes.h4,
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
                        onChangeText={e => setPassword(e)}
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
                flex: 15,
                backgroundColor: 'white',
                marginHorizontal: 15
            }}>
                <Text style={{
                    fontSize: fontSizes.h4,
                    color: primary,
                }}>{i18n.t('r_repassword')}</Text>
                <TextInput
                    autoCorrect={false}
                    placeholder={i18n.t('r_placehold_repassword')}
                    placeholderTextColor={placeholder}
                    secureTextEntry={showPassword}
                    style={{
                        color: 'black'
                    }}
                    value={repassword}
                    onChangeText={setRePassword}
                />
                <View style={{ height: 1, backgroundColor: primary }} />
                <Text style={{
                    color: 'red'
                }}>{repasswordError}</Text>
            </View>
            <View style={{
                flex: 10,
                //backgroundColor: 'green',
            }}>
                <View style={{
                    flex: 1
                }} />
                <ActivityIndicator size={'large'} animating={showIndicator}/>
                <CLButton title={i18n.t('register')}
                    onPress={async () => {
                        startLoading();
                        registerAction();
                    }}
                    colorBG={primary}
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
                }}>{i18n.t('r_method')}</Text>
                <View style={{ height: 1, backgroundColor: 'white', flex: 1 }} />
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

export default Register