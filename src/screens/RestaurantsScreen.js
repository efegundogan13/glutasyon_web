import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
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
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    loadData();
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    const location = await getCurrentLocation();
    if (location) {
      setUserLocation(location);
    }
  };

  const loadData = async () => {
    try {
      const [restaurantsData, favoritesData] = await Promise.all([
        restaurantService.getRestaurants({ status: 'approved' }),
        favoriteService.getFavorites(),
      ]);

      setRestaurants(restaurantsData.restaurants || []);
      setFavorites(favoritesData.favorites?.map((f) => f.restaurantId) || []);
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

    return restaurants.map((restaurant) => {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        restaurant.latitude,
        restaurant.longitude
      );
      return { ...restaurant, distance };
    });
  };

  const renderRestaurant = ({ item }) => (
    <RestaurantCard
      restaurant={item}
      onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item.id })}
      onFavoritePress={() => handleFavoritePress(item.id)}
      isFavorite={favorites.includes(item.id)}
    />
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Restoranlar</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('RestaurantMap', { restaurants: getRestaurantsWithDistance() })}
        >
          <Ionicons name="map-outline" size={28} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={getRestaurantsWithDistance()}
        renderItem={renderRestaurant}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={64} color={COLORS.gray} />
            <Text style={styles.emptyText}>Henüz onaylanmış restoran yok</Text>
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
    fontSize: SIZES.title,
    fontWeight: 'bold',
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
