import {useCallback, useContext} from 'react';
import {WebViewContext} from '../components/WebViewProvider';
import {WebViewMessageEvent} from 'react-native-webview';

const useLogin = () => {
  const context = useContext(WebViewContext);

  const loadLoggedIn = useCallback(() => {
    context?.webViewRefs.current.forEach(webView => {
      webView.injectJavaScript(`
        (function() {
            window.ReactNativeWebView.postMessage(document.cookie);
        })();
      `);
    });
  }, [context]);

  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      console.log(event.nativeEvent.data);
      const cookieString = event.nativeEvent.data;
      context?.setIsLoggedIn(cookieString.includes('NID_SES'));
    },
    [context],
  );

  const logout = useCallback(() => {
    context?.webViewRefs.current.forEach(webView => {
      webView.injectJavaScript(`
          (function() {
            document.cookie = 'NID_SES=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.naver.com';
            window.ReactNativeWebView.postMessage(document.cookie);
          })();
        `);
    });
    context?.setIsLoggedIn(false);
    if (context?.webViewRefs != null) {
      context.webViewRefs.current.forEach(webView => {
        webView.reload();
      });
    }
  }, [context]);

  return {
    loadLoggedIn,
    onMessage,
    isLoggedIn: context?.isLoggedIn === true,
    logout,
  };
};

export default useLogin;
