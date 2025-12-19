import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { eventService } from '../services/eventService';
import Button from '../components/Button';
import Input from '../components/Input';
import { COLORS, SIZES, SPACING, BORDER_RADIUS } from '../config/theme';

const EventManagementScreen = ({ route }) => {
  const { restaurantId } = route.params;
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    endDate: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await eventService.getEvents(restaurantId);
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    setLoading(true);
    try {
      const eventData = {
        restaurantId,
        ...formData,
      };

      if (editingId) {
        await eventService.updateEvent(editingId, eventData);
      } else {
        await eventService.createEvent(eventData);
      }

      Alert.alert('Başarılı', editingId ? 'Etkinlik güncellendi' : 'Etkinlik eklendi');
      resetForm();
      loadEvents();
    } catch (error) {
      Alert.alert('Hata', 'İşlem başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event) => {
    setFormData({
      title: event.title,
      description: event.description,
      endDate: event.endDate || '',
    });
    setEditingId(event.id);
    setShowForm(true);
  };

  const handleDelete = async (eventId) => {
    Alert.alert('Sil', 'Etkinliği silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await eventService.deleteEvent(eventId);
            Alert.alert('Başarılı', 'Etkinlik silindi');
            loadEvents();
          } catch (error) {
            Alert.alert('Hata', 'Etkinlik silinemedi');
          }
        },
      },
    ]);
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', endDate: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const renderEvent = ({ item }) => (
    <View style={styles.eventCard}>
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventDescription}>{item.description}</Text>
        {item.endDate && (
          <Text style={styles.eventDate}>
            Son Tarih: {new Date(item.endDate).toLocaleDateString('tr-TR')}
          </Text>
        )}
      </View>
      <View style={styles.eventActions}>
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
        <Text style={styles.headerTitle}>Etkinlik & Kampanya Yönetimi</Text>
        <TouchableOpacity onPress={() => setShowForm(!showForm)}>
          <Ionicons
            name={showForm ? 'close-circle' : 'add-circle'}
            size={32}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      </View>

      {showForm && (
        <View style={styles.form}>
          <Input
            label="Başlık"
            value={formData.title}
            onChangeText={(value) => setFormData({ ...formData, title: value })}
            placeholder="Örn: %20 İndirim Kampanyası"
          />
          <Input
            label="Açıklama"
            value={formData.description}
            onChangeText={(value) => setFormData({ ...formData, description: value })}
            placeholder="Kampanya detayları"
            multiline
            numberOfLines={3}
          />
          <Input
            label="Son Tarih (Opsiyonel)"
            value={formData.endDate}
            onChangeText={(value) => setFormData({ ...formData, endDate: value })}
            placeholder="YYYY-MM-DD"
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
        data={events}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={COLORS.gray} />
            <Text style={styles.emptyText}>Henüz etkinlik eklenmemiş</Text>
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
    flex: 1,
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
  eventCard: {
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
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  eventDescription: {
    fontSize: SIZES.md,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
  },
  eventDate: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  eventActions: {
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

export default EventManagementScreen;
