import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { productService } from '../services/productService';
import Input from '../components/Input';
import Button from '../components/Button';
import { COLORS, SIZES, SPACING, BORDER_RADIUS } from '../config/theme';

const AddProductScreen = ({ route, navigation }) => {
  const { restaurantId } = route.params;
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Uyarı', 'Lütfen ürün adını girin');
      return;
    }

    setLoading(true);
    try {
      await productService.createProduct({
        restaurantId,
        name: formData.name,
        description: formData.description,
      });
      Alert.alert('Başarılı', 'Ürün eklendi', [
        {
          text: 'Tamam',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error creating product:', error);
      Alert.alert('Hata', 'Ürün eklenemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <Text style={styles.title}>Yeni Ürün Ekle</Text>
          <Text style={styles.subtitle}>
            Restoranınızda sunduğunuz glutensiz ürünleri ekleyin
          </Text>

          <Input
            label="Ürün Adı *"
            value={formData.name}
            onChangeText={(value) => handleChange('name', value)}
            placeholder="Örn: Glutensiz Pizza"
          />

          <Input
            label="Açıklama"
            value={formData.description}
            onChangeText={(value) => handleChange('description', value)}
            placeholder="Ürün hakkında detaylı bilgi..."
            multiline
            numberOfLines={4}
          />

          <Button
            title="Ürünü Ekle"
            onPress={handleSubmit}
            loading={loading}
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
  content: {
    flex: 1,
  },
  form: {
    padding: SPACING.md,
  },
  title: {
    fontSize: SIZES.header,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: SIZES.md,
    color: COLORS.textLight,
    marginBottom: SPACING.lg,
  },
});

export default AddProductScreen;
