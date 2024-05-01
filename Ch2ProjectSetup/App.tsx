import React from 'react';
import {WebView} from 'react-native-webview';

const App = () => {
  return <WebView source={{uri: 'https://fastcampus.co.kr/'}} />;

  /* Static Html
  return (
    <WebView
      source={{html: '<h1>Hello WebView!</h1>'}}
      originWhitelist={['*']}
    />
  );
  */
};

export default App;
