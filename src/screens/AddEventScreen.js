import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { eventService } from '../services/eventService';
import { restaurantService } from '../services/restaurantService';
import { getImageUrl } from '../config/api';
import { COLORS, SIZES, SPACING } from '../config/theme';

const AddEventScreen = ({ navigation, route }) => {
  const { eventId, restaurantId: initialRestaurantId } = route.params || {};
  const isEdit = !!eventId;

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [myRestaurants, setMyRestaurants] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showRestaurantPicker, setShowRestaurantPicker] = useState(false);

  const [formData, setFormData] = useState({
    restaurantId: initialRestaurantId || null,
    title: '',
    description: '',
    endDate: new Date(),
    externalUrl: '',
  });

  useEffect(() => {
    loadMyRestaurants();
    if (isEdit) {
      loadEvent();
    }
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

  const loadEvent = async () => {
    try {
      const data = await eventService.getEvent(eventId);
      setFormData({
        restaurantId: data.restaurantId,
        title: data.title,
        description: data.description,
        endDate: data.endDate ? new Date(data.endDate) : new Date(),
        externalUrl: data.externalUrl || '',
      });
    } catch (error) {
      console.error('Error loading event:', error);
      Alert.alert('Hata', 'Etkinlik yüklenemedi');
    } finally {
      setLoading(false);
    }
  };



  const handleSubmit = async () => {
    if (!formData.restaurantId) {
      Alert.alert('Uyarı', 'Lütfen bir restoran seçin');
      return;
    }

    if (!formData.title.trim()) {
      Alert.alert('Uyarı', 'Lütfen etkinlik başlığı girin');
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert('Uyarı', 'Lütfen etkinlik açıklaması girin');
      return;
    }

    setSubmitting(true);

    try {
      const eventData = new FormData();
      eventData.append('restaurantId', formData.restaurantId);
      eventData.append('title', formData.title);
      eventData.append('description', formData.description);
      eventData.append('endDate', formData.endDate.toISOString());
      eventData.append('type', 'event');
      
      if (formData.externalUrl) {
        eventData.append('externalUrl', formData.externalUrl);
      }

      if (isEdit) {
        await eventService.updateEvent(eventId, eventData);
        Alert.alert('Başarılı', 'Etkinlik güncellendi');
      } else {
        await eventService.createEvent(eventData);
        Alert.alert('Başarılı', 'Etkinlik oluşturuldu');
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving event:', error);
      Alert.alert('Hata', error.response?.data?.message || 'Etkinlik kaydedilemedi');
    } finally {
      setSubmitting(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData({ ...formData, endDate: selectedDate });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const selectedRestaurant = myRestaurants.find(r => r.id === formData.restaurantId);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEdit ? 'Etkinlik Düzenle' : 'Yeni Etkinlik'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Restoran Seçimi */}
        {myRestaurants.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>Restoran *</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => {
                if (myRestaurants.length > 1) {
                  Alert.alert(
                    'Restoran Seç',
                    '',
                    myRestaurants.map(restaurant => ({
                      text: restaurant.name,
                      onPress: () => setFormData({ ...formData, restaurantId: restaurant.id }),
                    }))
                  );
                }
              }}
            >
              <Text style={selectedRestaurant ? styles.inputText : styles.placeholderText}>
                {selectedRestaurant ? selectedRestaurant.name : 'Restoran seçin'}
              </Text>
              {myRestaurants.length > 1 && (
                <Ionicons name="chevron-down" size={20} color={COLORS.textLight} />
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Başlık */}
        <View style={styles.section}>
          <Text style={styles.label}>Etkinlik Başlığı *</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: Çölyak Hastalığı Farkındalık Günü"
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
          />
        </View>

        {/* Açıklama */}
        <View style={styles.section}>
          <Text style={styles.label}>Açıklama *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Etkinlik detaylarını yazın"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        {/* Etkinlik Tarihi */}
        <View style={styles.section}>
          <Text style={styles.label}>Etkinlik Tarihi</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={COLORS.textLight} />
            <Text style={styles.inputText}>
              {formData.endDate.toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={formData.endDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        {/* External URL */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Web Sitesi Linki (Opsiyonel)
          </Text>
          <TextInput
            style={styles.input}
            placeholder="https://example.com/etkinlik"
            value={formData.externalUrl}
            onChangeText={(text) => setFormData({ ...formData, externalUrl: text })}
            keyboardType="url"
            autoCapitalize="none"
          />
          <Text style={styles.helperText}>
            Etkinlik hakkında daha fazla bilgi için bir link ekleyebilirsiniz
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.submitButtonText}>
              {isEdit ? 'Güncelle' : 'Oluştur'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: SIZES.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  inputText: {
    flex: 1,
    fontSize: SIZES.md,
    color: COLORS.text,
  },
  placeholderText: {
    flex: 1,
    fontSize: SIZES.md,
    color: COLORS.textLight,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: SIZES.sm,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  imagePickerButton: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: SPACING.sm,
    fontSize: SIZES.md,
    color: COLORS.gray,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: SIZES.md,
    fontWeight: '600',
  },
});

export default AddEventScreen;
