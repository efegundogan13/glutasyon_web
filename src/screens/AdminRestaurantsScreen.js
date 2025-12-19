import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { restaurantService } from '../services/restaurantService';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import { COLORS, SIZES, SPACING, BORDER_RADIUS } from '../config/theme';
import { getImageUrl } from '../config/api';

const AdminRestaurantsScreen = ({ navigation }) => {
  const [pendingRestaurants, setPendingRestaurants] = useState([]);
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' veya 'all'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'pending') {
        const data = await restaurantService.getPendingRestaurants();
        setPendingRestaurants(data.restaurants || []);
      } else {
        const data = await restaurantService.getRestaurants({ approved: true });
        setAllRestaurants(data.restaurants || []);
      }
    } catch (error) {
      console.error('Error loading restaurants:', error);
      Alert.alert('Hata', 'Restoranlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingRestaurants = loadData;

  const handleApprove = async (restaurantId) => {
    Alert.alert(
      'Onayla',
      'Bu restoran başvurusunu onaylamak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Onayla',
          onPress: async () => {
            try {
              await restaurantService.approveRestaurant(restaurantId);
              Alert.alert('Başarılı', 'Restoran onaylandı');
              loadPendingRestaurants();
            } catch (error) {
              Alert.alert('Hata', 'Restoran onaylanamadı');
            }
          },
        },
      ]
    );
  };

  const handleReject = async (restaurantId) => {
    Alert.alert(
      'Reddet',
      'Bu restoran başvurusunu reddetmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Reddet',
          style: 'destructive',
          onPress: async () => {
            try {
              await restaurantService.rejectRestaurant(restaurantId, 'Admin tarafından reddedildi');
              Alert.alert('Başarılı', 'Restoran reddedildi');
              loadPendingRestaurants();
            } catch (error) {
              Alert.alert('Hata', 'Restoran reddedilemedi');
            }
          },
        },
      ]
    );
  };

  const handleDelete = async (restaurantId) => {
    Alert.alert(
      'Sil',
      'Bu restoranı kalıcı olarak silmek istediğinize emin misiniz? Tüm ürünleri ve yorumları da silinecektir.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await restaurantService.deleteRestaurant(restaurantId);
              Alert.alert('Başarılı', 'Restoran silindi');
              loadData();
            } catch (error) {
              Alert.alert('Hata', 'Restoran silinemedi');
            }
          },
        },
      ]
    );
  };

  const renderRestaurant = ({ item }) => {
    const isPending = activeTab === 'pending';
    
    return (
      <View style={styles.card}>
        <Image
          source={{ uri: getImageUrl(item.logo) }}
          style={styles.logo}
          resizeMode="cover"
        />
        <View style={styles.content}>
          <Text style={styles.name}>{item.name}</Text>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color={COLORS.textLight} />
            <Text style={styles.location}>{item.location}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons
              name={item.crossContamination ? 'checkmark-circle' : 'close-circle'}
              size={16}
              color={item.crossContamination ? COLORS.success : COLORS.warning}
            />
            <Text style={styles.crossText}>
              {item.crossContamination
                ? 'Çapraz bulaşa dikkat ediyor'
                : 'Çapraz bulaş riski var'}
            </Text>
          </View>
          {item.ownerName && (
            <Text style={styles.appliedBy}>Başvuran: {item.ownerName}</Text>
          )}
          {item.ownerEmail && (
            <Text style={styles.appliedBy}>Email: {item.ownerEmail}</Text>
          )}
          {!isPending && item.approvedAt && (
            <Text style={styles.appliedBy}>
              Onaylanma: {new Date(item.approvedAt).toLocaleDateString('tr-TR')}
            </Text>
          )}

          <View style={styles.actions}>
            {isPending ? (
              <>
                <Button
                  title="Onayla"
                  onPress={() => handleApprove(item.id)}
                  style={styles.approveButton}
                  textStyle={styles.buttonText}
                />
                <Button
                  title="Reddet"
                  onPress={() => handleReject(item.id)}
                  variant="danger"
                  style={styles.rejectButton}
                  textStyle={styles.buttonText}
                />
              </>
            ) : (
              <Button
                title="Detay"
                onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item.id })}
                variant="secondary"
                style={styles.detailButton}
                textStyle={styles.buttonText}
              />
            )}
            <TouchableOpacity
              onPress={() => handleDelete(item.id)}
              style={styles.deleteButton}
            >
              <Ionicons name="trash" size={24} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Restoran Yönetimi</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Ionicons
            name="time"
            size={24}
            color={activeTab === 'pending' ? COLORS.primary : COLORS.gray}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'pending' && styles.activeTabText,
            ]}
          >
            Bekleyen Başvurular
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Ionicons
            name="restaurant"
            size={24}
            color={activeTab === 'all' ? COLORS.primary : COLORS.gray}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'all' && styles.activeTabText,
            ]}
          >
            Tüm Restoranlar
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={activeTab === 'pending' ? pendingRestaurants : allRestaurants}
        renderItem={renderRestaurant}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons 
              name={activeTab === 'pending' ? 'checkmark-done-outline' : 'restaurant-outline'} 
              size={64} 
              color={COLORS.gray} 
            />
            <Text style={styles.emptyText}>
              {activeTab === 'pending' ? 'Bekleyen başvuru yok' : 'Henüz restoran yok'}
            </Text>
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
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: SIZES.title,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginTop: SPACING.xs,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  list: {
    padding: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.lightGray,
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  location: {
    fontSize: SIZES.sm,
    color: COLORS.textLight,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  crossText: {
    fontSize: SIZES.sm,
    color: COLORS.text,
    marginLeft: SPACING.xs,
  },
  appliedBy: {
    fontSize: SIZES.sm,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  actions: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  approveButton: {
    flex: 1,
    marginRight: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  rejectButton: {
    flex: 1,
    marginRight: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  detailButton: {
    flex: 1,
    marginRight: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  deleteButton: {
    padding: SPACING.xs,
  },
  buttonText: {
    fontSize: SIZES.sm,
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

export default AdminRestaurantsScreen;
