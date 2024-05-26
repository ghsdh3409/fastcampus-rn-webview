import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useContext} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import WebView from 'react-native-webview';
import {RootStackParamList} from '../routes';
import {useNavigation} from '@react-navigation/native';
import {WebViewContext} from '../components/WebViewProvider';

const styles = StyleSheet.create({
  safearea: {flex: 1, backgroundColor: 'black'},
});

const LOGIN_URL = 'https://nid.naver.com/nidlogin.login';

type Props = NativeStackNavigationProp<RootStackParamList>;

const LoginScreen = () => {
  const navigation = useNavigation<Props>();
  const context = useContext(WebViewContext);

  return (
    <SafeAreaView style={styles.safearea}>
      <WebView
        source={{uri: LOGIN_URL}}
        onNavigationStateChange={event => {
          if (event.url === 'https://www.naver.com/') {
            if (context?.webViewRefs.current != null) {
              context.webViewRefs.current.forEach(webView => {
                webView.reload();
              });
            }
            navigation.goBack();
          }
        }}
      />
    </SafeAreaView>
  );
};

export default LoginScreen;
