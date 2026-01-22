const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Version endpoint
app.get('/api/app/version', (req, res) => {
  res.json({
    latestVersion: '1.0.1', // Test için mevcut versiyondan yüksek
    updateMessage: 'Yeni özellikler ve iyileştirmeler!',
    features: [
      'Restoran arama özelliği eklendi',
      'Konum bazlı sıralama geliştirildi',
      'Performans iyileştirmeleri',
      'Hata düzeltmeleri'
    ],
    isForceUpdate: false, // Zorunlu güncelleme yapılsın mı?
    storeUrl: {
      ios: 'https://apps.apple.com/app/YOUR_APP_ID',
      android: 'https://play.google.com/store/apps/details?id=com.glutasyon.app'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Test backend is running',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint - Version değişikliği için
app.post('/api/app/version', (req, res) => {
  const { version, message, features, isForceUpdate } = req.body;
  
  console.log('📦 Version updated:', {
    version,
    message,
    features,
    isForceUpdate
  });
  
  res.json({
    success: true,
    message: 'Version configuration updated'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 Test Backend Server Started!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📡 Server running at: http://localhost:${PORT}`);
  console.log(`📦 Version endpoint: http://localhost:${PORT}/api/app/version`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📋 Current version config:');
  console.log('   Latest Version: 1.0.1');
  console.log('   Force Update: false');
  console.log('   Message: Yeni özellikler ve iyileştirmeler!\n');
  console.log('💡 Tip: API\'yi test etmek için UpdateChecker.js\'de');
  console.log('   CURRENT_VERSION değerini "0.9.9" yapın\n');
  console.log('⌨️  Press Ctrl+C to stop the server\n');
});
