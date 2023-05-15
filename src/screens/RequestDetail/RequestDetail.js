import React, { useState, useRef, useEffect, useContext, useCallback } from "react"
import { View, Text, Switch, TouchableOpacity, StyleSheet, ScrollView, Modal, Alert, Platform, Image, Linking, RefreshControl } from "react-native"
import { useRoute } from '@react-navigation/native';
import useMap from '../FullMap/FullMap'
import { useEvent } from 'react-native-reanimated';
import { colors, fontSizes, icons, images, normalize, split } from "../../constants"
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

const RequestDetail = (props) => {

    const route = useRoute();

    const { request } = route.params;

    const { primary, inactive, zalert, warning, success } = colors;

    const {
        requestId,
        name,
        url,
        status,
        price,
        type,
        des,
        geo1,
        geo2,
        direction,
        accepted,
        timestamp
    } = request;

    const { FullMap } = useMap();

    useEffect(() => {
        if (!direction) {
            console.log("run get direction api");
        }
    }, [])

    const Circle = ({ children, color, size, style }) => {
        return (
            <View
                style={[
                    {
                        backgroundColor: color,
                        borderRadius: size / 2,
                        width: size,
                        height: size,
                        justifyContent: 'center',
                        alignItems: 'center',
                    },
                    style
                ]}>
                {children}
            </View>
        )
    }

    return <KeyboardAwareScrollView
        scrollEnabled={true}
        contentContainerStyle={{ flexGrow: 1 }}
    >
        {/* <View style={styles.container}>
            <FullMap geo1={geo1} geo2={geo2} direction={direction} type={type}/>
        </View> */}
        <FullMap geo1={geo1} geo2={geo2} direction={direction} type={type} />
        <View style={{
            //backgroundColor:"green",
            //height: 400,
            margin: normalize(10),
        }}>
            <View style={{ height: 1, backgroundColor: primary, marginHorizontal:normalize(50) }} />
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: normalize(10),
                marginHorizontal: normalize(20),
            }}>
                <Circle
                    color={primary}
                    size={30}>
                    <Text style={{ color: 'white', fontWeight: '800' }}>1</Text>
                </Circle>
                <Text style={{ fontSize:fontSizes.h4,color: primary, marginStart: normalize(5) }}>Pick up your item</Text>
                <Text style={{ fontSize:fontSizes.h4,color: "black", marginStart: normalize(5), position: 'absolute', end: normalize(20) }}>10km in 20 mins</Text>
            </View>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: normalize(10),
                marginHorizontal: normalize(20),
            }}>
                <Circle
                    color={primary}
                    size={30}>
                    <Text style={{ color: 'white', fontWeight: '800' }}>2</Text>
                </Circle>
                <Text style={{ fontSize:fontSizes.h4,color: primary, marginStart: normalize(5) }}>Pay for it</Text>
                <Text style={{ fontSize:fontSizes.h4,color: "black", marginStart: normalize(5), position: 'absolute', end: normalize(20) }}>300k vnd</Text>
            </View>
            <View style={{ height: 1, backgroundColor: primary, marginHorizontal:normalize(50) }} />
            <View style={{
                //backgroundColor:"green",
                height: 250,
                margin: normalize(5),
                alignItems:'center'
            }}>
                <Text style={{ fontSize: fontSizes.h3, color: primary }}>Detail request</Text>
                <View>
                    <Text style={{
                        marginTop: normalize(5),
                        color: 'black',
                        fontSize: fontSizes.h4,
                    }}>Địa chỉ của bạn: 115 ấp nam Lân, P.Trung Ma Thuận ,Quận 11, TP.HCM </Text>
                    <Text style={{
                        marginTop: normalize(5),
                        color: 'black',
                        fontSize: fontSizes.h4,
                    }}>Địa chỉ đến: 62 ấp Lạnh Lẽo, P.18 ,Quận Bình Thạnh, TP.HCM </Text>
                </View>
                
            </View>
        </View>
    </KeyboardAwareScrollView>
}

const styles = StyleSheet.create({
    container: {
        height: normalize(300),
        width: "90%",
        backgroundColor: 'rgba(255,255,255,0.95)',
        alignSelf: 'center',
        padding: split.s4,
        borderWidth: 1,
        borderColor: 'black',
        marginTop: 20,
    },
});

export default RequestDetail;