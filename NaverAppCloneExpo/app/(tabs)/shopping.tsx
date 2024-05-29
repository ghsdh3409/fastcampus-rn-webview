import {router} from 'expo-router';
import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

const ShoppingScreen = () => {
  return (
    <View>
      <Text>Shopping</Text>
      <TouchableOpacity
        onPress={() => {
          router.navigate({
            pathname: 'browser',
          });
        }}>
        <Text>Go To Browser</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ShoppingScreen;
