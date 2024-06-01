import {
  MutableRefObject,
  ReactNode,
  createContext,
  useCallback,
  useRef,
  useState,
} from 'react';
import WebView from 'react-native-webview';

interface WebViewContexType {
  webViewRefs: MutableRefObject<WebView[]>;
  addWebView: (webView: WebView) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

const WebViewContext = createContext<WebViewContexType | undefined>(undefined);

const WebViewProvider = ({children}: {children: ReactNode}) => {
  const webViewRefs = useRef<WebView[]>([]);
  const addWebView = useCallback((webView: WebView) => {
    webViewRefs.current.push(webView);
  }, []);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <WebViewContext.Provider
      value={{
        webViewRefs,
        addWebView,
        isLoggedIn,
        setIsLoggedIn,
      }}>
      {children}
    </WebViewContext.Provider>
  );
};

export {WebViewProvider, WebViewContext};
