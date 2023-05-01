import React, { useState } from "react"
import { View, Text, Switch, TouchableOpacity, StyleSheet, ScrollView, Modal } from "react-native"
import { colors, fontSizes, icons, images, normalize } from "../../constants"
import Icon from 'react-native-vector-icons/FontAwesome5'
import { Dimensions } from 'react-native';

import { auth } from '../../../firebase/firebase'
import { StackActions } from '@react-navigation/native'

import {Dropdown} from '../../components'

import { Picker } from '@react-native-picker/picker'




const CreateRequest = () => {

    const [typeRequest, setTypeRequest] = useState(1);

    const [selected, setSelected] = useState(false);
    const data = [
        { label: 'One', value: '1' },
        { label: 'Two', value: '2' },
        { label: 'Three', value: '3' },
        { label: 'Four', value: '4' },
        { label: 'Five', value: '5' },
    ];

    return (
        <View>
            <View style={styles.pickerContainer}>
                <Text style={{ fontSize: fontSizes.h5 }}>Danh mục |</Text>
                <Picker
                    selectedValue={typeRequest}
                    style={styles.picker}
                    onValueChange={(itemValue, itemIndex) => setTypeRequest(itemValue)}
                >
                    <Picker.Item label="Hitchhiking" value={1} />
                    <Picker.Item label="Secondhand Stuff" value={2} />
                    <Picker.Item label="Delivery" value={3} />
                </Picker>
            </View>
            <View style={styles.container}>
                {!!selected && (
                    <Text>
                        Selected: label = {selected.label} and value = {selected.value}
                    </Text>
                )}
                <Dropdown label="Select Item" data={data} onSelect={setSelected} />
                <Text>This is the rest of the form.</Text>
            </View>
        </View>
    );
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
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
    },
});

export default CreateRequest;
