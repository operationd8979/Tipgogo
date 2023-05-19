import react from 'react'
import {View} from 'react-native'
import QRCode from 'react-native-qrcode-svg';

const Test = () =>{
  return <View style={{backgroundColor:'white',height:200,justifyContent:'center',alignItems:'center'}}>
    <QRCode 
      value="http://awesome.link.qr"
   />
  </View>
}
export default Test;
