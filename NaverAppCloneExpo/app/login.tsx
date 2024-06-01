import {router} from 'expo-router';
import {useContext} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import WebView from 'react-native-webview';
import {WebViewContext} from '../components/WebViewProvider';

const styles = StyleSheet.create({
  safearea: {
    flex: 1,
  },
});

const LOGIN_URL = 'https://nid.naver.com/nidlogin.login';

const LoginScreen = () => {
  const context = useContext(WebViewContext);
  return (
    <SafeAreaView style={styles.safearea}>
      <WebView
        source={{uri: LOGIN_URL}}
        onNavigationStateChange={event => {
          if (event.url === 'https://www.naver.com/') {
            // TODO: webview refresh

            if (context?.webViewRefs != null) {
              context.webViewRefs.current.forEach(webView => {
                webView.reload();
              });
            }

            router.back();
          }
        }}
      />
    </SafeAreaView>
  );
};

export default LoginScreen;
