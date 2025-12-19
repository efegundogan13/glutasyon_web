import * as Location from 'expo-location';
import { Alert, Linking, Platform } from 'react-native';

export const requestLocationPermission = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Konum İzni Gerekli',
        'Yakındaki restoranları görebilmek için konum izni gereklidir.',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Ayarlara Git', onPress: () => Linking.openSettings() },
        ]
      );
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
};

export const getCurrentLocation = async () => {
  try {
    const hasPermission = await requestLocationPermission();
    
    if (!hasPermission) {
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
};

// Adresten koordinat al (Geocoding) - Geliştirilmiş Türkiye desteği
export const getCoordinatesFromAddress = async (address) => {
  try {
    if (!address || address.trim().length < 5) {
      console.log('Adres çok kısa:', address);
      return null;
    }

    console.log('Geocoding API çağrısı yapılıyor:', address);
    
    // Türkiye için optimize edilmiş adres
    let searchAddress = address;
    
    // Eğer "Türkiye" veya "Turkey" yoksa ekle
    if (!address.toLowerCase().includes('türkiye') && 
        !address.toLowerCase().includes('turkey') &&
        !address.toLowerCase().includes('istanbul') &&
        !address.toLowerCase().includes('ankara') &&
        !address.toLowerCase().includes('izmir')) {
      searchAddress = `${address}, Turkey`;
    }
    
    // 1. TRY: OpenStreetMap Nominatim API
    try {
      const encodedAddress = encodeURIComponent(searchAddress);
      const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&countrycodes=tr&limit=1&addressdetails=1`;
      
      console.log('Nominatim URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'GlutasyonMobileApp/1.0'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Nominatim yanıtı:', data);
        
        if (data && data.length > 0) {
          const result = {
            latitude: parseFloat(data[0].lat),
            longitude: parseFloat(data[0].lon),
          };
          console.log('✅ Nominatim koordinatlar bulundu:', result);
          return result;
        }
      }
    } catch (nominatimError) {
      console.log('Nominatim hatası:', nominatimError.message);
    }
    
    // 2. TRY: Expo Location Geocoding
    try {
      console.log('Expo Location geocoding deneniyor...');
      const results = await Location.geocodeAsync(searchAddress);
      
      if (results && results.length > 0) {
        const result = {
          latitude: results[0].latitude,
          longitude: results[0].longitude,
        };
        console.log('✅ Expo Location başarılı:', result);
        return result;
      }
    } catch (expoError) {
      console.log('Expo Location hatası:', expoError.message);
    }
    
    // 3. TRY: Photon API (OpenStreetMap alternatif)
    try {
      const encodedAddress = encodeURIComponent(searchAddress);
      const photonUrl = `https://photon.komoot.io/api/?q=${encodedAddress}&limit=1`;
      
      console.log('Photon API deneniyor...');
      const response = await fetch(photonUrl);
      
      if (response.ok) {
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          const coords = data.features[0].geometry.coordinates;
          const result = {
            latitude: coords[1],
            longitude: coords[0],
          };
          console.log('✅ Photon API başarılı:', result);
          return result;
        }
      }
    } catch (photonError) {
      console.log('Photon API hatası:', photonError.message);
    }
    
    console.log('❌ Tüm geocoding yöntemleri başarısız oldu');
    return null;
    
  } catch (error) {
    console.error('Genel geocoding hatası:', error);
    return null;
  }
};

export const openMapsWithDirections = (latitude, longitude, name = '') => {
  // Koordinatlar yoksa veya geçersizse uyarı göster
  if (!latitude || !longitude || latitude === 0 || longitude === 0) {
    Alert.alert('Uyarı', 'Bu restoran için konum bilgisi bulunmuyor.');
    return;
  }

  const latLng = `${latitude},${longitude}`;
  const label = encodeURIComponent(name || 'Restaurant');
  
  const url = Platform.select({
    ios: `maps:?q=${label}&ll=${latLng}`,
    android: `geo:${latLng}?q=${latLng}(${label})`,
  });

  Linking.openURL(url).catch(() => {
    Alert.alert('Hata', 'Harita uygulaması açılamadı.');
  });
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d.toFixed(1);
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};
