# Production Deployment Guide - Glutasyon

Bu rehber, Glutasyon uygulamasını Google Play Store ve Apple App Store'a yüklemek için adım adım talimatlar içerir.

## 🎯 Ön Gereksinimler

### Hesaplar
1. **Apple Developer Account** ($99/yıl)
   - https://developer.apple.com/programs/

2. **Google Play Console Account** ($25 tek seferlik)
   - https://play.google.com/console

3. **Expo Account** (ücretsiz)
   - https://expo.dev/

### Kurulum
```bash
# Node.js ve npm kurulu olmalı
node --version
npm --version

# Expo CLI kurulumu
npm install -g expo-cli

# EAS CLI kurulumu
npm install -g eas-cli

# Git kurulu olmalı
git --version
```

## 📋 Adım 1: Production Backend Hazırlığı

### 1.1 Backend Deployment
Backend'inizi bir bulut servisine deploy edin:
- **Önerilen**: Render.com, Railway.app, DigitalOcean, AWS
- SSL sertifikası otomatik olmalı (HTTPS)
- PostgreSQL database (Neon veya başka)

### 1.2 Backend URL'sini Kaydedin
Production backend URL'inizi not edin:
```
https://glutasyon-backend.onrender.com
```

### 1.3 Environment Variables Güncelleme
`src/config/api.js` dosyasında production URL'i güncelleyin:
```javascript
export const API_BASE_URL = isDevelopment 
  ? 'http://192.168.1.101:3001/api' 
  : 'https://glutasyon-backend.onrender.com/api'; // Buraya production URL
```

## 📋 Adım 2: Google Maps API Keys

### 2.1 Google Cloud Console'da API Key Oluştur
1. https://console.cloud.google.com/ adresine gidin
2. Yeni proje oluşturun: "Glutasyon-Mobile"
3. **APIs & Services** > **Credentials**
4. **Create Credentials** > **API Key**

### 2.2 iOS için API Key
```bash
# iOS API Key kısıtlamaları:
- Application restrictions: iOS apps
- Bundle ID: com.glutasyon.mobile
- API restrictions: Maps SDK for iOS
```

### 2.3 Android için API Key
```bash
# Android API Key kısıtlamaları:
- Application restrictions: Android apps
- Package name: com.glutasyon.mobile
- SHA-1 fingerprint: (keystore'unuzdan)
- API restrictions: Maps SDK for Android
```

### 2.4 app.json'da Güncelle
```json
{
  "ios": {
    "config": {
      "googleMapsApiKey": "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
    }
  },
  "android": {
    "config": {
      "googleMaps": {
        "apiKey": "AIzaSyYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY"
      }
    }
  }
}
```

## 📋 Adım 3: Expo ve EAS Kurulumu

### 3.1 Expo'ya Login
```bash
npx expo login
# veya
eas login
```

### 3.2 EAS Build Yapılandırma
```bash
cd /Users/efegundogan/Desktop/glutasyon-full
eas build:configure
```

Bu komut otomatik olarak:
- `eas.json` dosyasını oluşturur (zaten oluşturduk)
- Expo project ID alır
- app.json'a extra.eas.projectId ekler

### 3.3 app.json'da Owner Güncelle
```json
{
  "expo": {
    "owner": "your-expo-username",
    "extra": {
      "eas": {
        "projectId": "your-project-id-here"
      }
    }
  }
}
```

## 📋 Adım 4: iOS Build ve Deployment

### 4.1 Apple Developer Portal Ayarları

1. **App ID Oluştur**:
   - https://developer.apple.com/account/resources/identifiers/list
   - Identifier: `com.glutasyon.mobile`
   - Description: Glutasyon
   - Capabilities: Push Notifications, Maps (gerekiyorsa)

2. **App Store Connect'te App Oluştur**:
   - https://appstoreconnect.apple.com/
   - My Apps > + > New App
   - Platform: iOS
   - Name: Glutasyon
   - Bundle ID: com.glutasyon.mobile
   - SKU: glutasyon-mobile-1
   - Language: Turkish

### 4.2 iOS Build Oluştur
```bash
# Production build
eas build --platform ios --profile production

# Build tamamlanana kadar bekleyin (15-30 dakika)
# Build başarılı olursa .ipa dosyası oluşur
```

### 4.3 App Store'a Submit
```bash
# Option 1: EAS Submit (Otomatik)
eas submit --platform ios --latest

# Apple ID ve App-specific password gerekir
# https://appleid.apple.com/ > App-Specific Passwords

# Option 2: Manuel (Transporter App)
# 1. .ipa dosyasını indirin
# 2. Transporter app açın
# 3. .ipa dosyasını sürükle-bırak
# 4. Upload
```

### 4.4 App Store Connect'te Listing Doldur

1. **Genel Bilgiler**:
   - Name: Glutasyon
   - Subtitle: Glütensiz Yaşam Rehberi
   - Privacy Policy URL: https://your-website.com/privacy
   - Category: Food & Drink
   - Age Rating: 4+

2. **Ekran Görüntüleri**:
   - iPhone 6.5": Minimum 3 adet
   - iPhone 5.5": Opsiyonel
   - iPad: Opsiyonel

3. **Description**:
   - STORE_LISTING_GUIDE.md'den kopyalayın

4. **Keywords**:
   - glütensiz,çölyak,glutenfree,celiac,sağlık,yemek,restoran,tarif

5. **Support URL**: https://your-website.com/support

6. **Review Notları**:
```
Demo Hesaplar:
Admin: demo-admin@glutasyon.com / Demo123!
User: demo-user@glutasyon.com / Demo123!

Önemli: E-posta doğrulama sistemi aktiftir.
Test için hazır hesaplar kullanılabilir.
```

7. **Submit for Review** butonuna tıklayın

### 4.5 Review Süreci
- İlk review: 24-48 saat
- Sorun olursa düzeltip tekrar submit
- Onaylandıktan sonra otomatik yayına alınır veya manuel yayın seçebilirsiniz

## 📋 Adım 5: Android Build ve Deployment

### 5.1 Keystore Oluştur

EAS otomatik keystore oluşturur, ancak kendi keystore'unuzu da kullanabilirsiniz:

```bash
# Manuel keystore (opsiyonel)
keytool -genkeypair -v -storetype PKCS12 -keystore glutasyon-upload-key.keystore -alias glutasyon-key -keyalg RSA -keysize 2048 -validity 10000

# Güvenli bir yerde saklayın!
# Şifreleri kaydedin!
```

### 5.2 Android Build Oluştur
```bash
# Production build (AAB - App Bundle)
eas build --platform android --profile production

# Build tamamlanana kadar bekleyin (15-30 dakika)
# Build başarılı olursa .aab dosyası oluşur
```

### 5.3 Google Play Console Ayarları

1. **Google Play Console**:
   - https://play.google.com/console
   - Create App
   - App name: Glutasyon
   - Default language: Turkish
   - App or Game: App
   - Free or Paid: Free

2. **Store Listing**:
   - App name: Glutasyon - Glütensiz Yaşam Platformu
   - Short description: (80 karakter - STORE_LISTING_GUIDE.md'den)
   - Full description: (STORE_LISTING_GUIDE.md'den kopyalayın)
   - App icon: 512x512 PNG
   - Feature graphic: 1024x500 PNG
   - Screenshots: Minimum 4 adet (1080x1920)
   - Category: Food & Drink
   - Tags: glütensiz, çölyak, glutenfree, vs.

3. **Content Rating**:
   - Questionnaire'i doldurun
   - Genellikle "Everyone" olacak

4. **Target Audience**:
   - Age groups: 13+
   - Appeal to children: No

5. **Privacy Policy**:
   - URL: https://your-website.com/privacy (PRIVACY_POLICY.md'yi web'de yayınlayın)

6. **App Access**:
   - All or some functionality is restricted: Yes (Email verification)
   - Demo hesap bilgileri sağlayın

7. **Ads**:
   - No ads

8. **Data Safety**:
   - Collect user data: Yes
   - Data types: Email, Name, Location (optional)
   - Data usage: App functionality
   - Data sharing: No
   - Encryption: Yes (in transit)

### 5.4 Release Oluştur

1. **Production** > **Create new release**

2. **App Bundles**:
```bash
# EAS submit (otomatik)
eas submit --platform android --latest

# Manuel: .aab dosyasını upload edin
```

3. **Release Notes** (TR):
```
İlk sürüm!

✨ Özellikler:
• Glütensiz restoranları keşfedin
• Harita üzerinde yakınınızdaki mekanları görün
• Tarifler paylaşın ve keşfedin
• Kampanyaları takip edin
• Favorilerinizi kaydedin

📱 Güvenli ve kullanıcı dostu arayüz
🔐 E-posta doğrulama sistemi
```

4. **Release Notes** (EN):
```
First release!

✨ Features:
• Discover gluten-free restaurants
• View nearby locations on map
• Share and discover recipes
• Track campaigns
• Save your favorites

📱 Secure and user-friendly interface
🔐 Email verification system
```

5. **Save** > **Review Release**

6. **Start Rollout to Production**

### 5.5 Review Süreci
- İlk review: Birkaç gün sürebilir
- Sorun varsa "Issues" tab'inde görünür
- Onaylandıktan sonra birkaç saat içinde yayına alınır

## 📋 Adım 6: Post-Launch

### 6.1 Monitoring
```bash
# Crash monitoring için Sentry veya Firebase Crashlytics ekleyin
npm install @sentry/react-native

# Analytics için
npm install firebase
# veya
npm install react-native-google-analytics
```

### 6.2 Update Stratejisi
```bash
# Minor updates için version artırın
# app.json:
"version": "1.0.1",
"ios": { "buildNumber": "2" },
"android": { "versionCode": 2 }

# Build ve submit
eas build --platform all --profile production
eas submit --platform all --latest
```

### 6.3 Kullanıcı Geri Bildirimleri
- Store reviews'a düzenli cevap verin
- Bug reports için issue tracker kullanın
- Feature requests toplayın

## 🔧 Troubleshooting

### Build Hataları

**"Google Maps not configured"**:
```bash
# app.json'da API keys'i kontrol edin
# iOS ve Android için ayrı keys olmalı
```

**"Unable to resolve module"**:
```bash
# Dependencies kurulu mu?
npm install
# Cache temizle
npx expo start --clear
```

**"Code signing failed"**:
```bash
# iOS için certificates kontrol edin
# Expo managed workflow kullanıyorsanız otomatik halleder
```

### Submission Hataları

**"Missing required icon sizes"**:
```bash
# app.json'da icon path doğru mu?
"icon": "./assets/glutasyon-logo.png"
# 1024x1024 PNG olmalı
```

**"Privacy policy required"**:
```bash
# PRIVACY_POLICY.md'yi bir web sitesinde yayınlayın
# URL'i app.json ve store listings'e ekleyin
```

## 📱 Demo Hesapları

Review sürecinde kullanılmak üzere demo hesaplar:

```
Admin Hesap:
Email: demo-admin@glutasyon.com
Password: Demo123!

Normal Kullanıcı:
Email: demo-user@glutasyon.com
Password: Demo123!

Restoran Sahibi:
Email: demo-restaurant@glutasyon.com
Password: Demo123!
```

**Önemli**: Backend'de bu hesapları önceden oluşturun ve e-posta doğrulaması yapın!

## ✅ Final Checklist

Yayınlamadan önce son kontrol:

- [ ] Backend production'da çalışıyor
- [ ] HTTPS aktif
- [ ] Database migration yapıldı
- [ ] API keys production için güncellendi
- [ ] app.json'da production URLs
- [ ] Privacy policy ve terms web'de yayında
- [ ] Demo hesaplar oluşturuldu ve test edildi
- [ ] Tüm özellikler test edildi
- [ ] Ekran görüntüleri hazır
- [ ] Store listings dolduruldu
- [ ] App icons doğru boyut ve format
- [ ] Version numbers doğru

## 🎉 Başarıyla Yayınlandı!

Tebrikler! Uygulamanız artık store'larda.

### Sonraki Adımlar:
1. Social media duyurusu yapın
2. Kullanıcı feedback'i toplayın
3. Analytics'i takip edin
4. İlk güncellemeleri planlayın
5. Marketing stratejisi uygulayın

### Faydalı Linkler:
- [Expo EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [Expo EAS Submit Docs](https://docs.expo.dev/submit/introduction/)
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)

---

**İyi şanslar! 🚀**
