import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { campaignService } from '../services/campaignService';
import { restaurantService } from '../services/restaurantService';
import { COLORS, SIZES, SPACING } from '../config/theme';

const AddCampaignScreen = ({ route, navigation }) => {
  const { restaurantId: initialRestaurantId } = route.params || {};
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    externalUrl: '',
    startDate: new Date(),
    endDate: null,
    restaurantId: initialRestaurantId || null,
  });
  
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [myRestaurants, setMyRestaurants] = useState([]);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  useEffect(() => {
    loadMyRestaurants();
  }, []);

  const loadMyRestaurants = async () => {
    try {
      const data = await restaurantService.getMyRestaurants();
      console.log('My restaurants:', data);
      setMyRestaurants(data);
      
      // Tek restoran varsa otomatik seç
      if (data.length === 1) {
        console.log('Auto-selecting restaurant:', data[0].id);
        setFormData(prev => ({
          ...prev,
          restaurantId: data[0].id
        }));
      } else if (initialRestaurantId) {
        console.log('Setting initial restaurant:', initialRestaurantId);
        setFormData(prev => ({
          ...prev,
          restaurantId: initialRestaurantId
        }));
      }
    } catch (error) {
      console.error('Error loading restaurants:', error);
      Alert.alert('Hata', 'Restoranlar yüklenemedi: ' + error.message);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Galeri erişimi için izin vermeniz gerekiyor');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    console.log('Form data on submit:', formData);
    
    if (!formData.title.trim()) {
      Alert.alert('Hata', 'Lütfen kampanya başlığını girin');
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert('Hata', 'Lütfen kampanya açıklamasını girin');
      return;
    }

    if (!formData.restaurantId) {
      Alert.alert('Hata', 'Lütfen restoran seçin');
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('restaurantId', formData.restaurantId);
      formDataToSend.append('startDate', formData.startDate.toISOString());
      formDataToSend.append('type', 'campaign');
      
      if (formData.endDate) {
        formDataToSend.append('endDate', formData.endDate.toISOString());
      }
      
      if (formData.externalUrl) {
        formDataToSend.append('externalUrl', formData.externalUrl);
      }

      if (image) {
        formDataToSend.append('image', {
          uri: image.uri,
          type: 'image/jpeg',
          name: 'campaign.jpg',
        });
      }

      await campaignService.createCampaign(formDataToSend);
      
      Alert.alert('Başarılı', 'Kampanya oluşturuldu', [
        {
          text: 'Tamam',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Create campaign error:', error);
      Alert.alert('Hata', error.response?.data?.message || 'Kampanya oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Görsel Seçimi */}
        <TouchableOpacity style={styles.imageSection} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image.uri }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={50} color={COLORS.textLight} />
              <Text style={styles.imagePlaceholderText}>Kampanya Görseli Seç</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.form}>
          {/* Restoran Seçimi */}
          {myRestaurants.length > 0 && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Restoran *</Text>
              {myRestaurants.length === 1 ? (
                <View style={styles.singleRestaurant}>
                  <Text style={styles.singleRestaurantText}>{myRestaurants[0].name}</Text>
                </View>
              ) : (
                <View style={styles.restaurantList}>
                  {myRestaurants.map((restaurant) => (
                    <TouchableOpacity
                      key={restaurant.id}
                      style={[
                        styles.restaurantOption,
                        formData.restaurantId === restaurant.id && styles.restaurantOptionSelected,
                      ]}
                      onPress={() => setFormData({ ...formData, restaurantId: restaurant.id })}
                    >
                      <Text
                        style={[
                          styles.restaurantOptionText,
                          formData.restaurantId === restaurant.id && styles.restaurantOptionTextSelected,
                        ]}
                      >
                        {restaurant.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Başlık */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kampanya Başlığı *</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: Yaz İndirimi %20"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />
          </View>

          {/* Açıklama */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Açıklama *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Kampanya detaylarını yazın..."
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Kampanya Linki */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kampanya Linki (Opsiyonel)</Text>
            <TextInput
              style={styles.input}
              placeholder="https://ornek.com/kampanya"
              value={formData.externalUrl}
              onChangeText={(text) => setFormData({ ...formData, externalUrl: text })}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>

          {/* Başlangıç Tarihi */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Başlangıç Tarihi</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
              <Text style={styles.dateButtonText}>{formatDate(formData.startDate)}</Text>
            </TouchableOpacity>
            {showStartDatePicker && (
              <DateTimePicker
                value={formData.startDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, date) => {
                  setShowStartDatePicker(false);
                  if (date) setFormData({ ...formData, startDate: date });
                }}
              />
            )}
          </View>

          {/* Bitiş Tarihi */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bitiş Tarihi (Opsiyonel)</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
              <Text style={styles.dateButtonText}>
                {formData.endDate ? formatDate(formData.endDate) : 'Tarih Seç'}
              </Text>
            </TouchableOpacity>
            {showEndDatePicker && (
              <DateTimePicker
                value={formData.endDate || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={formData.startDate}
                onChange={(event, date) => {
                  setShowEndDatePicker(false);
                  if (date) setFormData({ ...formData, endDate: date });
                }}
              />
            )}
            {formData.endDate && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setFormData({ ...formData, endDate: null })}
              >
                <Text style={styles.clearButtonText}>Temizle</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitButtonText}>Kampanya Oluştur</Text>
            )}
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
    padding: SPACING.lg,
  },
  imageSection: {
    marginBottom: SPACING.lg,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    marginTop: SPACING.sm,
    fontSize: SIZES.md,
    color: COLORS.textLight,
  },
  form: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: SIZES.md,
    color: COLORS.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  restaurantList: {
    gap: SPACING.sm,
  },
  singleRestaurant: {
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  singleRestaurantText: {
    fontSize: SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  restaurantOption: {
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  restaurantOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  restaurantOptionText: {
    fontSize: SIZES.md,
    color: COLORS.text,
  },
  restaurantOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    gap: SPACING.sm,
  },
  dateButtonText: {
    fontSize: SIZES.md,
    color: COLORS.text,
  },
  clearButton: {
    marginTop: SPACING.sm,
    alignSelf: 'flex-start',
  },
  clearButtonText: {
    fontSize: SIZES.sm,
    color: COLORS.error,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});

export default AddCampaignScreen;
