import { showMessage } from 'react-native-flash-message'

export const FlashMessage = (props) => {
  showMessage({
    message: props.message,
    hideOnPress: false,
    onPress: props.onPress,
    duration: 1500
  })
}

