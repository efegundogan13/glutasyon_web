# Security Best Practices - Glutasyon

Bu doküman, Glutasyon uygulamasının güvenliği için uygulanması gereken best practice'leri içerir.

## 🔐 1. API Güvenliği

### 1.1 HTTPS Kullanımı
```javascript
// ✅ GOOD - Production'da mutlaka HTTPS
export const API_BASE_URL = 'https://glutasyon-backend.com/api';

// ❌ BAD - Production'da HTTP kullanmayın
export const API_BASE_URL = 'http://glutasyon-backend.com/api';
```

### 1.2 API Key Yönetimi
```javascript
// ❌ NEVER - API keys'i kod içinde hardcode etmeyin
const apiKey = "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX";

// ✅ GOOD - Environment variables kullanın
import Constants from 'expo-constants';
const apiKey = Constants.manifest?.extra?.googleMapsApiKey;
```

### 1.3 Rate Limiting
Backend'de rate limiting uygulayın:
```javascript
// Backend örnek (Express.js)
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## 🔑 2. Kimlik Doğrulama ve Yetkilendirme

### 2.1 Token Güvenliği
```javascript
// ✅ GOOD - Secure storage kullanın
import AsyncStorage from '@react-native-async-storage/async-storage';

// Token'ı güvenli şekilde saklayın
await AsyncStorage.setItem('userToken', token);

// Token'ı okuyun
const token = await AsyncStorage.getItem('userToken');

// ❌ BAD - Token'ı global variable'da saklamayın
window.userToken = token; // Asla yapmamalısınız
```

### 2.2 Token Expiration
```javascript
// Backend'de token expiration kullanın
const token = jwt.sign(
  { userId: user.id },
  process.env.JWT_SECRET,
  { expiresIn: '7d' } // 7 gün sonra expire
);

// Frontend'de token refresh mekanizması
const refreshToken = async () => {
  try {
    const response = await axios.post('/auth/refresh-token');
    await AsyncStorage.setItem('userToken', response.data.token);
  } catch (error) {
    // Token refresh başarısız, kullanıcıyı logout et
    await logout();
  }
};
```

### 2.3 Sensitive Data
```javascript
// ✅ GOOD - Şifreleri asla loglama
console.log('User logged in'); // OK

// ❌ BAD - Hassas verileri loglama
console.log('Password:', password); // ASLA
console.log('Token:', token); // ASLA
```

## 🛡️ 3. Input Validation

### 3.1 Frontend Validation
```javascript
import * as Yup from 'yup';

// Email validation
const emailSchema = Yup.string()
  .email('Geçerli bir e-posta adresi girin')
  .required('E-posta gereklidir');

// Password validation
const passwordSchema = Yup.string()
  .min(8, 'Şifre en az 8 karakter olmalıdır')
  .matches(/[a-z]/, 'Şifre küçük harf içermelidir')
  .matches(/[A-Z]/, 'Şifre büyük harf içermelidir')
  .matches(/[0-9]/, 'Şifre rakam içermelidir')
  .required('Şifre gereklidir');

// SQL Injection önleme - Backend'de prepared statements
// XSS önleme - Input sanitization
```

### 3.2 Backend Validation
```javascript
// Backend'de de validation yapın
const { body, validationResult } = require('express-validator');

app.post('/auth/register',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Continue with registration
  }
);
```

## 🗄️ 4. Data Protection

### 4.1 Hassas Verilerin Şifrelenmesi
```javascript
// Backend'de şifreleri hash'leyin
const bcrypt = require('bcryptjs');

// Şifre kaydetme
const hashedPassword = await bcrypt.hash(password, 10);

// Şifre kontrolü
const isValid = await bcrypt.compare(password, user.hashedPassword);
```

### 4.2 Database Security
```javascript
// ✅ GOOD - Prepared statements kullanın (SQL Injection önleme)
const user = await db.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);

// ❌ BAD - String concatenation (SQL Injection riski)
const user = await db.query(
  `SELECT * FROM users WHERE email = '${email}'`
);
```

### 4.3 GDPR/KVKK Compliance
```javascript
// Kullanıcı verilerini silme endpoint'i
app.delete('/auth/delete-account', authenticateToken, async (req, res) => {
  try {
    // Kullanıcının tüm verilerini sil
    await db.query('DELETE FROM reviews WHERE user_id = $1', [req.user.id]);
    await db.query('DELETE FROM favorites WHERE user_id = $1', [req.user.id]);
    await db.query('DELETE FROM users WHERE id = $1', [req.user.id]);
    
    res.json({ message: 'Hesabınız silindi' });
  } catch (error) {
    res.status(500).json({ error: 'Hata oluştu' });
  }
});
```

## 📱 5. Mobile Specific Security

### 5.1 Deep Linking Security
```javascript
// Deep link'leri validate edin
Linking.addEventListener('url', (event) => {
  const { url } = event;
  
  // URL validation
  if (url.startsWith('glutasyon://')) {
    // Parse and validate
    const route = url.replace('glutasyon://', '');
    
    // Sadece allowed routes
    const allowedRoutes = ['restaurant', 'recipe', 'campaign'];
    const [type, id] = route.split('/');
    
    if (allowedRoutes.includes(type) && id) {
      // Navigate safely
      navigation.navigate(type, { id });
    }
  }
});
```

### 5.2 Certificate Pinning (Advanced)
```javascript
// SSL Certificate Pinning için (opsiyonel, advanced)
// react-native-ssl-pinning kullanabilirsiniz
```

### 5.3 Root/Jailbreak Detection
```javascript
// Rooted/Jailbroken cihazları tespit etmek için
// react-native-device-info kullanabilirsiniz
import DeviceInfo from 'react-native-device-info';

const checkDeviceSecurity = async () => {
  const isRooted = await DeviceInfo.isRooted();
  if (isRooted) {
    Alert.alert(
      'Güvenlik Uyarısı',
      'Cihazınız root/jailbreak edilmiş. Güvenlik nedeniyle bazı özellikler kısıtlanabilir.'
    );
  }
};
```

## 🔍 6. Error Handling

### 6.1 Error Messages
```javascript
// ✅ GOOD - Generic error messages
res.status(401).json({ error: 'Giriş başarısız' });

// ❌ BAD - Çok detaylı error messages (security risk)
res.status(401).json({ 
  error: 'User not found in database',
  query: 'SELECT * FROM users WHERE email = ...'
});
```

### 6.2 Try-Catch Blocks
```javascript
// Her zaman try-catch kullanın
try {
  const response = await api.post('/auth/login', credentials);
  return response.data;
} catch (error) {
  // Hassas bilgileri loglama
  console.error('Login error:', error.message); // OK
  // console.error('Login error:', error); // Stack trace içerebilir
  
  throw new Error('Giriş başarısız');
}
```

## 🚨 7. Security Headers (Backend)

```javascript
// Helmet.js kullanın (Express.js)
const helmet = require('helmet');
app.use(helmet());

// CORS ayarları
const cors = require('cors');
app.use(cors({
  origin: ['https://glutasyon.com', 'glutasyon://'],
  credentials: true
}));

// Content Security Policy
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrc: ["'self'"],
    imgSrc: ["'self'", "data:", "https:"]
  }
}));
```

## 📊 8. Logging ve Monitoring

### 8.1 Güvenli Logging
```javascript
// ✅ GOOD - Log gerekli bilgileri
logger.info('User logged in', { userId: user.id, timestamp: new Date() });

// ❌ BAD - Hassas verileri loglama
logger.info('User logged in', { 
  userId: user.id, 
  password: user.password, // ASLA
  token: token // ASLA
});
```

### 8.2 Security Monitoring
```javascript
// Sentry ile error tracking
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: __DEV__ ? 'development' : 'production',
  beforeSend(event) {
    // Hassas verileri temizle
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers.Authorization;
    }
    return event;
  }
});
```

## 🔄 9. Updates ve Patches

### 9.1 Dependencies
```bash
# Düzenli olarak dependencies'i güncelleyin
npm outdated
npm update

# Security audit
npm audit
npm audit fix
```

### 9.2 Security Patches
```bash
# Critical security patches'i hemen uygulayın
npm audit fix --force
```

## ✅ Security Checklist

### Pre-Production
- [ ] Tüm API endpoints HTTPS kullanıyor
- [ ] Environment variables production'a taşındı
- [ ] API keys hardcoded değil
- [ ] Debug logs production'da kapalı
- [ ] Error messages generic (detaylı değil)
- [ ] Input validation hem frontend hem backend'de
- [ ] SQL injection koruması var
- [ ] XSS koruması var
- [ ] CSRF koruması var
- [ ] Rate limiting aktif
- [ ] JWT token expiration ayarlanmış
- [ ] Şifreler hash'lenmiş (bcrypt)
- [ ] HTTPS certificate geçerli
- [ ] CORS doğru yapılandırılmış
- [ ] Security headers ayarlanmış (Helmet.js)

### Post-Production
- [ ] Security monitoring aktif
- [ ] Regular security audits
- [ ] Dependency updates
- [ ] Backup stratejisi
- [ ] Incident response plan
- [ ] User data deletion mechanism
- [ ] GDPR/KVKK compliance

## 🆘 Security Incident Response

### Bir Güvenlik İhlali Durumunda:

1. **Hemen Aksiyon**:
   - Etkilenen servisleri kapat
   - Backend loglarını incele
   - Etkilenen kullanıcıları belirle

2. **Bilgilendirme**:
   - Etkilenen kullanıcılara e-posta gönder
   - Store'lara bildir (gerekirse)
   - Yasal gereksinimleri yerine getir (KVKK/GDPR)

3. **Düzeltme**:
   - Güvenlik açığını patch'le
   - Emergency update yayınla
   - Tüm kullanıcı şifrelerini resetle (gerekirse)

4. **Post-Mortem**:
   - Incident analizi yap
   - Önleyici tedbirler al
   - Dokümante et

## 📚 Additional Resources

- [OWASP Mobile Security](https://owasp.org/www-project-mobile-security/)
- [React Native Security](https://reactnative.dev/docs/security)
- [Expo Security](https://docs.expo.dev/guides/security/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

**Güvenlik bir süreç, bir destination değil. Düzenli olarak güncelleyin ve audit edin!**
