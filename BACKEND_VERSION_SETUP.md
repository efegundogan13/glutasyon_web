# 📦 Backend Version Check Setup

## 🎯 Amaç
Kullanıcılara yeni uygulama versiyonlarını bildirmek için backend'de `/api/app/version` endpoint'i oluşturulmalıdır.

## 🚀 Backend Kurulumu (Railway/Express)

### 1. Endpoint Ekle

Backend projenize şu endpoint'i ekleyin:

```javascript
// routes/app.js veya server.js
const express = require('express');
const router = express.Router();

// Version check endpoint
router.get('/app/version', (req, res) => {
  res.json({
    latestVersion: '1.0.2',
    updateMessage: 'Glutasyon uygulamasının en son versiyonunu kullanıyorsunuz.',
    features: [],
    isForceUpdate: false,
    storeUrl: {
      ios: 'https://apps.apple.com/app/YOUR_APP_ID',
      android: 'https://play.google.com/store/apps/details?id=com.glutasyon.mobile'
    }
  });
});

module.exports = router;

// server.js'de kullan:
// app.use('/api', require('./routes/app'));
```

### 2. İlk Yayın (v1.0.2)

App Store ve Google Play'e ilk versiyonu yükledikten sonra:

```javascript
{
  "latestVersion": "1.0.2",
  "updateMessage": "Glutasyon uygulamasını kullanmaya başladınız!",
  "features": [],
  "isForceUpdate": false
}
```

### 3. Yeni Versiyon Yayınlarken (örn: v1.0.3)

Yeni build yayınladığınızda backend'i güncelleyin:

```javascript
{
  "latestVersion": "1.0.3",
  "updateMessage": "Yeni özellikler ve iyileştirmeler!",
  "features": [
    "🔍 Geliştirilmiş arama özelliği",
    "📍 Daha hızlı konum tespiti",
    "⚡ Performans iyileştirmeleri",
    "🐛 Hata düzeltmeleri"
  ],
  "isForceUpdate": false
}
```

## 📱 Güncelleme Süreci

### Normal Güncelleme (isForceUpdate: false)
```
1. Kullanıcı uygulamayı açar
2. UpdateChecker API'yi kontrol eder (24 saatte bir)
3. Yeni versiyon varsa modal gösterir
4. "Şimdi Güncelle" → App Store'a yönlendirir
5. "Daha Sonra" → Modal kapanır, 24 saat sonra tekrar sorar
```

### Zorunlu Güncelleme (isForceUpdate: true)
```javascript
{
  "latestVersion": "2.0.0",
  "updateMessage": "Güvenlik güncellemesi - Güncelleme zorunlu!",
  "features": ["🔒 Kritik güvenlik düzeltmeleri"],
  "isForceUpdate": true // "Daha Sonra" butonu gizlenir
}
```

## 🎨 Store URL'lerini Güncelleme

App Store ve Play Store yayınlandıktan sonra:

```javascript
storeUrl: {
  ios: 'https://apps.apple.com/tr/app/glutasyon/id1234567890',
  android: 'https://play.google.com/store/apps/details?id=com.glutasyon.mobile'
}
```

## 🧪 Test Etmek İçin

1. **Local test backend:**
   ```bash
   cd test-backend
   npm install
   npm start
   ```

2. **api.js'de isDevelopment = true yap:**
   ```javascript
   const isDevelopment = true;
   ```

3. **UpdateChecker.js'de CURRENT_VERSION düşür:**
   ```javascript
   const CURRENT_VERSION = '0.9.0';
   ```

4. Uygulamayı reload et (r)

## 📊 Version Mantığı

```
CURRENT_VERSION = '1.0.2'  (Uygulama)
latestVersion = '1.0.3'    (Backend)

compareVersions('1.0.3', '1.0.2') > 0 → Modal göster!
compareVersions('1.0.2', '1.0.2') = 0 → Modal gösterme
compareVersions('1.0.1', '1.0.2') < 0 → Modal gösterme
```

## 🔄 Güncelleme Checklist

- [ ] Backend'e `/api/app/version` endpoint'i ekle
- [ ] İlk versiyonu (1.0.2) backend'e kaydet
- [ ] Store URL'lerini gerçek linklerle değiştir
- [ ] Test et (local backend ile)
- [ ] Production'a deploy et
- [ ] İlk kullanıcı geri bildirimlerini kontrol et

## 🚨 Önemli Notlar

1. **Version format:** Semantic versioning kullan (MAJOR.MINOR.PATCH)
   - MAJOR: Büyük değişiklikler (2.0.0)
   - MINOR: Yeni özellikler (1.1.0)
   - PATCH: Hata düzeltmeleri (1.0.3)

2. **24 saat kontrolü:** Her açılışta değil, 24 saatte bir kontrol edilir

3. **Backend yoksa:** Uygulama normal çalışmaya devam eder, hata vermez

4. **AsyncStorage:** Kullanıcı seçimleri cihazda saklanır

## 📞 Destek

Sorun yaşarsanız:
- UpdateChecker.js'deki console.log'ları kontrol edin
- Backend endpoint'inin yanıt verdiğini test edin
- Version formatının doğru olduğunu kontrol edin

---

**Hazırlayan:** Glutasyon Development Team
**Son Güncelleme:** 22 Ocak 2026
