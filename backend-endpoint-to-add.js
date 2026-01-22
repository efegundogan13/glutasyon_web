// ============================================
// 📦 BACKEND'E EKLENMESİ GEREKEN ENDPOINT
// ============================================
// Railway backend projesine bu endpoint'i ekleyin
// https://glutasyon-backend-production.up.railway.app

// ============================================
// YÖNTEM 1: Ayrı Route Dosyası (Önerilen)
// ============================================
// Dosya: routes/app.js

const express = require('express');
const router = express.Router();

/**
 * @route   GET /api/app/version
 * @desc    Uygulama versiyon kontrolü
 * @access  Public
 */
router.get('/app/version', (req, res) => {
  try {
    const versionInfo = {
      latestVersion: '1.0.2',
      updateMessage: 'Glutasyon uygulamasının en son versiyonunu kullanıyorsunuz.',
      features: [],
      isForceUpdate: false,
      storeUrl: {
        ios: 'https://apps.apple.com/app/YOUR_APP_ID', // App Store yayınlandıktan sonra gerçek URL
        android: 'https://play.google.com/store/apps/details?id=com.glutasyon.mobile'
      }
    };

    res.json(versionInfo);
  } catch (error) {
    console.error('Version check error:', error);
    res.status(500).json({
      error: 'Versiyon kontrolü sırasında hata oluştu'
    });
  }
});

module.exports = router;

// ============================================
// YÖNTEM 2: Doğrudan server.js'e Ekleme
// ============================================
// server.js veya index.js dosyasına ekleyin:

/*
// Version check endpoint
app.get('/api/app/version', (req, res) => {
  try {
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
  } catch (error) {
    console.error('Version check error:', error);
    res.status(500).json({ error: 'Versiyon kontrolü başarısız' });
  }
});
*/

// ============================================
// KULLANIM TALİMATLARI
// ============================================

/*
1. Railway backend projesini klonlayın veya açın

2. YÖNTEM 1 İÇİN:
   - routes/ klasöründe app.js dosyası oluşturun
   - Yukarıdaki router kodunu ekleyin
   - server.js'de route'u kullanın:
     app.use('/api', require('./routes/app'));

3. YÖNTEM 2 İÇİN:
   - server.js veya index.js'i açın
   - Diğer route'ların yanına endpoint'i ekleyin

4. Commit ve push yapın:
   git add .
   git commit -m "feat: Add app version check endpoint"
   git push origin main

5. Railway otomatik deploy edecek

6. Test edin:
   curl https://glutasyon-backend-production.up.railway.app/api/app/version
*/

// ============================================
// YENİ VERSİYON YAYINLARKEN
// ============================================

/*
Örnek: v1.0.3 yayınladığınızda backend'i güncelleyin:

{
  latestVersion: '1.0.3',
  updateMessage: 'Yeni özellikler ve iyileştirmeler!',
  features: [
    '🔍 Geliştirilmiş arama özelliği',
    '📍 Daha hızlı konum tespiti',
    '⚡ Performans iyileştirmeleri',
    '🐛 Hata düzeltmeleri'
  ],
  isForceUpdate: false // Zorunlu güncelleme için true yapın
}

ZORUNLU GÜNCELLEME İÇİN:
{
  latestVersion: '2.0.0',
  updateMessage: 'Kritik güvenlik güncellemesi!',
  features: ['🔒 Güvenlik yamalar'],
  isForceUpdate: true // Kullanıcı "Daha Sonra" diyemez
}
*/

// ============================================
// TEST ETMEK İÇİN
// ============================================

/*
Terminal'de test edin:

curl https://glutasyon-backend-production.up.railway.app/api/app/version

Beklenen çıktı:
{
  "latestVersion": "1.0.2",
  "updateMessage": "Glutasyon uygulamasının en son versiyonunu kullanıyorsunuz.",
  "features": [],
  "isForceUpdate": false,
  "storeUrl": {
    "ios": "https://apps.apple.com/app/YOUR_APP_ID",
    "android": "https://play.google.com/store/apps/details?id=com.glutasyon.mobile"
  }
}
*/

// ============================================
// HATA DURUMUNDA
// ============================================

/*
Eğer endpoint çalışmazsa:

1. Railway logs'ları kontrol edin:
   - Railway dashboard > Logs
   - Hata mesajlarına bakın

2. Route'ların doğru olduğundan emin olun:
   - /api/app/version şeklinde tam path
   - CORS ayarları yapılmış mı kontrol edin

3. Test için local backend kullanın:
   cd test-backend
   npm install
   npm start
   
   Sonra api.js'de isDevelopment = true yapın
*/
