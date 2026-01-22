# 🚀 Backend Version Endpoint Kurulumu

## ✅ Durum
- ✅ **Backend Çalışıyor:** https://glutasyon-backend-production.up.railway.app
- ✅ **Restaurants Endpoint:** Çalışıyor (15 restoran)
- ❌ **Version Endpoint:** Henüz eklenmedi

## 📝 Yapılması Gerekenler

### 1. Railway Backend Projesini Aç

Backend projenizin kaynak kodunu açın (GitHub'dan klonlayın veya Railway'den düzenleyin).

### 2. Version Endpoint'ini Ekle

**Dosya:** `backend-endpoint-to-add.js`

Bu dosyada 2 yöntem var:

#### YÖNTEM 1: Ayrı Route Dosyası (Önerilen)
```javascript
// routes/app.js oluşturun
const express = require('express');
const router = express.Router();

router.get('/app/version', (req, res) => {
  res.json({
    latestVersion: '1.0.2',
    updateMessage: 'En son versiyonu kullanıyorsunuz.',
    features: [],
    isForceUpdate: false,
    storeUrl: {
      ios: 'https://apps.apple.com/app/YOUR_APP_ID',
      android: 'https://play.google.com/store/apps/details?id=com.glutasyon.mobile'
    }
  });
});

module.exports = router;

// server.js'de:
app.use('/api', require('./routes/app'));
```

#### YÖNTEM 2: server.js'e Doğrudan Ekle
```javascript
// Diğer route'ların yanına ekleyin:
app.get('/api/app/version', (req, res) => {
  res.json({
    latestVersion: '1.0.2',
    updateMessage: 'En son versiyonu kullanıyorsunuz.',
    features: [],
    isForceUpdate: false
  });
});
```

### 3. Git Push Yap

```bash
git add .
git commit -m "feat: Add app version check endpoint"
git push origin main
```

Railway otomatik deploy edecek (1-2 dakika).

### 4. Test Et

Script ile test et:
```bash
./test-backend-endpoint.sh
```

Veya manuel test:
```bash
curl https://glutasyon-backend-production.up.railway.app/api/app/version
```

Beklenen çıktı:
```json
{
  "latestVersion": "1.0.2",
  "updateMessage": "En son versiyonu kullanıyorsunuz.",
  "features": [],
  "isForceUpdate": false,
  "storeUrl": {
    "ios": "https://apps.apple.com/app/YOUR_APP_ID",
    "android": "https://play.google.com/store/apps/details?id=com.glutasyon.mobile"
  }
}
```

## 🎯 Sonraki Adımlar

### Yeni Versiyon Yayınlarken (örn: v1.0.3)

1. **App tarafında:**
   - `app.json` → `"version": "1.0.3"`
   - `package.json` → `"version": "1.0.3"`
   - `UpdateChecker.js` → `CURRENT_VERSION = '1.0.3'`

2. **Backend'de:**
   ```javascript
   {
     latestVersion: '1.0.3',
     updateMessage: 'Yeni özellikler eklendi!',
     features: [
       '🔍 Geliştirilmiş arama',
       '⚡ Performans iyileştirmeleri',
       '🐛 Hata düzeltmeleri'
     ],
     isForceUpdate: false
   }
   ```

3. **Build ve Deploy:**
   ```bash
   eas build --platform all --profile production
   eas submit --platform all
   ```

4. **Backend'i güncelle** → Kullanıcılar bildirimi görecek!

## 🔧 Troubleshooting

### Endpoint çalışmıyorsa:

1. **Railway Logs'a bak:**
   - Railway Dashboard → Logs
   - Hata mesajlarını kontrol et

2. **Route'ları kontrol et:**
   - `/api/app/version` tam path doğru mu?
   - CORS ayarları yapıldı mı?

3. **Test backend kullan:**
   ```bash
   cd test-backend
   npm install
   npm start
   ```
   
   Sonra `src/config/api.js`'de `isDevelopment = true` yap.

## 📚 Dosyalar

- `backend-endpoint-to-add.js` - Backend'e eklenecek kod
- `test-backend-endpoint.sh` - Test script'i
- `BACKEND_VERSION_SETUP.md` - Detaylı kurulum rehberi
- `test-backend/` - Local test backend

## ✅ Checklist

- [ ] Backend projesini aç
- [ ] Version endpoint'ini ekle
- [ ] Git commit & push yap
- [ ] Railway deploy'u bekle (1-2 dk)
- [ ] `./test-backend-endpoint.sh` ile test et
- [ ] ✅ başarı mesajı gördün mü?
- [ ] Mobile app'i test et (güncelleme modalı görünecek)

---

**Not:** Backend endpoint'i eklenmeden uygulama normal çalışmaya devam eder, sadece güncelleme bildirimi gösterilmez.
