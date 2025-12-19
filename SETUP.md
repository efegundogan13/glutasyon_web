# Glutasyon Mobile - Kurulum Talimatları

## Hızlı Başlangıç

### 1. Bağımlılıklar Yüklendi ✅
```bash
npm install  # TAMAMLANDI
```

### 2. Yapılandırma

#### API URL'ini Ayarlayın
`src/config/api.js` dosyasını açın ve backend API URL'inizi güncelleyin:
```javascript
export const API_BASE_URL = 'https://your-backend-api.com/api';
```

#### Google Maps API Key
1. [Google Cloud Console](https://console.cloud.google.com/) üzerinden API key alın
2. `app.json` dosyasında şu satırları güncelleyin:
```json
"ios": {
  "config": {
    "googleMapsApiKey": "YOUR_IOS_API_KEY"
  }
},
"android": {
  "config": {
    "googleMaps": {
      "apiKey": "YOUR_ANDROID_API_KEY"
    }
  }
}
```

#### Asset Dosyaları
`assets/` klasörüne aşağıdaki görselleri ekleyin:
- `icon.png` (1024x1024) - Uygulama ikonu
- `splash.png` (1242x2436) - Açılış ekranı
- `adaptive-icon.png` (1024x1024) - Android adaptif ikon
- `favicon.png` (48x48) - Web favicon

Geçici olarak placeholder görseller kullanabilirsiniz.

### 3. Uygulamayı Çalıştırın

```bash
# Expo sunucusunu başlat
npm start

# QR kod ile telefonunuzda test edin
# veya

# Android emulator
npm run android

# iOS simulator (sadece macOS)
npm run ios
```

### 4. Backend Gereksinimleri

Backend API'nizin aşağıdaki endpoint'leri sağlaması gerekir:

**Authentication:**
- POST `/api/auth/login`
- POST `/api/auth/register`
- POST `/api/auth/verify-email`
- POST `/api/auth/forgot-password`
- POST `/api/auth/reset-password`
- GET `/api/auth/profile`
- PUT `/api/auth/profile`

**Restaurants:**
- GET `/api/restaurants`
- GET `/api/restaurants/:id`
- POST `/api/restaurants/apply`
- GET `/api/restaurants/pending`
- POST `/api/restaurants/:id/approve`
- POST `/api/restaurants/:id/reject`
- DELETE `/api/restaurants/:id`

**Reviews, Favorites, Recipes, Events, Products** endpoint'leri için README.md dosyasına bakın.

### 5. Test Kullanıcıları

Backend'inizde test için şu kullanıcıları oluşturun:

**Ana Admin:**
- Email: admin@glutasyon.com
- Role: admin

**Restoran Yöneticisi:**
- Email: restaurant@test.com
- Role: restaurant_admin
- restaurantId: 1 (onaylanmış bir restoran ID'si)

**Normal Kullanıcı:**
- Email: user@test.com
- Role: user

## Sorun Giderme

### Metro Bundler Hatası
```bash
npx expo start -c  # Cache temizleyerek başlat
```

### iOS Pod Install
```bash
cd ios && pod install && cd ..
```

### Android Build Hatası
Android Studio'da "Build > Clean Project" yapın.

### Harita Görünmüyor
- Google Maps API key'inizi kontrol edin
- API key'in Maps SDK for Android/iOS için etkin olduğundan emin olun

## Önemli Dosyalar

- `App.js` - Ana uygulama giriş noktası
- `src/config/api.js` - API yapılandırması
- `src/navigation/AppNavigator.js` - Navigasyon yapısı
- `src/context/AuthContext.js` - Kimlik doğrulama yönetimi

## Geliştirme İpuçları

1. **Hot Reload:** Kod değişiklikleriniz otomatik olarak uygulamaya yansır
2. **Debug:** Expo Go uygulamasından "Shake" yapıp Developer Menu açabilirsiniz
3. **Console Logs:** `npx expo start` çalışırken terminalde görürsünüz

## Yayınlama

### Android APK
```bash
eas build --platform android
```

### iOS IPA
```bash
eas build --platform ios
```

Detaylı bilgi için: https://docs.expo.dev/build/setup/

## Destek

Sorularınız için GitHub Issues kullanın veya iletişime geçin.
