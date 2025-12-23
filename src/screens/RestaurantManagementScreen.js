import React, { useState, useEffect } from 'react';
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
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import Input from '../components/Input';
import { COLORS, SIZES, SPACING, BORDER_RADIUS } from '../config/theme';
import { getImageUrl } from '../config/api';
import { pickImage } from '../utils/imagePicker';
import { getCoordinatesFromAddress, getCurrentLocation } from '../utils/location';

const RestaurantManagementScreen = ({ route, navigation }) => {
  const { restaurantId } = route.params;
  const [restaurant, setRestaurant] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    latitude: '',
    longitude: '',
    phone: '',
    email: '',
    crossContamination: false,
  });
  const [newLogo, setNewLogo] = useState(null);
  const [newMenuPdf, setNewMenuPdf] = useState(null);
  const [loadingCoordinates, setLoadingCoordinates] = useState(false);
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    loadRestaurantData();
  }, []);

  const loadRestaurantData = async () => {
    try {
      const restaurantData = await restaurantService.getRestaurant(restaurantId);
      const productsData = await productService.getProducts(restaurantId);
      
      setRestaurant(restaurantData.restaurant);
      setProducts(productsData.products || []);
      setCertificates(restaurantData.restaurant.certificates || []);
      
      setFormData({
        name: restaurantData.restaurant.name,
        location: restaurantData.restaurant.location,
        latitude: restaurantData.restaurant.latitude?.toString() || '',
        longitude: restaurantData.restaurant.longitude?.toString() || '',
        phone: restaurantData.restaurant.phone || '',
        email: restaurantData.restaurant.email || '',
        crossContamination: restaurantData.restaurant.crossContamination,
      });
    } catch (error) {
      console.error('Error loading restaurant:', error);
      Alert.alert('Hata', 'Restoran bilgileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handlePickLogo = async () => {
    const image = await pickImage();
    if (image) {
      setNewLogo(image);
    }
  };

  const handlePickMenuPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setNewMenuPdf(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking menu PDF:', error);
      Alert.alert('Hata', 'Dosya seçilemedi');
    }
  };

  const handleLocationChange = async (address) => {
    setFormData({ ...formData, location: address });
    
    if (address.trim().length > 10) {
      setLoadingCoordinates(true);
      const coords = await getCoordinatesFromAddress(address);
      
      if (coords) {
        setFormData(prev => ({
          ...prev,
          latitude: coords.latitude.toString(),
          longitude: coords.longitude.toString(),
        }));
      }
      setLoadingCoordinates(false);
    }
  };

  const handleGetLocation = async () => {
    const location = await getCurrentLocation();
    if (location) {
      setFormData({
        ...formData,
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
      });
      Alert.alert('Başarılı', 'Konum bilgisi alındı!');
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const updateData = new FormData();
      updateData.append('name', formData.name);
      updateData.append('location', formData.location);
      updateData.append('crossContamination', formData.crossContamination);
      
      if (formData.phone) updateData.append('phone', formData.phone);
      if (formData.email) updateData.append('email', formData.email);
      if (formData.latitude) updateData.append('latitude', formData.latitude);
      if (formData.longitude) updateData.append('longitude', formData.longitude);
      
      if (newLogo) {
        updateData.append('logo', {
          uri: newLogo.uri,
          type: 'image/jpeg',
          name: 'logo.jpg',
        });
      }

      if (newMenuPdf) {
        updateData.append('menuPdf', {
          uri: newMenuPdf.uri,
          type: newMenuPdf.mimeType || 'application/pdf',
          name: newMenuPdf.name || 'menu.pdf',
        });
      }

      await restaurantService.updateRestaurant(restaurantId, updateData);
      Alert.alert('Başarılı', 'Restoran bilgileri güncellendi');
      setEditing(false);
      setNewLogo(null);
      setNewMenuPdf(null);
      loadRestaurantData();
    } catch (error) {
      console.error('Error updating restaurant:', error);
      Alert.alert('Hata', 'Güncelleme başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    Alert.alert(
      'Ürünü Sil',
      'Bu ürünü silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await productService.deleteProduct(productId);
              Alert.alert('Başarılı', 'Ürün silindi');
              loadRestaurantData();
            } catch (error) {
              Alert.alert('Hata', 'Ürün silinemedi');
            }
          },
        },
      ]
    );
  };

  const handleAddProduct = () => {
    navigation.navigate('AddProduct', { 
      restaurantId,
      menuPdf: restaurant?.menuPdf 
    });
  };

  const handlePickCertificate = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        Alert.prompt(
          'Sertifika Adı',
          'Sertifika için bir isim girin:',
          [
            { text: 'İptal', style: 'cancel' },
            {
              text: 'Ekle',
              onPress: async (name) => {
                if (!name || name.trim() === '') {
                  Alert.alert('Hata', 'Lütfen bir isim girin');
                  return;
                }
                await uploadCertificate(file, name.trim());
              },
            },
          ],
          'plain-text'
        );
      }
    } catch (error) {
      console.error('Error picking certificate:', error);
      Alert.alert('Hata', 'Dosya seçilemedi');
    }
  };

  const uploadCertificate = async (file, name) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', name);
      formData.append('certificate', {
        uri: file.uri,
        type: 'application/pdf',
        name: file.name || 'certificate.pdf',
      });

      await restaurantService.uploadCertificate(restaurantId, formData);
      Alert.alert('Başarılı', 'Sertifika eklendi');
      await loadRestaurantData();
    } catch (error) {
      console.error('Error uploading certificate:', error);
      Alert.alert('Hata', 'Sertifika yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCertificate = async (certificateId) => {
    Alert.alert(
      'Sertifikayı Sil',
      'Bu sertifikayı silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await restaurantService.deleteCertificate(restaurantId, certificateId);
              Alert.alert('Başarılı', 'Sertifika silindi');
              await loadRestaurantData();
            } catch (error) {
              console.error('Error deleting certificate:', error);
              Alert.alert('Hata', 'Sertifika silinemedi');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Restoran Yönetimi</Text>
          {!editing && (
            <TouchableOpacity onPress={() => setEditing(true)}>
              <Ionicons name="create-outline" size={28} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>

        {editing ? (
          <View style={styles.form}>
            <TouchableOpacity style={styles.logoSection} onPress={handlePickLogo}>
              <Image
                source={{ uri: newLogo?.uri || getImageUrl(restaurant.logo) }}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.changeLogoText}>Logoyu Değiştir</Text>
            </TouchableOpacity>

            <Input
              label="Restoran Adı"
              value={formData.name}
              onChangeText={(value) => setFormData({ ...formData, name: value })}
            />

            <Input
              label="Konum"
              value={formData.location}
              onChangeText={handleLocationChange}
              multiline
              numberOfLines={2}
            />

            {loadingCoordinates && (
              <Text style={styles.loadingText}>Koordinatlar alınıyor...</Text>
            )}

            {formData.latitude && formData.longitude && (
              <Text style={styles.coordsText}>
                📍 {parseFloat(formData.latitude).toFixed(4)}, {parseFloat(formData.longitude).toFixed(4)}
              </Text>
            )}

            <TouchableOpacity style={styles.locationButton} onPress={handleGetLocation}>
              <Ionicons name="location" size={20} color={COLORS.white} />
              <Text style={styles.locationButtonText}>Mevcut Konumumu Kullan</Text>
            </TouchableOpacity>

            <Input
              label="Telefon"
              value={formData.phone}
              onChangeText={(value) => setFormData({ ...formData, phone: value })}
              keyboardType="phone-pad"
            />

            <Input
              label="E-posta"
              value={formData.email}
              onChangeText={(value) => setFormData({ ...formData, email: value })}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.switchRow}>
              <Text style={styles.label}>Çapraz Bulaşa Dikkat Ediyor</Text>
              <TouchableOpacity
                style={[
                  styles.switch,
                  formData.crossContamination && styles.switchActive
                ]}
                onPress={() => setFormData({
                  ...formData,
                  crossContamination: !formData.crossContamination
                })}
              >
                <View style={[
                  styles.switchThumb,
                  formData.crossContamination && styles.switchThumbActive
                ]} />
              </TouchableOpacity>
            </View>

            <View style={styles.menuPdfSection}>
              <Text style={styles.label}>Menü (PDF veya Resim)</Text>
              {(newMenuPdf || restaurant?.menuPdf) ? (
                <View style={styles.menuPdfPreview}>
                  <Ionicons name="document-text" size={40} color={COLORS.primary} />
                  <Text style={styles.menuPdfName}>
                    {newMenuPdf?.name || 'Mevcut menü'}
                  </Text>
                  <TouchableOpacity onPress={handlePickMenuPdf}>
                    <Text style={styles.changeMenuText}>Değiştir</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.uploadButton} onPress={handlePickMenuPdf}>
                  <Ionicons name="cloud-upload-outline" size={24} color={COLORS.white} />
                  <Text style={styles.uploadButtonText}>Menü Yükle</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.formActions}>
              <Button
                title="İptal"
                onPress={() => {
                  setEditing(false);
                  setNewLogo(null);
                  setNewMenuPdf(null);
                }}
                variant="outline"
                style={styles.cancelButton}
              />
              <Button
                title="Kaydet"
                onPress={handleSave}
                style={styles.saveButton}
              />
            </View>
          </View>
        ) : (
          <View style={styles.infoSection}>
            <Image
              source={{ uri: getImageUrl(restaurant.logo) }}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.name}>{restaurant.name}</Text>
            <Text style={styles.location}>{restaurant.location}</Text>
            {restaurant.phone && (
              <Text style={styles.contact}>📞 {restaurant.phone}</Text>
            )}
            {restaurant.email && (
              <Text style={styles.contact}>📧 {restaurant.email}</Text>
            )}
            <Text style={styles.cross}>
              {restaurant.crossContamination ? '✅' : '⚠️'} Çapraz Bulaş: {restaurant.crossContamination ? 'Dikkat Ediliyor' : 'Risk Var'}
            </Text>
          </View>
        )}

        <View style={styles.productsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ürünler</Text>
            <TouchableOpacity onPress={handleAddProduct}>
              <Ionicons name="add-circle" size={32} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {products.length === 0 ? (
            <Text style={styles.emptyText}>Henüz ürün eklenmemiş</Text>
          ) : (
            products.map((product) => (
              <View key={product.id} style={styles.productCard}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  {product.description && (
                    <Text style={styles.productDesc}>{product.description}</Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => handleDeleteProduct(product.id)}>
                  <Ionicons name="trash" size={24} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={styles.productsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sertifikalar</Text>
            <TouchableOpacity onPress={handlePickCertificate}>
              <Ionicons name="add-circle" size={32} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {certificates.length === 0 ? (
            <Text style={styles.emptyText}>Henüz sertifika eklenmemiş</Text>
          ) : (
            certificates.map((cert) => (
              <View key={cert.id} style={styles.productCard}>
                <View style={styles.productInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="document-text" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
                    <Text style={styles.productName}>{cert.name}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleDeleteCertificate(cert.id)}>
                  <Ionicons name="trash" size={24} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={styles.campaignsSection}>
          <TouchableOpacity 
            style={styles.campaignsButton} 
            onPress={() => navigation.navigate('ManageCampaigns')}
          >
            <Ionicons name="megaphone" size={24} color={COLORS.white} />
            <Text style={styles.campaignsButtonText}>Kampanyalarımı Yönet</Text>
            <Ionicons name="chevron-forward" size={24} color={COLORS.white} />
          </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: SIZES.title,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  form: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.lightGray,
  },
  changeLogoText: {
    marginTop: SPACING.sm,
    color: COLORS.primary,
    fontSize: SIZES.sm,
  },
  loadingText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  coordsText: {
    fontSize: SIZES.sm,
    color: COLORS.success,
    marginBottom: SPACING.sm,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  locationButtonText: {
    color: COLORS.white,
    fontSize: SIZES.md,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  label: {
    fontSize: SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  switch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.gray,
    padding: 2,
    justifyContent: 'center',
  },
  switchActive: {
    backgroundColor: COLORS.primary,
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  menuPdfSection: {
    marginVertical: SPACING.md,
  },
  menuPdfPreview: {
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.lightGray,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
  },
  menuPdfName: {
    fontSize: SIZES.sm,
    color: COLORS.text,
    marginVertical: SPACING.xs,
  },
  changeMenuText: {
    color: COLORS.primary,
    fontSize: SIZES.sm,
    fontWeight: '600',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
  },
  uploadButtonText: {
    color: COLORS.white,
    fontSize: SIZES.md,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  formActions: {
    flexDirection: 'row',
    marginTop: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  saveButton: {
    flex: 1,
  },
  infoSection: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  name: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  location: {
    fontSize: SIZES.md,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  contact: {
    fontSize: SIZES.sm,
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  cross: {
    fontSize: SIZES.sm,
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  productsSection: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  emptyText: {
    fontSize: SIZES.md,
    color: COLORS.textLight,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
  productCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.lightGray,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  productDesc: {
    fontSize: SIZES.sm,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  campaignsSection: {
    marginTop: SPACING.md,
  },
  campaignsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  campaignsButtonText: {
    flex: 1,
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: SPACING.sm,
  },
});

export default RestaurantManagementScreen;
