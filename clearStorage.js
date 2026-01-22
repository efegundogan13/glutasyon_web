import AsyncStorage from '@react-native-async-storage/async-storage';

async function clearStorage() {
  try {
    await AsyncStorage.clear();
    console.log('✅ AsyncStorage temizlendi!');
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

clearStorage();
