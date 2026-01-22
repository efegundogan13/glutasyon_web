// Versiyon kontrolünü sıfırla (test için)
// Expo Go uygulamasında şu kodu çalıştır:

import AsyncStorage from '@react-native-async-storage/async-storage';

AsyncStorage.removeItem('@app_version_dismissed').then(() => {
  console.log('✅ Versiyon kontrolü sıfırlandı!');
});

// Veya App.js'e geçici olarak ekle:
// useEffect(() => {
//   AsyncStorage.removeItem('@app_version_dismissed');
// }, []);
