import {useCallback, useEffect, useState} from 'react';
import * as Updates from 'expo-updates';
import {Alert} from 'react-native';

const useEASUpdate = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  const downloadUpdate = useCallback(async () => {
    const update = await Updates.fetchUpdateAsync();
    if (update.isNew) {
      await Updates.reloadAsync();
    }
  }, []);

  const checkForUpdates = useCallback(async () => {
    try {
      setIsLoading(true);
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        setUpdateAvailable(true);
        await downloadUpdate();
      }
    } catch (error: any) {
      Alert.alert(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [downloadUpdate]);

  useEffect(() => {
    if (!__DEV__) {
      checkForUpdates();
    }
  }, [checkForUpdates]);

  return {
    isLoading,
    updateAvailable,
  };
};

export default useEASUpdate;
