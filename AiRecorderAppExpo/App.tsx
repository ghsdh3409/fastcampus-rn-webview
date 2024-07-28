import React, {useCallback, useRef, useState} from 'react';
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import WebView from 'react-native-webview';
import {Audio} from 'expo-av';
import {RecordingOptionsPresets} from 'expo-av/build/Audio';
import * as FileSystem from 'expo-file-system';
import {CameraView, useCameraPermissions} from 'expo-camera';

const styles = StyleSheet.create({
  safearea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
  const [audioPermissionResponse, requestAudioPermission] =
    Audio.usePermissions();
  const [recording, setRecording] = useState<Audio.Recording | null>();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [isCameraOn, setIsCameraOn] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const sendMessageToWebview = useCallback(
    ({type, data}: {type: string; data?: any}) => {
      const message = JSON.stringify({type, data});
      webViewRef.current?.postMessage(message);
    },
    [],
  );

  const startRecord = useCallback(async () => {
    const response = await requestAudioPermission();
    if (!response.granted) {
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const {recording} = await Audio.Recording.createAsync(
      RecordingOptionsPresets.HIGH_QUALITY,
    );
    setRecording(recording);

    sendMessageToWebview({type: 'onStartRecord'});
  }, [requestAudioPermission, sendMessageToWebview]);

  const stopRecord = useCallback(async () => {
    if (recording != null) {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      const filePath = recording.getURI();

      if (filePath != null) {
        const ext = filePath.split('.').pop();
        const base64audio = await FileSystem.readAsStringAsync(filePath, {
          encoding: FileSystem.EncodingType.Base64,
        });
        sendMessageToWebview({
          type: 'onStopRecord',
          data: {
            audio: base64audio,
            mimeType: 'audio/mp4',
            ext,
          },
        });
      }
      setRecording(null);
    }
  }, [recording, sendMessageToWebview]);

  const pauseRecord = useCallback(async () => {
    if (recording != null) {
      await recording.pauseAsync();
      sendMessageToWebview({type: 'onPauseRecord'});
    }
  }, [recording, sendMessageToWebview]);

  const resumeRecord = useCallback(async () => {
    if (recording != null) {
      await recording.startAsync();
    }
    sendMessageToWebview({type: 'onResumeRecord'});
  }, [recording, sendMessageToWebview]);

  const openCamera = useCallback(async () => {
    const response = await requestCameraPermission();
    if (response.granted) {
      setIsCameraOn(true);
    }
  }, [requestCameraPermission]);

  const closeCamera = useCallback(() => {
    setIsCameraOn(false);
  }, []);

  const onPressPhotoButton = useCallback(async () => {
    const picture = await cameraRef.current?.takePictureAsync({quality: 0});
    if (picture?.uri != null) {
      const base64Image = await FileSystem.readAsStringAsync(picture.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
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
      />
      {isCameraOn && (
        <View style={styles.camera}>
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing={'back'}>
            <TouchableOpacity
              style={styles.cameraCloseButton}
              onPress={closeCamera}>
              <Text style={styles.cameraCloseText}>CLOSE</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cameraPhotoButton}
              onPress={onPressPhotoButton}
            />
          </CameraView>
        </View>
      )}
    </SafeAreaView>
  );
};

export default App;
