import React, {useCallback, useRef, useState} from 'react';
import {
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AudioRecorderPlayer, {
  AVEncodingOption,
  OutputFormatAndroidType,
} from 'react-native-audio-recorder-player';
import WebView from 'react-native-webview';
import Permission from 'react-native-permissions';
import RNFS from 'react-native-fs';
import {Camera, useCameraDevice} from 'react-native-vision-camera';

const styles = StyleSheet.create({
  safearea: {
    flex: 1,
  },
  camera: {
    backgroundColor: 'black',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  cameraCloseButton: {
    position: 'absolute',
    top: 60,
    right: 20,
  },
  cameraCloseText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cameraPhotoButton: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 80 / 2,
    bottom: 60,
    backgroundColor: 'white',
    alignSelf: 'center',
  },
});

const App = () => {
  const webViewRef = useRef<WebView | null>(null);
  const audioRecorderPlayerRef = useRef(new AudioRecorderPlayer());
  const device = useCameraDevice('back');
  const cameraRef = useRef<Camera>(null);

  const [isCameraOn, setIsCameraOn] = useState(false);

  const sendMessageToWebview = useCallback(
    ({type, data}: {type: string; data?: any}) => {
      const message = JSON.stringify({type, data});
      webViewRef.current?.postMessage(message);
    },
    [],
  );

  const startRecord = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
        const grants = await Permission.requestMultiple([
          Permission.PERMISSIONS.ANDROID.RECORD_AUDIO,
        ]);

        console.log('write external storage', grants);

        if (
          grants[Permission.PERMISSIONS.ANDROID.RECORD_AUDIO] ===
          Permission.RESULTS.GRANTED
        ) {
          console.log('Permissions granted');
        } else {
          console.log('All required permissions not granted');
          return;
        }
      } catch (err) {
        console.warn(err);
        return;
      }
    }

    await audioRecorderPlayerRef.current.startRecorder(undefined, {
      AVFormatIDKeyIOS: AVEncodingOption.mp4,
      OutputFormatAndroid: OutputFormatAndroidType.MPEG_4,
    });

    sendMessageToWebview({type: 'onStartRecord'});
  }, [sendMessageToWebview]);

  const stopRecord = useCallback(async () => {
    const filePath = await audioRecorderPlayerRef.current.stopRecorder();
    const ext = filePath.split('.').pop();
    const base64audio = await RNFS.readFile(filePath, 'base64');

    sendMessageToWebview({
      type: 'onStopRecord',
      data: {
        audio: base64audio,
        mimeType: 'audio/mp4',
        ext,
      },
    });
  }, [sendMessageToWebview]);

  const pauseRecord = useCallback(async () => {
    await audioRecorderPlayerRef.current.pauseRecorder();
    sendMessageToWebview({type: 'onPauseRecord'});
  }, [sendMessageToWebview]);

  const resumeRecord = useCallback(async () => {
    await audioRecorderPlayerRef.current.resumeRecorder();
    sendMessageToWebview({type: 'onResumeRecord'});
  }, [sendMessageToWebview]);

  const openCamera = useCallback(async () => {
    const permission = await Camera.requestCameraPermission();
    if (permission === 'granted') {
      setIsCameraOn(true);
    }
  }, []);

  const closeCamera = useCallback(() => {
    setIsCameraOn(false);
  }, []);
  const onPressPhotoButton = useCallback(async () => {
    const file = await cameraRef.current?.takePhoto({
      flash: 'off',
    });
    console.log('file', file);
    if (file != null) {
      const base64Image = await RNFS.readFile(file.path, 'base64');
      const imageDataUrl = `data:image/jpeg;base64,${base64Image}`;
      sendMessageToWebview({
        type: 'onTakePhoto',
        data: imageDataUrl,
      });
    }
  }, [sendMessageToWebview]);

  return (
    <SafeAreaView style={styles.safearea}>
      <WebView
        ref={webViewRef}
        source={{
          uri:
            Platform.OS === 'android'
              ? 'http://10.0.2.2:3000'
              : 'http://localhost:3000',
        }}
        onMessage={event => {
          console.log(event.nativeEvent.data);
          const {type} = JSON.parse(event.nativeEvent.data);
          if (type === 'start-record') {
            startRecord();
          } else if (type === 'stop-record') {
            stopRecord();
          } else if (type === 'pause-record') {
            pauseRecord();
          } else if (type === 'resume-record') {
            resumeRecord();
          } else if (type === 'open-camera') {
            openCamera();
          }
        }}
        webviewDebuggingEnabled
      />
      {isCameraOn && device != null && (
        <View style={styles.camera}>
          <Camera
            ref={cameraRef}
            device={device}
            photo
            isActive
            photoQualityBalance="speed"
            style={StyleSheet.absoluteFill}
          />
          <TouchableOpacity
            style={styles.cameraCloseButton}
            onPress={closeCamera}>
            <Text style={styles.cameraCloseText}>CLOSE</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cameraPhotoButton}
            onPress={onPressPhotoButton}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default App;
