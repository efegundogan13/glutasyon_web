import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { eventService } from '../services/eventService';
import { restaurantService } from '../services/restaurantService';
import { getImageUrl } from '../config/api';
import { COLORS, SIZES, SPACING } from '../config/theme';

const ManageEventsScreen = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [myRestaurants, setMyRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('all');
  const [allEvents, setAllEvents] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [selectedRestaurantId, allEvents]);

  const filterEvents = () => {
    if (selectedRestaurantId === 'all') {
      setEvents(allEvents);
    } else {
      setEvents(allEvents.filter(e => e.restaurantId === selectedRestaurantId));
    }
  };

  const loadData = async () => {
    try {
      // Önce restoranları yükle
      const restaurantsData = await restaurantService.getMyRestaurants();
      setMyRestaurants(Array.isArray(restaurantsData) ? restaurantsData : []);
      
      // Tüm restoranların etkinliklerini yükle
      const loadedEvents = [];
      const restaurants = Array.isArray(restaurantsData) ? restaurantsData : [];
      
      for (const restaurant of restaurants) {
        try {
          const eventsData = await eventService.getEvents(restaurant.id);
          const eventsWithRestaurant = (eventsData.events || []).map(event => ({
            ...event,
            restaurant: restaurant,
          }));
          loadedEvents.push(...eventsWithRestaurant);
        } catch (error) {
          console.error(`Error loading events for restaurant ${restaurant.id}:`, error);
        }
      }
      
      setAllEvents(loadedEvents);
      setEvents(loadedEvents);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Hata', 'Etkinlikler yüklenemedi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const handleDelete = async (eventId) => {
    Alert.alert(
      'Etkinliği Sil',
      'Bu etkinliği silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await eventService.deleteEvent(eventId);
              Alert.alert('Başarılı', 'Etkinlik silindi');
              loadData();
            } catch (error) {
              Alert.alert('Hata', 'Etkinlik silinemedi');
            }
          },
        },
      ]
    );
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const renderEventCard = ({ item }) => (
    <View style={styles.eventCard}>
      <View style={styles.eventHeader}>
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          {myRestaurants.length > 1 && (
            <Text style={styles.restaurantName}>📍 {item.restaurant?.name}</Text>
          )}
          <Text style={styles.eventDescription} numberOfLines={2}>
            {item.description}
          </Text>
          {item.endDate && (
            <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={16} color={COLORS.textLight} />
              <Text style={styles.dateText}>Son Tarih: {formatDate(item.endDate)}</Text>
            </View>
          )}
          {item.externalUrl && (
            <View style={styles.linkBadge}>
              <Ionicons name="link-outline" size={14} color={COLORS.primary} />
              <Text style={styles.linkText}>Link var</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
        >
          <Ionicons name="eye-outline" size={20} color={COLORS.white} />
          <Text style={styles.actionButtonText}>Görüntüle</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => navigation.navigate('AddEvent', { eventId: item.id, restaurantId: item.restaurantId })}
        >
          <Ionicons name="create-outline" size={20} color={COLORS.white} />
          <Text style={styles.actionButtonText}>Düzenle</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color={COLORS.white} />
          <Text style={styles.actionButtonText}>Sil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={80} color={COLORS.gray} />
      <Text style={styles.emptyTitle}>Henüz etkinlik eklemediniz</Text>
      <Text style={styles.emptyText}>
        Restoranınız için özel etkinlikler oluşturun. Sağ alttaki + butonunu kullanın.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Etkinliklerim</Text>
      </View>

      {/* Restoran Filtresi */}
      {myRestaurants.length > 1 && (
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Restoran:</Text>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => {
              Alert.alert(
                'Restoran Seç',
                '',
                [
                  {
                    text: 'Tümü',
                    onPress: () => setSelectedRestaurantId('all'),
                  },
                  ...myRestaurants.map(restaurant => ({
                    text: restaurant.name,
                    onPress: () => setSelectedRestaurantId(restaurant.id),
                  })),
                  { text: 'İptal', style: 'cancel' },
                ]
              );
            }}
          >
            <Text style={styles.filterButtonText}>
              {selectedRestaurantId === 'all' 
                ? 'Tüm Restoranlar' 
                : myRestaurants.find(r => r.id === selectedRestaurantId)?.name || 'Seçiniz'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={events}
        renderItem={renderEventCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={events.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          if (myRestaurants.length === 1) {
            navigation.navigate('AddEvent', { restaurantId: myRestaurants[0].id });
          } else if (myRestaurants.length > 1) {
            navigation.navigate('AddEvent');
          } else {
            Alert.alert('Hata', 'Önce bir restoran eklemelisiniz');
          }
        }}
      >
        <Ionicons name="add" size={30} color={COLORS.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterLabel: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterButtonText: {
    fontSize: SIZES.md,
    color: COLORS.text,
  },
  list: {
    padding: SPACING.md,
  },
  emptyList: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  eventCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  restaurantName: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
    fontWeight: '500',
  },
  eventDescription: {
    fontSize: SIZES.md,
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  dateText: {
    fontSize: SIZES.sm,
    color: COLORS.textLight,
  },
  linkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: SPACING.xs,
    gap: 4,
  },
  linkText: {
    fontSize: SIZES.xs,
    color: COLORS.primary,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
    borderRadius: 8,
    gap: 4,
  },
  viewButton: {
    backgroundColor: COLORS.primary,
  },
  editButton: {
    backgroundColor: COLORS.warning,
  },
  deleteButton: {
    backgroundColor: COLORS.danger,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: SIZES.sm,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: SIZES.md,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 25,
    gap: SPACING.sm,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: SIZES.md,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: COLORS.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default ManageEventsScreen;
