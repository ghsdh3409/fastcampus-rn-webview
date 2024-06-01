import React, {useCallback, useEffect, useState} from 'react';
import {TouchableOpacity} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {router, useFocusEffect} from 'expo-router';
import useLogin from '../hooks/useLogin';

const LoginButton = () => {
  const {isLoggedIn, loadLoggedIn, logout} = useLogin();
  const iconName = isLoggedIn ? 'logout' : 'login';

  const [isFocused, setIsFocused] = useState(false);
  useFocusEffect(() => {
    setIsFocused(true);
    return () => {
      setIsFocused(false);
    };
  });

  useEffect(() => {
    if (isFocused) {
      loadLoggedIn();
    }
  }, [isFocused, loadLoggedIn]);

  const onPressLogin = useCallback(() => {
    router.navigate({pathname: 'login'});
  }, []);
  const onPressLogout = useCallback(() => {
    logout();
  }, [logout]);

  return (
    <TouchableOpacity onPress={isLoggedIn ? onPressLogout : onPressLogin}>
      <MaterialCommunityIcons name={iconName} color="white" size={24} />
    </TouchableOpacity>
  );
};

export default LoginButton;
