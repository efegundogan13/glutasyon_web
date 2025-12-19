import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { restaurantService } from '../services/restaurantService';
import { productService } from '../services/productService';
import Button from '../components/Button';
import Input from '../components/Input';
import { COLORS, SIZES, SPACING, BORDER_RADIUS } from '../config/theme';
import { pickImage } from '../utils/imagePicker';
import { getCurrentLocation, getCoordinatesFromAddress } from '../utils/location';

const RestaurantApplicationScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    latitude: '',
    longitude: '',
    crossContamination: true,
    phone: '',
    email: '',
  });
  const [logo, setLogo] = useState(null);
  const [menuPdf, setMenuPdf] = useState(null);
  const [products, setProducts] = useState([{ name: '', description: '' }]);
  const [loading, setLoading] = useState(false);
  const [loadingCoordinates, setLoadingCoordinates] = useState(false);
  const [errors, setErrors] = useState({});

  const updateFormData = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  // Adresten otomatik koordinat al
  const handleLocationChange = async (address) => {
    updateFormData('location', address);
    
    // Adres yeterince uzunsa geocoding yap
    if (address.trim().length > 10) {
      console.log('Geocoding başlatılıyor:', address);
      setLoadingCoordinates(true);
      const coords = await getCoordinatesFromAddress(address);
      
      console.log('Geocoding sonucu:', coords);
      
      if (coords) {
        setFormData(prev => ({
          ...prev,
          latitude: coords.latitude.toString(),
          longitude: coords.longitude.toString(),
        }));
        console.log('Koordinatlar kaydedildi:', coords);
      } else {
        console.log('Geocoding başarısız - koordinat bulunamadı');
      }
      setLoadingCoordinates(false);
    }
  };

  const handlePickLogo = async () => {
    const image = await pickImage();
    if (image) {
      setLogo(image);
    }
  };

  const handlePickMenuPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setMenuPdf(result.assets[0]);
      }
    } catch (error) {
      console.error('Menu PDF seçme hatası:', error);
      Alert.alert('Hata', 'Dosya seçilirken bir hata oluştu');
    }
  };

  const handleGetLocation = async () => {
    try {
      console.log('GPS konum alınıyor...');
      setLoading(true);
      const location = await getCurrentLocation();
      
      console.log('GPS konum sonucu:', location);
      
      if (location) {
        updateFormData('latitude', location.latitude.toString());
        updateFormData('longitude', location.longitude.toString());
        Alert.alert('Başarılı', `Konum bilgisi alındı!\nEnlem: ${location.latitude.toFixed(6)}\nBoylam: ${location.longitude.toFixed(6)}`);
      } else {
        Alert.alert('Uyarı', 'Konum alınamadı. Lütfen konum izinlerini kontrol edin veya manuel olarak adres girin.');
      }
    } catch (error) {
      console.error('Get location error:', error);
      Alert.alert('Hata', 'Konum alınırken bir hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = () => {
    setProducts([...products, { name: '', description: '' }]);
  };

  const updateProduct = (index, field, value) => {
    const newProducts = [...products];
    newProducts[index][field] = value;
    setProducts(newProducts);
  };

  const removeProduct = (index) => {
    if (products.length === 1) {
      Alert.alert('Uyarı', 'En az bir ürün olmalıdır');
      return;
    }
    const newProducts = products.filter((_, i) => i !== index);
    setProducts(newProducts);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Restoran adı gerekli';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Konum gerekli';
    }

    if (!logo) {
      newErrors.logo = 'Logo gerekli';
    }

    // Ürün eklenmişse, tüm ürün adları dolu olmalı
    const hasProducts = products.some((p) => p.name.trim() || p.description.trim());
    if (hasProducts) {
      const hasEmptyProduct = products.some((p) => p.name.trim() && !p.description.trim());
      if (hasEmptyProduct) {
        newErrors.products = 'Ürün adı girilen tüm ürünlerin açıklaması da olmalı';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Alert.alert('Hata', 'Lütfen tüm gerekli alanları doldurun');
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('crossContamination', formData.crossContamination);
      
      if (formData.phone) {
        formDataToSend.append('phone', formData.phone);
      }
      if (formData.email) {
        formDataToSend.append('email', formData.email);
      }
      
      if (formData.latitude) {
        formDataToSend.append('latitude', formData.latitude);
      }
      if (formData.longitude) {
        formDataToSend.append('longitude', formData.longitude);
      }

      formDataToSend.append('logo', {
        uri: logo.uri,
        type: 'image/jpeg',
        name: 'logo.jpg',
      });

      if (menuPdf) {
        formDataToSend.append('menuPdf', {
          uri: menuPdf.uri,
          type: menuPdf.mimeType || 'application/pdf',
          name: menuPdf.name || 'menu.pdf',
        });
      }

      // Sadece dolu ürünleri gönder
      const validProducts = products.filter((p) => p.name.trim() || p.description.trim());
      if (validProducts.length > 0) {
        formDataToSend.append('products', JSON.stringify(validProducts));
      }

      await restaurantService.applyRestaurant(formDataToSend);

      Alert.alert(
        'Başarılı',
        'Restoran başvurunuz alındı. Onaylandıktan sonra restoranınız listelenecektir.',
        [
          {
            text: 'Tamam',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Hata', error.response?.data?.message || 'Başvuru gönderilemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Restoran Başvurusu</Text>
          <Text style={styles.description}>
            Glutensiz restoranınızı kaydedin ve çölyak hastaları size ulaşsın
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Restoran Adı *"
            value={formData.name}
            onChangeText={(value) => updateFormData('name', value)}
            placeholder="Restoranınızın adı"
            error={errors.name}
          />

          <View style={styles.locationInputContainer}>
            <Input
              label="Restoran Konumu *"
              value={formData.location}
              onChangeText={handleLocationChange}
              placeholder="Tam adres girin (örn: Kadıköy, İstanbul)"
              multiline
              numberOfLines={2}
              error={errors.location}
            />
            {loadingCoordinates && (
              <View style={styles.loadingIndicator}>
                <Ionicons name="sync" size={16} color={COLORS.primary} />
                <Text style={styles.loadingText}>Koordinatlar alınıyor...</Text>
              </View>
            )}
            {formData.latitude && formData.longitude && !loadingCoordinates && (
              <View style={styles.coordsInfo}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                <Text style={styles.coordsText}>
                  Konum kaydedildi: {parseFloat(formData.latitude).toFixed(4)}, {parseFloat(formData.longitude).toFixed(4)}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.locationSection}>
            <Text style={styles.infoText}>
              💡 Adresinizi girin, koordinatlar otomatik bulunacak. 
              Veya aşağıdaki butona basarak mevcut konumunuzu kullanabilirsiniz.
            </Text>
            <TouchableOpacity 
              style={styles.locationButton}
              onPress={handleGetLocation}
              disabled={loading}
            >
              <Ionicons name="location" size={20} color={COLORS.white} />
              <Text style={styles.locationButtonText}>Mevcut Konumumu Kullan</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.logoSection}>
            <Text style={styles.label}>Restoran Logosu *</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={handlePickLogo}>
              {logo ? (
                <View style={styles.logoContainer}>
                  <Image source={{ uri: logo.uri }} style={styles.logoImage} resizeMode="contain" />
                  <Text style={styles.changeLogoText}>Değiştirmek için tıklayın</Text>
                </View>
              ) : (
                <View style={styles.imagePickerContent}>
                  <Ionicons name="camera" size={48} color={COLORS.gray} />
                  <Text style={styles.imagePickerText}>Logo Seç</Text>
                </View>
              )}
            </TouchableOpacity>
            {errors.logo && <Text style={styles.errorText}>{errors.logo}</Text>}
          </View>

          <View style={styles.menuSection}>
            <Text style={styles.label}>Menü PDF (İsteğe Bağlı)</Text>
            <Text style={styles.helperText}>
              💡 Menünüzü PDF veya resim olarak yükleyebilirsiniz. 
              Alternatif olarak aşağıdan ürünlerinizi tek tek ekleyebilirsiniz.
            </Text>
            <TouchableOpacity style={styles.pdfPicker} onPress={handlePickMenuPdf}>
              {menuPdf ? (
                <View style={styles.pdfInfo}>
                  <Ionicons name="document-text" size={32} color={COLORS.primary} />
                  <View style={styles.pdfDetails}>
                    <Text style={styles.pdfName}>{menuPdf.name}</Text>
                    <Text style={styles.changeText}>Değiştirmek için tıklayın</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.pdfPickerContent}>
                  <Ionicons name="cloud-upload-outline" size={48} color={COLORS.gray} />
                  <Text style={styles.pdfPickerText}>Menü PDF/Resim Seç</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <Input
            label="Telefon Numarası"
            value={formData.phone}
            onChangeText={(value) => updateFormData('phone', value)}
            placeholder="05XX XXX XX XX"
            keyboardType="phone-pad"
          />

          <Input
            label="E-posta Adresi"
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            placeholder="ornek@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.crossContaminationSection}>
            <Text style={styles.label}>Çapraz Bulaşa Dikkat Ediyor musunuz?</Text>
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  formData.crossContamination && styles.optionButtonActive,
                ]}
                onPress={() => updateFormData('crossContamination', true)}
              >
                <Text
                  style={[
                    styles.optionText,
                    formData.crossContamination && styles.optionTextActive,
                  ]}
                >
                  Evet
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  !formData.crossContamination && styles.optionButtonActive,
                ]}
                onPress={() => updateFormData('crossContamination', false)}
              >
                <Text
                  style={[
                    styles.optionText,
                    !formData.crossContamination && styles.optionTextActive,
                  ]}
                >
                  Hayır
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.productsSection}>
            <View style={styles.productHeader}>
              <Text style={styles.label}>Ürünler (İsteğe Bağlı)</Text>
              <TouchableOpacity onPress={addProduct} style={styles.addButton}>
                <Ionicons name="add-circle" size={28} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            {products.map((product, index) => (
              <View key={index} style={styles.productItem}>
                <View style={styles.productItemHeader}>
                  <Text style={styles.productItemTitle}>Ürün {index + 1}</Text>
                  {products.length > 1 && (
                    <TouchableOpacity onPress={() => removeProduct(index)}>
                      <Ionicons name="trash" size={24} color={COLORS.danger} />
                    </TouchableOpacity>
                  )}
                </View>
                <Input
                  label="Ürün Adı"
                  value={product.name}
                  onChangeText={(value) => updateProduct(index, 'name', value)}
                  placeholder="Örn: Glutensiz Ekmek"
                />
                <Input
                  label="Açıklama (Opsiyonel)"
                  value={product.description}
                  onChangeText={(value) => updateProduct(index, 'description', value)}
                  placeholder="Ürün hakkında kısa açıklama"
                  multiline
                  numberOfLines={2}
                />
              </View>
            ))}
            {errors.products && <Text style={styles.errorText}>{errors.products}</Text>}
          </View>

          <Button
            title="Başvuruyu Gönder"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: SIZES.header,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: SIZES.md,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  form: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  label: {
    fontSize: SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    fontWeight: '500',
  },
  locationInputContainer: {
    marginBottom: SPACING.sm,
  },
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    gap: SPACING.xs,
  },
  loadingText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  coordsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    padding: SPACING.sm,
    backgroundColor: COLORS.success + '10',
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.xs,
  },
  coordsText: {
    fontSize: SIZES.sm,
    color: COLORS.success,
    marginLeft: SPACING.xs,
  },
  infoText: {
    fontSize: SIZES.sm,
    color: COLORS.textLight,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  locationSection: {
    marginBottom: SPACING.md,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  locationButtonText: {
    color: COLORS.white,
    fontSize: SIZES.md,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  logoSection: {
    marginBottom: SPACING.md,
  },
  imagePicker: {
    width: '100%',
    height: 200,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  imagePickerContent: {
    alignItems: 'center',
  },
  imagePickerText: {
    fontSize: SIZES.md,
    color: COLORS.gray,
    marginTop: SPACING.sm,
  },
  logoImage: {
    width: '100%',
    height: '80%',
  },
  changeLogoText: {
    fontSize: SIZES.sm,
    color: COLORS.textLight,
    marginTop: SPACING.sm,
  },
  crossContaminationSection: {
    marginBottom: SPACING.md,
  },
  optionsRow: {
    flexDirection: 'row',
  },
  optionButton: {
    flex: 1,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  optionButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  optionTextActive: {
    color: COLORS.white,
  },
  productsSection: {
    marginBottom: SPACING.md,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  addButton: {
    padding: SPACING.xs,
  },
  productItem: {
    backgroundColor: COLORS.lightGray,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  productItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  productItemTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: SIZES.sm,
    marginTop: SPACING.xs,
  },
  menuSection: {
    marginBottom: SPACING.lg,
  },
  pdfPicker: {
    borderWidth: 2,
    borderColor: COLORS.gray,
    borderStyle: 'dashed',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    backgroundColor: COLORS.lightGray,
  },
  pdfPickerContent: {
    alignItems: 'center',
  },
  pdfPickerText: {
    marginTop: SPACING.sm,
    fontSize: SIZES.md,
    color: COLORS.gray,
  },
  pdfInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  pdfDetails: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  pdfName: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  changeText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
  },
  submitButton: {
    marginTop: SPACING.md,
  },
});

export default RestaurantApplicationScreen;
