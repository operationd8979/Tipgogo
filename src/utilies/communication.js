import Communications from 'react-native-communications';

const phonecall = (phoneNumber) => {
    Communications.phonecall(phoneNumber,true)
};


const sendSMS = (phoneNumber,message) => {
  Communications.textWithoutEncoding(phoneNumber, message)
};

export {
    phonecall,
    sendSMS,
}