import React, {useCallback, useRef, useState} from 'react';
import {Platform, SafeAreaView, StatusBar, StyleSheet} from 'react-native';
import WebView from 'react-native-webview';
import {Audio} from 'expo-av';
import {RecordingOptionsPresets} from 'expo-av/build/Audio';
import * as FileSystem from 'expo-file-system';

const styles = StyleSheet.create({
  safearea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
});

const App = () => {
  const webViewRef = useRef<WebView | null>(null);
  const [audioPermissionResponse, requestAudioPermission] =
    Audio.usePermissions();
  const [recording, setRecording] = useState<Audio.Recording | null>();

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
          }
        }}
      />
    </SafeAreaView>
  );
};

export default App;
