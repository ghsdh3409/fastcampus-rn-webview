import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
});

const UpdateScreen = () => {
  const isVisible = true;

  if (isVisible) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Updating...</Text>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return null;
};

export default UpdateScreen;
