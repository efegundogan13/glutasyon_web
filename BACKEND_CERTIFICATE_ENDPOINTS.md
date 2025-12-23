# Backend Sertifika Endpoint'leri

Backend'e eklenmesi gereken endpoint'ler:

## 1. Restaurant Model'e Certificate Field Ekle

```javascript
// models/Restaurant.js içinde
certificates: [
  {
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
],
```

## 2. Sertifika Yükleme Endpoint'i

```javascript
// routes/restaurants.js

// Sertifika yükle
router.post('/:id/certificates', auth, upload.single('certificate'), async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restoran bulunamadı' });
    }

    // Sadece restoran sahibi veya admin sertifika yükleyebilir
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Yetkiniz yok' });
    }

    // Maksimum 5 sertifika kontrolü
    if (restaurant.certificates && restaurant.certificates.length >= 5) {
      return res.status(400).json({ message: 'Maksimum 5 sertifika yükleyebilirsiniz' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Dosya yüklenmedi' });
    }

    // PDF kontrolü
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ message: 'Sadece PDF dosyası yükleyebilirsiniz' });
    }

    const certificateName = req.body.certificateName || 'Sertifika';
    
    const certificate = {
      name: certificateName,
      url: req.file.path, // Cloudinary veya dosya yolu
      uploadedAt: new Date(),
    };

    if (!restaurant.certificates) {
      restaurant.certificates = [];
    }
    
    restaurant.certificates.push(certificate);
    await restaurant.save();

    res.json({
      message: 'Sertifika başarıyla yüklendi',
      certificate,
      restaurant,
    });
  } catch (error) {
    console.error('Sertifika yükleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});
```

## 3. Sertifika Silme Endpoint'i

```javascript
// routes/restaurants.js

// Sertifika sil
router.delete('/:id/certificates/:certificateId', auth, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restoran bulunamadı' });
    }

    // Sadece restoran sahibi veya admin sertifika silebilir
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Yetkiniz yok' });
    }

    if (!restaurant.certificates || restaurant.certificates.length === 0) {
      return res.status(404).json({ message: 'Sertifika bulunamadı' });
    }

    const certificateIndex = restaurant.certificates.findIndex(
      cert => cert._id.toString() === req.params.certificateId
    );

    if (certificateIndex === -1) {
      return res.status(404).json({ message: 'Sertifika bulunamadı' });
    }

    // Sertifikayı sil (Cloudinary kullanıyorsan dosyayı da sil)
    restaurant.certificates.splice(certificateIndex, 1);
    await restaurant.save();

    res.json({
      message: 'Sertifika başarıyla silindi',
      restaurant,
    });
  } catch (error) {
    console.error('Sertifika silme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});
```

## 4. Restoran Başvurusunda Sertifika Desteği

```javascript
// routes/restaurants.js - Apply restaurant endpoint'inde

// Başvuru yaparken sertifikaları da yükle
// Multer'da multiple file upload için:
router.post('/apply', auth, upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'menuPdf', maxCount: 1 },
  { name: 'certificates', maxCount: 5 } // Maksimum 5 sertifika
]), async (req, res) => {
  try {
    // ... diğer kodlar ...

    // Sertifikaları işle
    if (req.files.certificates) {
      restaurantData.certificates = req.files.certificates.map((file, index) => ({
        name: req.body[`certificateName_${index}`] || `Sertifika ${index + 1}`,
        url: file.path,
        uploadedAt: new Date(),
      }));
    }

    // ... diğer kodlar ...
  } catch (error) {
    // ...
  }
});
```

## 5. Multer Konfigürasyonu

Eğer Cloudinary kullanıyorsan, multer konfigürasyonunda PDF dosyalarını da kabul et:

```javascript
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // PDF veya resim kontrolü
    if (file.mimetype === 'application/pdf') {
      return {
        folder: 'glutasyon/certificates',
        format: 'pdf',
        resource_type: 'raw', // PDF için 'raw' kullan
      };
    }
    return {
      folder: 'glutasyon/images',
      format: 'jpg',
    };
  },
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'certificate' || file.fieldname === 'certificates') {
      // Sadece PDF kabul et
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Sadece PDF dosyası yükleyebilirsiniz'), false);
      }
    } else {
      // Diğer dosyalar için mevcut kontrol
      cb(null, true);
    }
  },
});
```

## Test İçin cURL Komutları

```bash
# Sertifika yükle
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "certificate=@certificate.pdf" \
  -F "certificateName=Glütensiz Sertifika" \
  https://glutasyon-backend-production.up.railway.app/api/restaurants/RESTAURANT_ID/certificates

# Sertifika sil
curl -X DELETE \
  -H "Authorization: Bearer YOUR_TOKEN" \
  https://glutasyon-backend-production.up.railway.app/api/restaurants/RESTAURANT_ID/certificates/CERTIFICATE_ID
```

## Frontend'den Kullanım

Frontend'den bu endpoint'leri kullanmak için `restaurantService.js`'e eklenen fonksiyonlar:

```javascript
uploadCertificate: async (restaurantId, file, certificateName) => {
  const formData = new FormData();
  formData.append('certificate', {
    uri: file.uri,
    type: file.type || file.mimeType || 'application/pdf',
    name: file.name || 'certificate.pdf',
  });
  formData.append('certificateName', certificateName);

  const response = await api.post(`/restaurants/${restaurantId}/certificates`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
},

deleteCertificate: async (restaurantId, certificateId) => {
  const response = await api.delete(`/restaurants/${restaurantId}/certificates/${certificateId}`);
  return response.data;
},
```

Bu endpoint'leri backend'e ekledikten sonra frontend hazır olacak!
