import React, { useEffect, useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native'
import { colors, fontSizes, normalize, split } from './src/constants'
import { CLButton, QuickView } from './src/components'
import Icon from 'react-native-vector-icons/FontAwesome5'
import useMap from './src/screens/FullMap/FullMap'

const Test = () => {

  const { primary, success, zalert, warning, inactive } = colors;
  const [modalVisible, setModalVisible] = useState(false);

  const { FullMap, currentLocation, getCurrentPosition, checkLocationPermission } = useMap();

  const handleCloseRequest = () => {
    setModalVisible(false);
  }

  return (
    <View style={{
      backgroundColor: '#3cb371',
      height: 500,
      marginTop: 100,
      borderWidth: 1,
    }}>
      <Modal visible={modalVisible} animationType="fade" transparent={true}  >
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <QuickView />
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
          }}>
            <CLButton title="Accept" sizeBT={"35%"} height={normalize(30)}
              onPress={() => acceptRequest()} />
            <CLButton title="Close Modal" sizeBT={"35%"} height={normalize(30)}
              onPress={() => handleCloseRequest()} />
          </View>
        </View>
      </Modal>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'center',
      }}>
        <TouchableOpacity style={{
          backgroundColor: '#3cb371',
          width: 205,
          alignItems: 'center',
          justifyContent: 'center',
          height: 35,
          borderWidth: 1,
          borderBottomWidth: 0,
        }}>
          <Text style={{ color: 'black' }}>Best choice</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{
          backgroundColor: inactive,
          width: 205,
          alignItems: 'center',
          justifyContent: 'center',
          height: 35,
          borderWidth: 1,
        }}>
          <Text style={{ color: 'black' }}>Hight profit</Text>
        </TouchableOpacity>
      </View>
      <View style={{
        marginVertical: 15,
      }}>
        <View style={{
          height: 100,
          //borderWidth: 1,
          backgroundColor: 'white',
          padding: 10,
          justifyContent: 'center',
          marginBottom: 5,
        }}>
          <Text style={{ color: 'black', fontWeight: 'bold' }}>TOP 1</Text>
          <View style={{ height: 1, backgroundColor: 'black' }} />
          <View style={{
            flexDirection: 'row'
          }}>
            <View>
              <Text style={{ color: 'black' }}>Tổng tiền: 150.000đ</Text>
              <Text style={{ color: 'black' }}>Quảng đường phát sinh: 2.3km</Text>
              <Text style={{ color: 'black' }}>Độ hiệu quả: 17.000đ/km</Text>
              <Text style={{ color: 'black' }}>Số lượng yêu cầu: 2</Text>
            </View>
            <View style={{
              justifyContent: 'center',
              left: 110,
            }}>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(true);
                }}
                style={{
                  backgroundColor: 'red',
                  padding: 7,
                }}>
                <Text style={{
                  fontSize: fontSizes.h4,
                  color: success
                }}><Icon name="hand-point-right" size={17} /> Chi tiết</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={{
          height: 100,
          //borderWidth: 1,
          backgroundColor: 'white',
          padding: 10,
          justifyContent: 'center',
          marginBottom: 5,
        }}>
          <Text style={{ color: 'black', fontWeight: 'bold' }}>TOP 2</Text>
          <View style={{ height: 1, backgroundColor: 'black' }} />
          <View style={{
            flexDirection: 'row'
          }}>
            <View>
              <Text style={{ color: 'black' }}>Tổng tiền: 80.000đ</Text>
              <Text style={{ color: 'black' }}>Quảng đường phát sinh: 4.3km</Text>
              <Text style={{ color: 'black' }}>Độ hiệu quả: 17.000đ/km</Text>
              <Text style={{ color: 'black' }}>Số lượng yêu cầu: 2</Text>
            </View>
            <View style={{
              justifyContent: 'center',
              left: 110,
            }}>
              <TouchableOpacity style={{
                //backgroundColor:'red',
                padding: 7,
              }}>
                <Text style={{
                  fontSize: fontSizes.h4,
                  color: success
                }}><Icon name="hand-point-right" size={17} /> Chi tiết</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={{
          height: 100,
          //borderWidth: 1,
          backgroundColor: 'white',
          padding: 10,
          justifyContent: 'center',
          marginBottom: 5,
        }}>
          <Text style={{ color: 'black', fontWeight: 'bold' }}>TOP 3</Text>
          <View style={{ height: 1, backgroundColor: 'black' }} />
          <View style={{
            flexDirection: 'row'
          }}>
            <View>
              <Text style={{ color: 'black' }}>Tổng tiền: 50.000đ</Text>
              <Text style={{ color: 'black' }}>Quảng đường phát sinh: 1.7km</Text>
              <Text style={{ color: 'black' }}>Độ hiệu quả: 18.000đ/km</Text>
              <Text style={{ color: 'black' }}>Số lượng yêu cầu: 1</Text>
            </View>
            <View style={{
              justifyContent: 'center',
              left: 110,
            }}>
              <TouchableOpacity style={{
                //backgroundColor:'red',
                padding: 7,
              }}>
                <Text style={{
                  fontSize: fontSizes.h4,
                  color: success
                }}><Icon name="hand-point-right" size={17} /> Chi tiết</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={{
          height: 100,
          //borderWidth: 1,
          backgroundColor: 'white',
          padding: 10,
          justifyContent: 'center',
          marginBottom: 5,
        }}>
          <Text style={{ color: 'black', fontWeight: 'bold' }}></Text>
          <View style={{ height: 1, backgroundColor: 'black' }} />
          <View style={{
            flexDirection: 'row'
          }}>
            <View>
              <Text style={{ color: 'black' }}>Tổng tiền: 43.000đ</Text>
              <Text style={{ color: 'black' }}>Quảng đường phát sinh: 2.9km</Text>
              <Text style={{ color: 'black' }}>Độ hiệu quả: 11.000đ/km</Text>
              <Text style={{ color: 'black' }}>Số lượng yêu cầu: 1</Text>
            </View>
            <View style={{
              justifyContent: 'center',
              left: 110,
            }}>
              <TouchableOpacity style={{
                //backgroundColor:'red',
                padding: 7,
              }}>
                <Text style={{
                  fontSize: fontSizes.h4,
                  color: success
                }}><Icon name="hand-point-right" size={17} /> Chi tiết</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      <Text style={{ color: 'black', alignSelf:'center' }}>Smart Direction</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
      height: normalize(340),
      width: "90%",
      backgroundColor: 'rgba(255,255,255,0.95)',
      alignSelf: 'center',
      padding: split.s4,
      borderWidth: 1,
      borderColor: 'black',
  },
});



export default Test;