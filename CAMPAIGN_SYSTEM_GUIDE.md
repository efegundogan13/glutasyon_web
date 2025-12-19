# 🎉 Kampanya Yönetim Sistemi - Kullanım Kılavuzu

## 📋 Genel Bakış

Restoran sahipleri kampanya ve etkinlik oluşturabilir, kullanıcılar bu kampanyaları görebilir ve kampanyanın detaylı web sitesine gidebilirler (Rolla örneğindeki gibi).

## 🎯 Özellikler

### Kampanya Özellikleri
- ✅ **Görsel**: 16:9 oranında kampanya görseli
- ✅ **Başlık ve Açıklama**: Kampanya detayları
- ✅ **Tarih Aralığı**: Başlangıç ve bitiş tarihleri
- ✅ **Dış Link**: Kampanyanın tam detaylarının olduğu web sitesi
- ✅ **Aktif/Pasif Durum**: Kampanyayı yayından kaldırma/yayına alma
- ✅ **Restoran İlişkisi**: Hangi restorana ait olduğu bilgisi

### Kullanıcı Rolleri

#### 👥 Normal Kullanıcılar
- Tüm aktif kampanyaları görüntüleme
- Kampanya detaylarını inceleme
- Kampanyanın dış linkine gitme (web sitesi)
- Restoranı arama veya restoran detayına gitme
- Restoranın kampanyalarını filtreleme

#### 🏪 Restoran Sahipleri
- Kendi restoranları için kampanya oluşturma
- Kampanyaları düzenleme
- Kampanyaları aktif/pasif yapma
- Kampanyaları silme
- Tüm kampanyalarını görüntüleme

#### 👨‍💼 Admin
- Tüm kampanyaları görüntüleme ve yönetme

## 📱 Ekranlar

### 1. CampaignsScreen (Kampanyalar Sekmesi)
**Konum**: Alt menü - "Kampanyalar" sekmesi (megafon ikonu)

**İçerik**:
- Aktif kampanyaların listesi
- Her kampanya kartında:
  - Kampanya görseli
  - Başlık ve açıklama
  - Restoran adı ve logosu
  - Kampanya tarihleri
  - Link badge'i (eğer dış link varsa)

**Aksiyonlar**:
- Kampanya kartına tıklayınca → CampaignDetailScreen

### 2. CampaignDetailScreen (Kampanya Detayı)
**İçerik**:
- Büyük kampanya görseli (300px yükseklik)
- Restoran kartı (tıklanabilir)
- Tarih bilgisi (takvim ikonu ile)
- Detaylı açıklama
- "Kampanyaya Git" butonu (mavi) - Dış linke gider
- "Restoranı Ara" butonu (yeşil) - Telefon açar

**Aksiyonlar**:
- Kampanyaya Git → Kampanyanın web sitesini tarayıcıda açar (Linking API)
- Restoranı Ara → Telefon uygulamasını açar
- Restoran kartına tıklama → RestaurantDetailScreen

### 3. AddCampaignScreen (Kampanya Ekle)
**Erişim**: ManageCampaignsScreen'deki FAB butonu veya "İlk Kampanyayı Ekle" butonu

**Form Alanları**:
1. **Görsel Seçimi** (Zorunlu)
   - expo-image-picker ile galeri/kamera
   - 16:9 aspect ratio
   - Önizleme gösterimi

2. **Restoran Seçimi** (Çoklu restoran sahipleri için)
   - Picker component
   - Tek restoran varsa otomatik seçili

3. **Başlık** (Zorunlu)
   - TextInput

4. **Açıklama** (Zorunlu)
   - Multiline TextInput

5. **Kampanya Linki** (Opsiyonel)
   - URL input
   - Kampanyanın tam detaylarının olduğu web sitesi

6. **Başlangıç Tarihi** (Zorunlu)
   - DateTimePicker (iOS/Android uyumlu)
   - Takvim ikonu ile buton

7. **Bitiş Tarihi** (Opsiyonel)
   - DateTimePicker
   - "Temizle" butonu ile kaldırılabilir

**Validasyon**:
- Görsel, başlık, açıklama, başlangıç tarihi zorunlu
- Bitiş tarihi varsa başlangıçtan sonra olmalı

### 4. ManageCampaignsScreen (Kampanyalarım)
**Erişim**: 
- RestaurantManagementScreen'deki "Kampanyalarımı Yönet" butonu
- Veya direkt navigasyon

**İçerik**:
- Sahip olunan tüm kampanyaların listesi
- Her kampanya kartında:
  - Kampanya görseli
  - Başlık
  - Restoran adı (çoklu restoran için önemli)
  - Tarihler
  - Durum badge'i (Aktif: yeşil, Pasif: kırmızı)

**Aksiyonlar**:
- **Toggle Switch**: Kampanyayı aktif/pasif yapma
- **Görüntüle**: CampaignDetailScreen'e git
- **Sil**: Kampanyayı kalıcı olarak sil (onay ile)
- **FAB Butonu**: Yeni kampanya ekle

**Empty State**:
- "Henüz kampanya eklemediniz"
- "İlk Kampanyayı Ekle" butonu

## 🔌 API Endpoints

### Backend: `http://localhost:3001/api/campaigns`

#### Public Endpoints (Kimlik doğrulama gerektirmez)

1. **GET /** - Tüm aktif kampanyaları getir
   ```javascript
   Response: {
     campaigns: [
       {
         id, title, description, image, externalUrl,
         startDate, endDate, isActive, restaurantId,
         Restaurant: { id, name, logo }
       }
     ]
   }
   ```

2. **GET /restaurant/:restaurantId** - Belirli restoranın kampanyalarını getir
   ```javascript
   Response: { campaigns: [...] }
   ```

3. **GET /:id** - Tek kampanya detayı
   ```javascript
   Response: {
     campaign: {
       id, title, description, image, externalUrl,
       startDate, endDate, isActive,
       Restaurant: { id, name, location, phone, logo }
     }
   }
   ```

#### Protected Endpoints (Token gerektirir)

4. **GET /my** - Kullanıcının kampanyaları (restoran sahibi)
   ```javascript
   Response: { campaigns: [...] }
   ```

5. **POST /** - Yeni kampanya oluştur
   ```javascript
   Body (FormData):
   - image: File (zorunlu)
   - restaurantId: number (zorunlu)
   - title: string (zorunlu)
   - description: string (zorunlu)
   - externalUrl: string (opsiyonel)
   - startDate: ISO date (zorunlu)
   - endDate: ISO date (opsiyonel)
   
   Response: { campaign: {...}, message: "Kampanya oluşturuldu" }
   ```

6. **PUT /:id** - Kampanya güncelle
   ```javascript
   Body (FormData):
   - image: File (opsiyonel)
   - title, description, externalUrl, startDate, endDate, isActive
   
   Response: { campaign: {...}, message: "Kampanya güncellendi" }
   ```

7. **DELETE /:id** - Kampanya sil
   ```javascript
   Response: { message: "Kampanya silindi" }
   ```

## 🗄️ Database Model (Event/Campaign)

```sql
Table: events (Campaign model kullanır)

Columns:
- id: INTEGER (Primary Key)
- restaurantId: INTEGER (Foreign Key -> restaurants)
- title: STRING (Not Null)
- description: TEXT
- image: STRING (Nullable) - Kampanya görseli
- externalUrl: STRING (Nullable) - Dış kampanya linki
- startDate: DATE (Not Null)
- endDate: DATE (Nullable)
- isActive: BOOLEAN (Default: true)
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
```

## 🔒 İzin Sistemi

### Kampanya Oluşturma/Düzenleme/Silme
- Restoran sahibi (user.id === restaurant.ownerId)
- VEYA Admin (user.role === 'admin')

### Görüntüleme
- Public: Herkes aktif kampanyaları görebilir
- Protected: Sadece sahip kendi pasif kampanyalarını da görebilir

## 🧪 Test Senaryoları

### 1. Kampanya Oluşturma Akışı
```
1. Restoran sahibi olarak giriş yap
2. Profil → Restoranlarım → [Restoran Seç]
3. "Kampanyalarımı Yönet" butonuna tıkla
4. FAB (+) butonuna tıkla veya "İlk Kampanyayı Ekle"
5. Görsel seç (galeri/kamera)
6. Form doldur:
   - Başlık: "Bahar İndirimi"
   - Açıklama: "Tüm ürünlerde %30 indirim"
   - Link: "https://example.com/bahar-indirimi"
   - Başlangıç: Bugün
   - Bitiş: 1 ay sonra
7. "Kaydet" butonuna tıkla
8. ✅ Kampanya oluşturuldu mesajı
9. ManageCampaignsScreen'de yeni kampanya görünür
```

### 2. Kampanya Görüntüleme Akışı
```
1. Normal kullanıcı olarak giriş yap (veya misafir)
2. Alt menüden "Kampanyalar" sekmesine git
3. Kampanya listesinde yeni kampanya görünür
4. Kampanya kartına tıkla
5. Detay sayfası açılır:
   - Görsel tam boyutta
   - Restoran bilgileri
   - Tarih aralığı
   - Açıklama
   - "Kampanyaya Git" butonu
6. "Kampanyaya Git" butonuna tıkla
7. ✅ Tarayıcıda kampanya web sitesi açılır
```

### 3. Kampanya Yönetimi Akışı
```
1. Restoran sahibi olarak ManageCampaignsScreen'e git
2. Kampanya listesinde:
   - Toggle ile aktif/pasif yap → ✅ Anında güncellenir
   - Görüntüle → Detay sayfasına git
   - Sil → Onay iste → Kampanya silinir
3. Pasif kampanya:
   - Public ekranlarda görünmez
   - Sadece sahibi ManageCampaigns'de görebilir
```

### 4. Çoklu Restoran Senaryosu
```
1. Birden fazla restoranı olan kullanıcı
2. AddCampaignScreen'de restoran picker görünür
3. İstediği restoranı seç
4. Kampanya oluştur
5. ManageCampaignsScreen'de tüm restoranların kampanyaları görünür
6. Her kampanya kartında hangi restorana ait olduğu belirtilir
```

## 🎨 UI/UX Detayları

### Renkler (theme.js)
- `primaryLight: '#a8dcd1'` - Badge arka planları
- `error: '#e74c3c'` - Pasif durum, sil butonu
- `successLight: '#d5f4e6'` - Aktif durum badge

### İkonlar (Ionicons)
- `megaphone` / `megaphone-outline` - Kampanyalar sekmesi
- `calendar` / `calendar-outline` - Tarih gösterimleri
- `link` / `link-outline` - Dış link badge
- `add-circle` - Kampanya ekleme FAB

### Kampanya Kartı
```
┌────────────────────────────────────┐
│  [Kampanya Görseli - 16:9]        │
├────────────────────────────────────┤
│  Kampanya Başlığı                  │
│  Açıklama özeti...                 │
│                                    │
│  [Logo] Restoran Adı         🔗   │
│  📅 21 Ara 2024 - 21 Oca 2025     │
└────────────────────────────────────┘
```

### Empty States
- **CampaignsScreen**: Megafon ikonu + "Henüz kampanya yok"
- **ManageCampaignsScreen**: Megafon ikonu + "Henüz kampanya eklemediniz" + "İlk Kampanyayı Ekle" butonu

## 📦 Yüklenen Paketler

```json
{
  "@react-native-community/datetimepicker": "latest"
}
```

**Kurulum**:
```bash
cd ~/Desktop/glutasyon-full
npx expo install @react-native-community/datetimepicker
```

## 🔗 Navigasyon Yapısı

```
MainNavigator (Stack)
├── MainTabs (Bottom Tabs)
│   ├── RestaurantsTab
│   ├── CampaignsTab ← YENİ
│   ├── RecipesTab
│   └── ProfileTab
├── CampaignDetail ← YENİ
├── AddCampaign ← YENİ
├── ManageCampaigns ← YENİ
└── ... (diğer ekranlar)
```

## 🚀 Production Checklist

### Backend
- [x] Campaign model oluşturuldu
- [x] CRUD endpoints hazır
- [x] İzin sistemi aktif
- [x] Image upload middleware
- [x] Validation rules
- [ ] Image optimization (production için)
- [ ] Rate limiting (production için)

### Frontend
- [x] Campaign screens tamamlandı
- [x] Navigation entegrasyonu
- [x] Service layer hazır
- [x] DateTimePicker kuruldu
- [x] Image picker entegrasyonu
- [x] External link (Linking API)
- [x] Empty states
- [x] Loading states
- [ ] Error boundaries (production için)
- [ ] Offline support (opsiyonel)

### Test
- [ ] Unit testler
- [ ] Integration testler
- [ ] E2E testler
- [x] Manuel test senaryoları

## 🐛 Bilinen Sorunlar / Geliştirmeler

### Yapılacaklar
1. Kampanya arama/filtreleme
2. Kampanya kategorileri (İndirim, Etkinlik, vs.)
3. Push notification (yeni kampanya bildirim)
4. Kampanya favorileme
5. Kampanya paylaşma (sosyal medya)
6. Kampanya istatistikleri (görüntülenme, tıklama)

### Notlar
- `Event` model kullanılıyor ama `Campaign` controller - geriye dönük uyumluluk için table name 'events' kaldı
- External URL validation client-side yapılıyor
- Görseller `/uploads` klasöründe saklanıyor
- DateTimePicker iOS ve Android'de farklı davranabilir - test edilmeli

## 📞 İletişim & Destek

Sorular için:
- Backend: `glutasyon-backend/controllers/campaignController.js`
- Frontend: `glutasyon-full/src/screens/Campaign*.js`
- Service: `glutasyon-full/src/services/campaignService.js`

---

**Son Güncelleme**: Kampanya sistemi tam entegre, test için hazır! 🎉
