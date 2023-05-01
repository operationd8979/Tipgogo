import React, { useState } from "react"
import { View, Text, Switch, TouchableOpacity } from "react-native"
import { colors, fontSizes, icons, images, normalize } from "../constants"
import Icon from 'react-native-vector-icons/FontAwesome5'

import { auth } from '../../firebase/firebase'
import { StackActions } from '@react-navigation/native'

const Setting = (props) => {

    const { navigation } = props

    const { primary, inactive, success, warning, zalert } = colors
    return <View style={{
        flex: 1,
        //backgroundColor:'purple'
    }}>
        <View style={{
            flex: 10,
            marginHorizontal: 5
        }}>
            <Text style={{
                color: 'black',
                fontSize: normalize(20),
                fontWeight: 'bold',
                padding: 10
            }}>Settings</Text>
        </View>
        <View style={{
            flex: 15,
            marginHorizontal: 10
        }}>
            <Text style={{
                color: primary,
                fontSize: fontSizes.h4,
                fontWeight: '500'
            }}>GROUPS</Text>
            <TouchableOpacity
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
                }}>Sign in with google</Text>
            </TouchableOpacity>
        </View>
        <View style={{
            flex: 15,
            marginHorizontal: 10,
        }}>
            <Text style={{
                color: primary,
                fontSize: fontSizes.h4,
                fontWeight: '500'
            }}>SRCEEN TIME TRACKING</Text>
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
                }}>Track while charging</Text>
                <View style={{ flex: 1 }} />
                <Switch />
            </View>
        </View>
        <View style={{
            flex: 20,
            marginHorizontal: 10,
        }}>
            <TouchableOpacity style={{
                flexDirection: 'row',
                paddingVertical: 10,
                alignItems: 'center',
            }} onPress={() => {
                auth.signOut()
                navigation.dispatch(StackActions.replace('Welcome'));
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
            backgroundColor: 'purple'
        }}>

        </View>
    </View>
}

export default Setting

