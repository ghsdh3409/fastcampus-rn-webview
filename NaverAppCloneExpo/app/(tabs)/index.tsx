import {router} from 'expo-router';
import React, {useContext, useRef, useState} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import WebView from 'react-native-webview';
import {WebViewContext} from '../../components/WebViewProvider';
import useLogin from '../../hooks/useLogin';
import {useBackHandler} from '@react-native-community/hooks';

const styles = StyleSheet.create({
  safearea: {
    flex: 1,
  },
});

const HomeScreen = () => {
  const context = useContext(WebViewContext);
  const {loadLoggedIn, onMessage} = useLogin();

  const webViewRef = useRef<WebView | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);

  useBackHandler(() => {
    if (canGoBack && webViewRef.current != null) {
      webViewRef.current.goBack();
      return true;
    }
    return false;
  });

  return (
    <SafeAreaView style={styles.safearea}>
      <WebView
        ref={ref => {
          if (ref != null) {
            context?.addWebView(ref);
          }
          webViewRef.current = ref;
        }}
        source={{uri: 'https://m.naver.com'}}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        onShouldStartLoadWithRequest={request => {
          console.log('Home - request', request);

          if (
            request.url.startsWith('https://m.naver.com') ||
            request.mainDocumentURL?.startsWith('https://m.naver.com')
          ) {
            return true;
          }

          if (request.url != null && request.url.startsWith('https://')) {
            router.navigate({
              pathname: 'browser',
              params: {initialUrl: request.url},
            });
            return false;
          }

          return true;
        }}
        onLoadEnd={() => {
          loadLoggedIn();
        }}
        onMessage={onMessage}
        onNavigationStateChange={event => {
          setCanGoBack(event.canGoBack);
        }}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;
