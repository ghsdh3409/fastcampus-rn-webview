import {PermissionsAndroid, Platform} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import {useEffect, useState} from 'react';

const requestIosPermission = async () => {
  const status = await messaging().requestPermission();
  const enabled =
    status === messaging.AuthorizationStatus.AUTHORIZED ||
    status === messaging.AuthorizationStatus.PROVISIONAL;
  return enabled;
};

const requestAndroidPermission = async () => {
  if (Number(Platform.Version) < 33) {
    // Checking your code in API level 33 (Android 13). It might return 'never_ask_again' under Android 13.
    return true;
  }

  const status = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );
  const enabled = status === 'granted';
  return enabled;
};

const registerForPushNotificationsAsync = async () => {
  const enabled =
    Platform.OS === 'ios'
      ? await requestIosPermission()
      : await requestAndroidPermission();

  if (enabled) {
    const token = await messaging().getToken();
    return token;
  }
  return null;
};

const usePushNotification = () => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setFcmToken(token));
  }, []);

  console.log('fcmToken', Platform.OS, fcmToken);

  return {
    fcmToken: fcmToken,
  };
};

export default usePushNotification;
