# Glutasyon Mobile - Glutensiz Yaşam Uygulaması

Çölyak hastaları için geliştirilmiş, glutensiz restoranları keşfetme ve tarif paylaşma mobil uygulaması.

## Özellikler

### 🔐 Kullanıcı Yönetimi
- Kayıt ol ve giriş yap
- E-posta doğrulama sistemi
- Şifre sıfırlama
- Rol tabanlı yetkilendirme (Normal Kullanıcı, Restoran Admini, Ana Admin)

### 🏪 Restoran Yönetimi
- **Kullanıcılar için:**
  - Onaylı restoranları listeleme
  - Restoran detaylarını görüntüleme
  - Restoranları favorilere ekleme
  - Yorum yapma ve puan verme
  - Harita üzerinde görüntüleme
  - Yol tarifi alma
  
- **Restoran Başvurusu:**
  - Restoran adı, konum, logo ekleme
  - Çapraz bulaş dikkat durumu belirtme
  - Birden fazla ürün ekleme (fiyat bilgisi YOK, sadece tanıtım amaçlı)

- **Restoran Yöneticileri için:**
  - Gelen yorumları onaylama/silme
  - Etkinlik ve kampanya yönetimi
  - Ürün yönetimi

- **Ana Admin için:**
  - Restoran başvurularını onaylama/reddetme
  - Onaylanmış restoranları silme yetkisi

### 🗺️ Harita & Konum
- Restoranları haritada görüntüleme
- Mevcut konuma göre mesafe hesaplama
- Google Maps ile yol tarifi

### ⭐ Favori Sistemi
- Restoranları favorilere ekleme/çıkarma
- Profilde favori restoranları görüntüleme

### 💬 Yorum Sistemi
- Restoranlar hakkında yorum yapma
- Puan verme (1-5 yıldız)
- Restoran yöneticilerinin yorumları onaylaması gerekir
- Kullanıcılar sadece onaylı yorumları görür

### 📝 Tarif Sistemi
- Glutensiz tarif ekleme
- Tarif fotoğrafı ekleme
- Malzemeler ve yapılış adımları
- Hazırlama süresi ve porsiyon bilgisi
- Kendi tariflerini silme

### 🎉 Etkinlik & Kampanya
- Restoran yöneticileri etkinlik/kampanya ekleyebilir
- İndirim ve özel fırsatlar duyurabilir
- Bitiş tarihi belirleyebilir

### 👤 Profil
- Favori restoranlar
- Yapılan yorumlar
- Eklenen tarifler
- Profil bilgilerini görüntüleme

## Kurulum

### Gereksinimler
- Node.js (v14 veya üzeri)
- npm veya yarn
- Expo CLI
- iOS için: Xcode (macOS)
- Android için: Android Studio

### Adımlar

1. **Bağımlılıkları yükleyin:**
```bash
cd /Users/efegundogan/Desktop/glutasyon-full
npm install
```

2. **API URL'ini ayarlayın:**
`src/config/api.js` dosyasında backend API URL'inizi güncelleyin:
```javascript
export const API_BASE_URL = 'https://your-backend-api.com/api';
```

3. **Google Maps API Key ekleyin:**
`app.json` dosyasında Google Maps API anahtarlarınızı ekleyin:
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

4. **Asset dosyalarını ekleyin:**
`assets/` klasörüne aşağıdaki görselleri ekleyin:
- `icon.png` (1024x1024)
- `splash.png` (1242x2436)
- `adaptive-icon.png` (1024x1024)
- `favicon.png` (48x48)

## Çalıştırma

### Geliştirme Sunucusu
```bash
npm start
# veya
expo start
```

### Android
```bash
npm run android
# veya
expo start --android
```

### iOS (sadece macOS)
```bash
npm run ios
# veya
expo start --ios
```

### Web
```bash
npm run web
# veya
expo start --web
```

## Teknolojiler

- **Framework:** React Native (Expo SDK 50)
- **Navigation:** React Navigation 6
- **State Management:** React Context API
- **HTTP Client:** Axios
- **Maps:** React Native Maps
- **Form Validation:** Formik & Yup
- **UI Components:** React Native Paper, React Native Elements
- **Icons:** Expo Vector Icons
- **Storage:** AsyncStorage
- **Location:** Expo Location
- **Image Picker:** Expo Image Picker

## Proje Yapısı

```
glutasyon-full/
├── App.js                 # Ana uygulama dosyası
├── app.json              # Expo yapılandırması
├── package.json          # Bağımlılıklar
├── assets/               # Görseller ve ikonlar
└── src/
    ├── components/       # Yeniden kullanılabilir bileşenler
    │   ├── Button.js
    │   ├── Input.js
    │   ├── LoadingSpinner.js
    │   ├── RestaurantCard.js
    │   ├── RecipeCard.js
    │   └── ReviewCard.js
    ├── config/           # Yapılandırma dosyaları
    │   ├── api.js       # API endpoint'leri
    │   └── theme.js     # Renkler ve stil sabitleri
    ├── context/          # React Context
    │   └── AuthContext.js
    ├── navigation/       # Navigasyon yapısı
    │   ├── AppNavigator.js
    │   ├── AuthNavigator.js
    │   ├── MainNavigator.js
    │   └── TabNavigator.js
    ├── screens/          # Uygulama ekranları
    │   ├── LoginScreen.js
    │   ├── RegisterScreen.js
    │   ├── ForgotPasswordScreen.js
    │   ├── RestaurantsScreen.js
    │   ├── RestaurantDetailScreen.js
    │   ├── RestaurantApplicationScreen.js
    │   ├── RestaurantMapScreen.js
    │   ├── RecipesScreen.js
    │   ├── AddRecipeScreen.js
    │   ├── RecipeDetailScreen.js
    │   ├── ProfileScreen.js
    │   ├── AdminRestaurantsScreen.js
    │   ├── EventManagementScreen.js
    │   └── ProductManagementScreen.js
    ├── services/         # API servisleri
    │   ├── axios.js
    │   ├── authService.js
    │   ├── restaurantService.js
    │   ├── reviewService.js
    │   ├── favoriteService.js
    │   ├── recipeService.js
    │   ├── eventService.js
    │   └── productService.js
    └── utils/            # Yardımcı fonksiyonlar
        ├── validation.js
        ├── imagePicker.js
        └── location.js
```

## Backend API Gereksinimleri

Uygulama aşağıdaki endpoint'leri bekler:

### Authentication
- `POST /api/auth/login` - Giriş yap
- `POST /api/auth/register` - Kayıt ol
- `POST /api/auth/verify-email` - E-posta doğrulama
- `POST /api/auth/forgot-password` - Şifre sıfırlama isteği
- `POST /api/auth/reset-password` - Şifre sıfırlama
- `GET /api/auth/profile` - Profil bilgileri
- `PUT /api/auth/profile` - Profil güncelleme

### Restaurants
- `GET /api/restaurants` - Restoranları listele
- `GET /api/restaurants/:id` - Restoran detayı
- `POST /api/restaurants/apply` - Restoran başvurusu
- `GET /api/restaurants/pending` - Bekleyen başvurular (Admin)
- `POST /api/restaurants/:id/approve` - Başvuruyu onayla (Admin)
- `POST /api/restaurants/:id/reject` - Başvuruyu reddet (Admin)
- `DELETE /api/restaurants/:id` - Restoran sil (Admin)

### Reviews
- `GET /api/reviews/restaurant/:restaurantId` - Restoran yorumları
- `POST /api/reviews` - Yorum yap
- `POST /api/reviews/:id/approve` - Yorumu onayla (Restoran Admin)
- `DELETE /api/reviews/:id` - Yorum sil

### Favorites
- `GET /api/favorites` - Favorileri getir
- `POST /api/favorites` - Favorilere ekle
- `DELETE /api/favorites/:restaurantId` - Favoriden çıkar

### Recipes
- `GET /api/recipes` - Tarifleri listele
- `GET /api/recipes/:id` - Tarif detayı
- `GET /api/recipes/my` - Kendi tariflerim
- `POST /api/recipes` - Tarif ekle
- `DELETE /api/recipes/:id` - Tarif sil

### Events
- `GET /api/events/restaurant/:restaurantId` - Restoran etkinlikleri
- `POST /api/events` - Etkinlik ekle
- `PUT /api/events/:id` - Etkinlik güncelle
- `DELETE /api/events/:id` - Etkinlik sil

### Products
- `GET /api/products/restaurant/:restaurantId` - Restoran ürünleri
- `POST /api/products` - Ürün ekle
- `PUT /api/products/:id` - Ürün güncelle
- `DELETE /api/products/:id` - Ürün sil

## Önemli Notlar

- ⚠️ Ürünler sadece bilgilendirme amaçlıdır, **fiyat bilgisi veya satış sistemi yoktur**
- 📧 Kullanıcılar e-posta doğrulaması yapmalıdır
- ✅ Yorumlar restoran yöneticisi tarafından onaylanmalıdır
- 👑 Ana admin tüm restoranları silebilir
- 🏪 Bir kullanıcı aynı anda hem restoran yöneticisi hem de normal kullanıcı olabilir

## Lisans

MIT

## Destek

Sorularınız için: support@glutasyon.com
