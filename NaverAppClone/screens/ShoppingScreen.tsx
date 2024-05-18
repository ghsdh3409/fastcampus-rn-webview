import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {RootStackParamList, RouteNames} from '../routes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = NativeStackScreenProps<RootStackParamList>;

const ShoppingScreen = ({navigation}: Props) => {
  return (
    <View>
      <Text>Shopping</Text>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate(RouteNames.BROWSER, {
            initialUrl: 'https://m.naver.com',
          });
        }}>
        <Text>Go To Browser</Text>
      </TouchableOpacity>
      <MaterialCommunityIcons name="shopping" size={200} color={'red'} />
    </View>
  );
};

export default ShoppingScreen;
