import BackgroundGeolocation from 'react-native-background-geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage'

class LocationService {

  constructor() {
    BackgroundGeolocation.ready({
      desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
      stationaryRadius: 100,
      distanceFilter: 100,
      stopTimeout: 5,
      notification: {
        title: 'TIPGOGO tracking location!',
        text: 'enabled',
      },
      debug: true,
      startOnBoot: false,
      stopOnTerminate: true,
      locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
      interval: 10000,
      fastestInterval: 5000,
      activitiesInterval: 10000,
      stopOnStillActivity: false,
    }).then((state) => {
      //console.log('[BackgroundGeolocation] Ready with state:', state);
    }).catch((error) => {
      //console.log('[BackgroundGeolocation] Error:', error);
    });


    BackgroundGeolocation.onLocation((location) => {
      //console.log('[onLocation]', location);
      const latitude = location.coords.latitude;
      const longitude = location.coords.longitude;
      AsyncStorage.setItem('currentLocation', JSON.stringify({ latitude, longitude }));
      console.log(`Tracking Updated current location to AsyncStorage! ${latitude}-${longitude}`);
      
    }, (error) => {
      console.log('[onLocation] ERROR:', error);
    })
    // BackgroundGeolocation.onMotionChange((event) => {
    //   //console.log('[onMotionChange]', event);
    // })
    // BackgroundGeolocation.onActivityChange((event) => {
    //   //console.log('[onActivityChange]', event);
    // })
    // BackgroundGeolocation.onProviderChange((event) => {
    //   console.log('[onProviderChange]', event);
    // })

  }

  start() {
    BackgroundGeolocation.start();
    console.log(">>>>>>>>>>>>>>[Tracking start!]<<<<<<<<<<<<<<")
  }

  stop() {
    BackgroundGeolocation.stop();
    console.log(">>>>>>>>>>>>>>[Tracking stop!]<<<<<<<<<<<<<<")
  }


}

export default new LocationService();
