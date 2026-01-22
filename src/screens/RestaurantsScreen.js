import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { restaurantService } from '../services/restaurantService';
import { favoriteService } from '../services/favoriteService';
import { useAuth } from '../context/AuthContext';
import RestaurantCard from '../components/RestaurantCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { COLORS, SIZES, SPACING } from '../config/theme';
import { getCurrentLocation, calculateDistance } from '../utils/location';

const RestaurantsScreen = ({ navigation }) => {
  const { user, isAuthenticated } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
    getUserLocation();
  }, [isAuthenticated]);

  const getUserLocation = async () => {
    const location = await getCurrentLocation();
    if (location) {
      setUserLocation(location);
    }
  };

  const loadData = async () => {
    try {
      const restaurantsData = await restaurantService.getRestaurants({ status: 'approved' });
      setRestaurants(restaurantsData.restaurants || []);

      // Sadece giriş yapılmışsa favorileri yükle
      if (isAuthenticated) {
        const favoritesData = await favoriteService.getFavorites();
        setFavorites(favoritesData.favorites?.map((f) => f.restaurantId) || []);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error loading restaurants:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const handleFavoritePress = async (restaurantId) => {
    // Giriş yapılmamışsa login sayfasına yönlendir
    if (!isAuthenticated) {
      Alert.alert(
        'Giriş Gerekli',
        'Favorilere eklemek için giriş yapmanız gerekmektedir.',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Giriş Yap', onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }

    try {
      const isFavorite = favorites.includes(restaurantId);
      
      if (isFavorite) {
        await favoriteService.removeFavorite(restaurantId);
        setFavorites(favorites.filter((id) => id !== restaurantId));
      } else {
        await favoriteService.addFavorite(restaurantId);
        setFavorites([...favorites, restaurantId]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const getRestaurantsWithDistance = () => {
    if (!userLocation) return restaurants;

    const restaurantsWithDistance = restaurants.map((restaurant) => {
      // Check if restaurant has valid coordinates
      if (restaurant.latitude && restaurant.longitude) {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          restaurant.latitude,
          restaurant.longitude
        );
        return { ...restaurant, distance };
      }
      return { ...restaurant, distance: Infinity }; // Koordinatı olmayanları en sona at
    });

    // En yakından en uzağa sırala
    return restaurantsWithDistance.sort((a, b) => {
      if (a.distance === Infinity && b.distance === Infinity) return 0;
      if (a.distance === Infinity) return 1;
      if (b.distance === Infinity) return -1;
      return a.distance - b.distance;
    });
  };

  // Arama filtreleme - useMemo ile performans optimizasyonu
  const filteredRestaurants = useMemo(() => {
    const restaurantsWithDistance = getRestaurantsWithDistance();
    
    if (!searchQuery.trim()) {
      return restaurantsWithDistance;
    }

    return restaurantsWithDistance.filter((restaurant) =>
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [restaurants, userLocation, searchQuery]);

  const handleMapPress = () => {
    try {
      const restaurantsWithDistance = getRestaurantsWithDistance();
      // Filter only restaurants with valid coordinates
      const validRestaurants = restaurantsWithDistance.filter(
        r => r.latitude && r.longitude
      );
      
      if (validRestaurants.length === 0) {
        Alert.alert('Uyarı', 'Haritada gösterilecek restoran bulunamadı');
        return;
      }
      
      navigation.navigate('RestaurantMap', { restaurants: validRestaurants });
    } catch (error) {
      console.error('Map navigation error:', error);
      Alert.alert('Hata', 'Harita açılırken bir sorun oluştu');
    }
  };

  const renderRestaurant = useCallback(({ item }) => (
    <RestaurantCard
      restaurant={item}
      onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item.id })}
      onFavoritePress={() => handleFavoritePress(item.id)}
      isFavorite={favorites.includes(item.id)}
    />
  ), [favorites, navigation]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Restoranlar</Text>
        <TouchableOpacity
          onPress={handleMapPress}
        >
          <Ionicons name="map-outline" size={28} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.gray} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Restoran veya konum ara..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.gray}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.gray} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredRestaurants}
        renderItem={renderRestaurant}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={64} color={COLORS.gray} />
            <Text style={styles.emptyText}>
              {searchQuery ? 'Aramanıza uygun restoran bulunamadı' : 'Henüz onaylanmış restoran yok'}
            </Text>
          </View>
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        windowSize={10}
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
    fontSize: SIZES.title,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.sm,
    fontSize: SIZES.md,
    color: COLORS.text,
  },
  list: {
    paddingVertical: SPACING.sm,
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

export default RestaurantsScreen;
