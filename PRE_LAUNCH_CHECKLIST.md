# Pre-Launch Checklist - Glutasyon

Store'lara yüklemeden önce kontrol edilmesi gereken tüm maddeler.

## ✅ 1. Kod ve Fonksiyonellik

### Temel Özellikler
- [x] Kullanıcı kaydı ve girişi çalışıyor
- [x] E-posta doğrulama sistemi aktif
- [x] Şifre sıfırlama çalışıyor
- [x] Profil yönetimi
- [ ] Test edilecek: Tüm ekranlar farklı cihazlarda

### Restoranlar
- [x] Restoran listesi görüntüleme
- [x] Harita üzerinde gösterim
- [x] Restoran detay sayfası
- [x] Yorumlar ve puanlama
- [x] Favorilere ekleme
- [ ] Test edilecek: Konum servisleri
- [ ] Test edilecek: Harita performansı

### Tarifler
- [x] Tarif listesi
- [x] Tarif detayı
- [x] Yeni tarif ekleme
- [x] Tarif yorumları
- [ ] Test edilecek: Görsel yükleme
- [ ] Test edilecek: Çoklu görsel desteği

### Kampanyalar ve Etkinlikler
- [x] Kampanya listesi
- [x] Kampanya detayı
- [x] Etkinlik yönetimi
- [ ] Test edilecek: Tarih filtreleme
- [ ] Test edilecek: Bildirimler (opsiyonel)

### Admin Özellikleri
- [x] Restoran yönetimi
- [x] Kampanya oluşturma
- [x] Ürün yönetimi
- [x] Etkinlik yönetimi
- [ ] Test edilecek: Yetkilendirme

## 🔒 2. Güvenlik

### Kimlik Doğrulama
- [x] JWT token bazlı auth
- [x] Güvenli şifre hashleme
- [x] E-posta doğrulama
- [x] Token yenileme mekanizması
- [ ] Test edilecek: Token expiration
- [ ] Test edilecek: Oturum yönetimi

### API Güvenliği
- [ ] HTTPS kullanımı (production)
- [ ] Rate limiting
- [ ] Input validation
- [ ] SQL injection koruması
- [ ] XSS koruması
- [ ] CSRF koruması

### Veri Güvenliği
- [x] Hassas verilerin şifrelenmesi
- [x] Güvenli veri tabanı bağlantısı
- [ ] Düzenli backup stratejisi
- [ ] KVKK/GDPR uyumu

## 📱 3. Kullanıcı Deneyimi (UX/UI)

### Tasarım
- [x] Tutarlı renk paleti
- [x] Responsive tasarım
- [x] Loading states
- [x] Error states
- [ ] Test edilecek: Dark mode desteği (opsiyonel)
- [ ] Test edilecek: Farklı ekran boyutları

### Navigasyon
- [x] Bottom navigation
- [x] Stack navigation
- [x] Drawer navigation
- [x] Geri tuşu desteği
- [ ] Test edilecek: Deep linking

### Performans
- [ ] Hızlı sayfa yükleme
- [ ] Optimize edilmiş görseller
- [ ] Lazy loading
- [ ] Cache yönetimi
- [ ] Minimum API çağrıları

## 🌍 4. Lokalizasyon ve Yerelleştirme

- [x] Türkçe içerik
- [ ] İngilizce içerik (opsiyonel)
- [ ] Tarih formatları
- [ ] Para birimi formatları
- [ ] Telefon numarası formatları

## 📋 5. Yasal Gereksinimler

### Dokümantasyon
- [x] Gizlilik Politikası oluşturuldu
- [x] Kullanım Şartları oluşturuldu
- [ ] Gizlilik politikası web'de yayınlandı
- [ ] Kullanım şartları web'de yayınlandı
- [ ] Cookie politikası (web için)

### İzinler
- [x] Konum izni açıklaması
- [x] Kamera izni açıklaması
- [x] Galeri izni açıklaması
- [x] İzin reddi senaryoları

### KVKK/GDPR
- [x] Veri toplama şeffaflığı
- [x] Kullanıcı hakları belirtildi
- [ ] Veri silme mekanizması
- [ ] Veri indirme özelliği (opsiyonel)

## 🎨 6. Grafikler ve Medya

### App Icon
- [ ] iOS: 1024x1024 PNG (no alpha)
- [ ] Android: 512x512 PNG
- [ ] Android Adaptive Icon hazır
- [ ] Tüm boyutlar export edildi

### Splash Screen
- [x] Splash image hazır
- [ ] Farklı cihazlar için optimize edildi
- [ ] Loading animation (opsiyonel)

### Ekran Görüntüleri
- [ ] iPhone 6.5": minimum 3 adet
- [ ] Android: minimum 4 adet
- [ ] Tablet görselleri (opsiyonel)
- [ ] Görsellerde metin overlay
- [ ] Tutarlı stil ve branding

### Feature Graphic
- [ ] Google Play: 1024x500 px
- [ ] Logo ve slogan içeriyor

## 🔧 7. Teknik Gereksinimler

### Build ve Deploy
- [x] eas.json yapılandırıldı
- [x] app.json tamamlandı
- [x] package.json güncel
- [ ] Production environment variables ayarlandı
- [ ] API URL'leri production'a güncellendi
- [ ] Google Maps API keys production için alındı

### iOS Specific
- [ ] Bundle ID: com.glutasyon.mobile
- [ ] Apple Developer hesabı hazır
- [ ] Certificates ve provisioning profiles
- [ ] App Store Connect'te app oluşturuldu
- [ ] Build number ve version doğru

### Android Specific
- [ ] Package name: com.glutasyon.mobile
- [ ] Google Play Console hesabı hazır
- [ ] Signing key oluşturuldu ve güvenli saklandı
- [ ] Version code ve version name doğru
- [ ] ProGuard/R8 konfigürasyonu (opsiyonel)

## 🧪 8. Test

### Functional Testing
- [ ] Tüm user flows test edildi
- [ ] Farklı cihazlarda test edildi (iOS/Android)
- [ ] Farklı OS versiyonlarında test edildi
- [ ] Tablet desteği test edildi
- [ ] Offline durumlar test edildi
- [ ] Ağ hataları test edildi

### Performance Testing
- [ ] App başlatma süresi < 3 saniye
- [ ] Sayfa geçiş animasyonları akıcı (60 fps)
- [ ] Bellek kullanımı optimum
- [ ] Battery drain test edildi
- [ ] Büyük veri setleriyle test edildi

### Security Testing
- [ ] Penetration testing
- [ ] API güvenlik testi
- [ ] Hassas veri leak kontrolü
- [ ] Güvenli depolama test edildi

### User Acceptance Testing (UAT)
- [ ] Beta kullanıcı grubu oluşturuldu
- [ ] TestFlight (iOS) veya Internal Testing (Android)
- [ ] Kullanıcı geri bildirimleri toplandı
- [ ] Kritik buglar düzeltildi

## 📊 9. Analytics ve Monitoring (Opsiyonel)

- [ ] Google Analytics entegrasyonu
- [ ] Firebase Analytics
- [ ] Crash reporting (Sentry, Crashlytics)
- [ ] Performance monitoring
- [ ] User behavior tracking

## 🚀 10. Store Listing

### App Store (iOS)
- [ ] App name belirlendi
- [ ] Subtitle hazırlandı (30 karakter)
- [ ] Description yazıldı
- [ ] Keywords belirlendi (100 karakter)
- [ ] Kategori seçildi: Food & Drink
- [ ] Age rating: 4+
- [ ] Copyright bilgisi
- [ ] Privacy policy URL
- [ ] Terms of service URL
- [ ] Support URL
- [ ] Marketing URL (opsiyonel)
- [ ] Promo text (opsiyonel)

### Google Play Store
- [ ] App name belirlendi
- [ ] Short description (80 karakter)
- [ ] Long description yazıldı
- [ ] Kategori: Food & Drink
- [ ] Tags eklendi
- [ ] Content rating anketi tamamlandı
- [ ] Target audience seçildi
- [ ] Privacy policy URL
- [ ] Store listing graphics hazır
- [ ] Pricing & distribution ayarlandı

## 📧 11. Backend Hazırlık

### Production Environment
- [ ] Production sunucu hazır
- [ ] Database migration yapıldı
- [ ] SSL sertifikası yüklendi
- [ ] Domain name ayarlandı
- [ ] Environment variables ayarlandı
- [ ] Backup stratejisi mevcut

### API
- [ ] Production API endpoints test edildi
- [ ] Rate limiting aktif
- [ ] Error logging yapılandırıldı
- [ ] Monitoring araçları aktif
- [ ] CDN kullanımı (görseller için)

### Email Service
- [ ] Production email service hazır
- [ ] Email templates test edildi
- [ ] Spam kontrolü yapıldı
- [ ] Unsubscribe mekanizması

## 👥 12. Kullanıcı Desteği

- [ ] Support email kuruldu: support@glutasyon.com
- [ ] FAQ hazırlandı
- [ ] In-app destek sistemi (opsiyonel)
- [ ] Social media hesapları (opsiyonel)
- [ ] Kullanıcı rehberi/tutorial

## 🎯 13. Marketing ve Launch

### Pre-Launch
- [ ] Landing page hazırlandı
- [ ] Social media paylaşımları planlandı
- [ ] Press kit hazırlandı
- [ ] Beta tester community
- [ ] Early adopter stratejisi

### Launch Day
- [ ] Launch announcement hazır
- [ ] Social media posts schedulelandı
- [ ] Email newsletter (varsa)
- [ ] Product Hunt submission (opsiyonel)

### Post-Launch
- [ ] Kullanıcı feedback toplanacak
- [ ] App store reviews izlenecek
- [ ] Analytics takip edilecek
- [ ] Bug fix priority list

## 🔄 14. Post-Launch Checklist

- [ ] İlk 24 saat içinde crash monitoring
- [ ] İlk kullanıcı geri bildirimleri
- [ ] Store reviews'a cevap verme
- [ ] Hotfix hazırlığı (gerekirse)
- [ ] Kullanım istatistikleri analizi
- [ ] İlk güncelleme planlaması

## ⚠️ Kritik Kontroller (Son Kontrol)

### Pre-Submit Checklist
- [ ] Tüm API URL'leri production
- [ ] Google Maps API keys doğru
- [ ] Test emailler kaldırıldı
- [ ] Console.log'lar temizlendi
- [ ] Debug mode kapalı
- [ ] Hardcoded credentials yok
- [ ] Tüm placeholder'lar değiştirildi
- [ ] Version number doğru
- [ ] Build number artırıldı

### Demo Hesapları (Review için)
- [ ] Admin demo hesabı: demo-admin@glutasyon.com
- [ ] Normal demo hesabı: demo-user@glutasyon.com
- [ ] Restoran demo hesabı: demo-restaurant@glutasyon.com
- [ ] Şifreler basit ve paylaşılabilir
- [ ] Demo data yüklenmiş

---

## 📝 Notlar

### Önemli Hatırlatmalar
1. **API Keys**: Production keys'leri repository'ye commit etmeyin!
2. **Secrets**: .env dosyalarını .gitignore'a ekleyin
3. **Testing**: Her major özelliği en az 2 farklı cihazda test edin
4. **Backup**: Build öncesi son bir code backup alın
5. **Documentation**: README'yi güncelleyin

### Build Öncesi Komutlar
```bash
# Dependencies güncel mi?
npm outdated

# Audit security
npm audit

# Test çalıştır (varsa)
npm test

# Production build local test
expo build:ios --release-channel production
expo build:android --release-channel production

# EAS build
eas build --platform all --profile production
```

### Emergency Contacts
- Backend Admin: [İletişim]
- Apple Developer: [İletişim]
- Google Play: [İletişim]
- Domain/Hosting: [İletişim]

---

**Son Güncelleme**: 26 Kasım 2024
**Versiyon**: 1.0.0
**Durum**: Pre-launch preparation

**Tamamlanan**: X/Y
**Kalan**: Y-X

Başarılar! 🚀
