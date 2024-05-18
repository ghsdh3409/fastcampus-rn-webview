import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useMemo, useRef, useState} from 'react';
import {
  Animated,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import WebView from 'react-native-webview';
import {RootStackParamList} from '../routes';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = NativeStackScreenProps<RootStackParamList, 'browser'>;

const styles = StyleSheet.create({
  safearea: {flex: 1, backgroundColor: 'black'},
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
  iconName: string;
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

const BrowserScreen = ({route, navigation}: Props) => {
  const {initialUrl} = route.params;
  const [url, setUrl] = useState(initialUrl);
  const urlTitle = useMemo(
    () => url.replace('https://', '').split('/')[0],
    [url],
  );

  const progressAnim = useRef(new Animated.Value(0)).current;

  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

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
        ref={webViewRef}
        source={{uri: initialUrl}}
        onNavigationStateChange={event => {
          setCanGoBack(event.canGoBack);
          setCanGoForward(event.canGoForward);
          setUrl(event.url);
        }}
        onLoadProgress={event => {
          console.log(event.nativeEvent.progress);
          progressAnim.setValue(event.nativeEvent.progress);
        }}
        onLoadEnd={() => {
          progressAnim.setValue(0);
        }}
      />
      <View style={styles.navigator}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            navigation.goBack();
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
      </View>
    </SafeAreaView>
  );
};

export default BrowserScreen;
