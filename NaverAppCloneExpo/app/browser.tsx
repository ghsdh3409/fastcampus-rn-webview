import {router, useLocalSearchParams} from 'expo-router';
import React, {useContext, useMemo, useRef, useState} from 'react';
import {
  Animated,
  Platform,
  SafeAreaView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import WebView from 'react-native-webview';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {WebViewContext} from '../components/WebViewProvider';

const styles = StyleSheet.create({
  safearea: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    flex: 1,
    backgroundColor: 'black',
  },
  urlContainer: {
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  urlText: {
    color: 'white',
  },
  loadingBarBackground: {
    height: 3,
    backgroundColor: 'white',
  },
  loadingBar: {
    height: '100%',
    backgroundColor: 'green',
  },
  navigator: {
    backgroundColor: 'black',
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 40,
    justifyContent: 'space-between',
  },
  button: {
    width: 30,
    height: 30,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  naverIconOutline: {
    borderWidth: 1,
    borderColor: 'white',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  naverIconText: {
    color: 'white',
  },
});

const NavButton = ({
  iconName,
  disabled,
  onPress,
}: {
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  disabled?: boolean;
  onPress?: () => void;
}) => {
  const color = disabled ? 'gray' : 'white';
  return (
    <TouchableOpacity
      style={styles.button}
      disabled={disabled}
      onPress={onPress}>
      <MaterialCommunityIcons name={iconName} color={color} size={24} />
    </TouchableOpacity>
  );
};

const BrowserScreen = () => {
  const context = useContext(WebViewContext);
  const params = useLocalSearchParams();
  const initialUrl = params.initialUrl as string;
  const [url, setUrl] = useState(initialUrl);
  const urlTitle = useMemo(
    () => url.replace('https://', '').split('/')[0],
    [url],
  );

  const progressAnim = useRef(new Animated.Value(0)).current;

  const webViewRef = useRef<WebView | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const DISABLE_PINCH_ZOOM = `(function() {
    const meta = document.createElement('meta');
    meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
    meta.setAttribute('name', 'viewport');
    document.getElementsByTagName('head')[0].appendChild(meta);

    document.body.style['user-select'] = 'none';
    document.body.style['-webkit-user-select'] = 'none';
  })();`;

  return (
    <SafeAreaView style={styles.safearea}>
      <View style={styles.urlContainer}>
        <Text style={styles.urlText}>{urlTitle}</Text>
      </View>
      <View style={styles.loadingBarBackground}>
        <Animated.View
          style={[
            styles.loadingBar,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      <WebView
        ref={ref => {
          webViewRef.current = ref;
          if (ref != null) {
            context?.addWebView(ref);
          }
        }}
        source={{uri: initialUrl}}
        onNavigationStateChange={event => {
          setUrl(event.url);
          setCanGoBack(event.canGoBack);
          setCanGoForward(event.canGoForward);
        }}
        onLoadProgress={event => {
          progressAnim.setValue(event.nativeEvent.progress);
        }}
        onLoadEnd={() => {
          progressAnim.setValue(0);
        }}
        injectedJavaScript={DISABLE_PINCH_ZOOM}
        onMessage={() => {}}
        allowsLinkPreview={false}
      />
      <View style={styles.navigator}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            router.back();
          }}>
          <View style={styles.naverIconOutline}>
            <Text style={styles.naverIconText}>N</Text>
          </View>
        </TouchableOpacity>
        <NavButton
          iconName="arrow-left"
          disabled={!canGoBack}
          onPress={() => {
            webViewRef.current?.goBack();
          }}
        />
        <NavButton
          iconName="arrow-right"
          disabled={!canGoForward}
          onPress={() => {
            webViewRef.current?.goForward();
          }}
        />
        <NavButton
          iconName="refresh"
          onPress={() => {
            webViewRef.current?.reload();
          }}
        />
        <NavButton
          iconName="share-outline"
          onPress={() => {
            Share.share({message: url});
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default BrowserScreen;
