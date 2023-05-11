import React, { useState, useRef, useEffect, useContext, useCallback } from "react"
import { View, Text, Switch, TouchableOpacity, StyleSheet, ScrollView, Modal, Alert, Platform, Image, Linking, RefreshControl } from "react-native"
import { useRoute } from '@react-navigation/native';
import useMap from '../FullMap/FullMap'
import { useEvent } from 'react-native-reanimated';
import { colors, fontSizes, icons, images, normalize, split } from "../../constants"

const RequestDetail = (props) => {

    const route = useRoute();

    const { request } = route.params;

    const {
        requestId,
        name,
        url,
        status,
        price,
        type,
        des,
        geo,
    } = request;

    const { FullMap } = useMap();

    return <View style={styles.container}>
        {/* <FullMap geo1={geo} screen="RequestDetail" /> */}
        <FullMap geo1={geo} screen="RequestDetail" />
    </View>
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