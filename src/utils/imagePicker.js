import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export const pickImage = async () => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri izni gereklidir.');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      return result.assets[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error picking image:', error);
    console.error('Error details:', JSON.stringify(error));
    Alert.alert('Hata', `Fotoğraf seçilirken bir hata oluştu: ${error.message}`);
    return null;
  }
};

export const takePhoto = async () => {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Fotoğraf çekmek için kamera izni gereklidir.');
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      return result.assets[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error taking photo:', error);
    Alert.alert('Hata', 'Fotoğraf çekilirken bir hata oluştu.');
    return null;
  }
};
