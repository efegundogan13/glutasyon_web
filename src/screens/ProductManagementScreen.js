import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { productService } from '../services/productService';
import { restaurantService } from '../services/restaurantService';
import Button from '../components/Button';
import Input from '../components/Input';
import { COLORS, SIZES, SPACING, BORDER_RADIUS } from '../config/theme';
import { getImageUrl } from '../config/api';

const ProductManagementScreen = ({ route }) => {
  const { restaurantId, menuPdf } = route.params;
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentMenuPdf, setCurrentMenuPdf] = useState(menuPdf);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productService.getProducts(restaurantId);
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Hata', 'Ürün adı gerekli');
      return;
    }

    setLoading(true);
    try {
      const productData = {
        restaurantId,
        ...formData,
      };

      if (editingId) {
        await productService.updateProduct(editingId, productData);
      } else {
        await productService.createProduct(productData);
      }

      Alert.alert('Başarılı', editingId ? 'Ürün güncellendi' : 'Ürün eklendi');
      resetForm();
      loadProducts();
    } catch (error) {
      Alert.alert('Hata', 'İşlem başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description || '',
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    Alert.alert('Sil', 'Ürünü silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await productService.deleteProduct(productId);
            Alert.alert('Başarılı', 'Ürün silindi');
            loadProducts();
          } catch (error) {
            Alert.alert('Hata', 'Ürün silinemedi');
          }
        },
      },
    ]);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleUploadMenu = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      setLoading(true);
      
      const response = await restaurantService.uploadMenu(restaurantId, file);
      setCurrentMenuPdf(response.menuPdf);
      Alert.alert('Başarılı', 'Menü yüklendi!');
    } catch (error) {
      console.error('Menu upload error:', error);
      Alert.alert('Hata', 'Menü yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
      <View style={styles.productContent}>
        <Text style={styles.productName}>{item.name}</Text>
        {item.description && (
          <Text style={styles.productDescription}>{item.description}</Text>
        )}
      </View>
      <View style={styles.productActions}>
        <TouchableOpacity onPress={() => handleEdit(item)} style={styles.iconButton}>
          <Ionicons name="pencil" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconButton}>
          <Ionicons name="trash" size={24} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ürün Yönetimi</Text>
        <TouchableOpacity onPress={() => setShowForm(!showForm)}>
          <Ionicons
            name={showForm ? 'close-circle' : 'add-circle'}
            size={32}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Menü Upload Bölümü */}
      <View style={styles.menuSection}>
        {currentMenuPdf ? (
          <View style={styles.menuPreview}>
            <Image 
              source={{ uri: getImageUrl(currentMenuPdf) }} 
              style={styles.menuImage}
              resizeMode="contain"
            />
            <Button
              title="Menüyü Değiştir"
              onPress={handleUploadMenu}
              loading={loading}
              style={styles.uploadButton}
            />
          </View>
        ) : (
          <View style={styles.noMenu}>
            <Ionicons name="document-text-outline" size={48} color={COLORS.gray} />
            <Text style={styles.noMenuText}>Henüz menü yüklenmemiş</Text>
            <Button
              title="Menü Yükle (PDF/Resim)"
              onPress={handleUploadMenu}
              loading={loading}
              style={styles.uploadButton}
            />
          </View>
        )}
      </View>

      {showForm && (
        <View style={styles.form}>
          <Input
            label="Ürün Adı *"
            value={formData.name}
            onChangeText={(value) => setFormData({ ...formData, name: value })}
            placeholder="Örn: Glutensiz Ekmek"
          />
          <Input
            label="Açıklama (Opsiyonel)"
            value={formData.description}
            onChangeText={(value) => setFormData({ ...formData, description: value })}
            placeholder="Ürün hakkında kısa bilgi"
            multiline
            numberOfLines={2}
          />
          <View style={styles.formButtons}>
            <Button
              title={editingId ? 'Güncelle' : 'Ekle'}
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitButton}
            />
            <Button
              title="İptal"
              onPress={resetForm}
              variant="outline"
              style={styles.cancelButton}
            />
          </View>
        </View>
      )}

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="fast-food-outline" size={64} color={COLORS.gray} />
            <Text style={styles.emptyText}>Henüz ürün eklenmemiş</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  form: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  formButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  submitButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
  },
  list: {
    padding: SPACING.md,
  },
  menuSection: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuPreview: {
    alignItems: 'center',
  },
  menuImage: {
    width: '100%',
    height: 300,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.lightGray,
    borderRadius: BORDER_RADIUS.md,
  },
  noMenu: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  noMenuText: {
    fontSize: SIZES.md,
    color: COLORS.textLight,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  uploadButton: {
    marginTop: SPACING.sm,
  },
  productCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productContent: {
    flex: 1,
  },
  productName: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  productDescription: {
    fontSize: SIZES.md,
    color: COLORS.textLight,
  },
  productActions: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: SIZES.lg,
    color: COLORS.textLight,
    marginTop: SPACING.md,
  },
});

export default ProductManagementScreen;
