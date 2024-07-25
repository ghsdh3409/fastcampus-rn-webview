import React, {useCallback, useRef} from 'react';
import {Platform, SafeAreaView, StyleSheet} from 'react-native';
import AudioRecorderPlayer, {
  AVEncodingOption,
  OutputFormatAndroidType,
} from 'react-native-audio-recorder-player';
import WebView from 'react-native-webview';
import Permission from 'react-native-permissions';
import RNFS from 'react-native-fs';

const styles = StyleSheet.create({
  safearea: {
    flex: 1,
  },
});

const App = () => {
  const webViewRef = useRef<WebView | null>(null);
  const audioRecorderPlayerRef = useRef(new AudioRecorderPlayer());

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
          }
        }}
        webviewDebuggingEnabled
      />
    </SafeAreaView>
  );
};

export default App;
