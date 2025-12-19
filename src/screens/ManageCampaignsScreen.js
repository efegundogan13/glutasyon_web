import React, { useState, useEffect } from 'react';
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
import { campaignService } from '../services/campaignService';
import { restaurantService } from '../services/restaurantService';
import { getImageUrl } from '../config/api';
import { COLORS, SIZES, SPACING } from '../config/theme';

const ManageCampaignsScreen = ({ navigation }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [myRestaurants, setMyRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    filterCampaigns();
  }, [selectedRestaurantId, allCampaigns]);

  const filterCampaigns = () => {
    if (selectedRestaurantId === 'all') {
      setCampaigns(allCampaigns);
    } else {
      setCampaigns(allCampaigns.filter(c => c.restaurantId === selectedRestaurantId));
    }
  };

  const loadData = async () => {
    try {
      const [campaignsData, restaurantsData] = await Promise.all([
        campaignService.getMyCampaigns(),
        restaurantService.getMyRestaurants(),
      ]);
      
      setAllCampaigns(campaignsData);
      setCampaigns(campaignsData);
      setMyRestaurants(Array.isArray(restaurantsData) ? restaurantsData : []);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Hata', 'Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadCampaigns = loadData;

  const onRefresh = () => {
    setRefreshing(true);
    loadCampaigns();
  };

  const handleDelete = (campaign) => {
    Alert.alert(
      'Kampanyayı Sil',
      `"${campaign.title}" kampanyasını silmek istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await campaignService.deleteCampaign(campaign.id);
              Alert.alert('Başarılı', 'Kampanya silindi');
              loadCampaigns();
            } catch (error) {
              Alert.alert('Hata', 'Kampanya silinirken hata oluştu');
            }
          },
        },
      ]
    );
  };

  const toggleActive = async (campaign) => {
    try {
      const formData = new FormData();
      formData.append('isActive', !campaign.isActive);
      
      await campaignService.updateCampaign(campaign.id, formData);
      loadCampaigns();
    } catch (error) {
      Alert.alert('Hata', 'Durum güncellenirken hata oluştu');
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  const renderCampaign = ({ item }) => (
    <View style={styles.campaignCard}>
      <View style={styles.campaignHeader}>
        {item.image ? (
          <Image
            source={{ uri: getImageUrl(item.image) }}
            style={styles.campaignImage}
          />
        ) : (
          <View style={[styles.campaignImage, styles.placeholderImage]}>
            <Ionicons name="megaphone-outline" size={30} color={COLORS.textLight} />
          </View>
        )}

        <View style={styles.campaignInfo}>
          <Text style={styles.campaignTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.restaurantName} numberOfLines={1}>
            {item.Restaurant?.name}
          </Text>
          <Text style={styles.dateText}>
            {formatDate(item.startDate)}
            {item.endDate && ` - ${formatDate(item.endDate)}`}
          </Text>
          
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, item.isActive ? styles.statusActive : styles.statusInactive]}>
              <Text style={[styles.statusText, item.isActive ? styles.statusTextActive : styles.statusTextInactive]}>
                {item.isActive ? 'Aktif' : 'Pasif'}
              </Text>
            </View>
            {item.externalUrl && (
              <Ionicons name="link-outline" size={16} color={COLORS.primary} />
            )}
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => toggleActive(item)}
        >
          <Ionicons 
            name={item.isActive ? 'pause-circle-outline' : 'play-circle-outline'} 
            size={20} 
            color={COLORS.text} 
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('CampaignDetail', { campaign: item })}
        >
          <Ionicons name="eye-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash-outline" size={20} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
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
        data={campaigns}
        renderItem={renderCampaign}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="megaphone-outline" size={80} color={COLORS.textLight} />
            <Text style={styles.emptyText}>Henüz kampanya eklemediniz</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddCampaign')}
            >
              <Text style={styles.addButtonText}>İlk Kampanyayı Ekle</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {campaigns.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AddCampaign')}
        >
          <Ionicons name="add" size={28} color={COLORS.white} />
        </TouchableOpacity>
      )}
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
    paddingBottom: 80,
  },
  campaignCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  campaignHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  campaignImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: SPACING.md,
    backgroundColor: COLORS.background,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  campaignInfo: {
    flex: 1,
  },
  campaignTitle: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: SIZES.sm,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  dateText: {
    fontSize: SIZES.sm,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: COLORS.successLight,
  },
  statusInactive: {
    backgroundColor: COLORS.background,
  },
  statusText: {
    fontSize: SIZES.xs,
    fontWeight: '600',
  },
  statusTextActive: {
    color: COLORS.success,
  },
  statusTextInactive: {
    color: COLORS.textLight,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
  actionButton: {
    padding: SPACING.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: SIZES.md,
    color: COLORS.textLight,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: SIZES.md,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

export default ManageCampaignsScreen;
