import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { COLORS, SIZES, SPACING } from '../config/theme';
import { getCurrentLocation } from '../utils/location';

const RestaurantMapScreen = ({ route, navigation }) => {
  const { isAuthenticated } = useAuth();
  const { restaurants } = route.params;
  const [userLocation, setUserLocation] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      getUserLocation();
    }
  }, [isAuthenticated]);

  const getUserLocation = async () => {
    const location = await getCurrentLocation();
    if (location) {
      setUserLocation(location);
    }
  };

  // Giriş yapmamışsa login ekranına yönlendir
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loginPrompt}>
          <Ionicons name="map-outline" size={80} color={COLORS.primary} />
          <Text style={styles.loginPromptTitle}>Haritayı Görüntüle</Text>
          <Text style={styles.loginPromptText}>
            Haritayı görmek için giriş yapmanız gerekmektedir.
          </Text>
          <Button
            title="Giriş Yap"
            onPress={() => navigation.navigate('Login')}
            style={styles.loginButton}
          />
          <Button
            title="Kayıt Ol"
            onPress={() => navigation.navigate('Register')}
            variant="outline"
            style={styles.registerButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  const initialRegion = userLocation
    ? {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }
    : restaurants.length > 0
    ? {
        latitude: restaurants[0].latitude,
        longitude: restaurants[0].longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }
    : {
        latitude: 41.0082,
        longitude: 28.9784,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {restaurants.map((restaurant) => (
          restaurant.latitude && restaurant.longitude && (
            <Marker
              key={restaurant.id}
              coordinate={{
                latitude: parseFloat(restaurant.latitude),
                longitude: parseFloat(restaurant.longitude),
              }}
              onPress={() => setSelectedRestaurant(restaurant)}
            >
              <View style={styles.markerContainer}>
                <Ionicons name="restaurant" size={24} color={COLORS.primary} />
              </View>
            </Marker>
          )
        ))}
      </MapView>

      {selectedRestaurant && (
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={styles.restaurantName}>{selectedRestaurant.name}</Text>
            <Text style={styles.distance}>
              {selectedRestaurant.distance} km
            </Text>
          </View>
          <Text style={styles.location}>{selectedRestaurant.location}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    backgroundColor: COLORS.white,
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  infoCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  distance: {
    fontSize: SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  location: {
    fontSize: SIZES.md,
    color: COLORS.textLight,
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  loginPromptTitle: {
    fontSize: SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  loginPromptText: {
    fontSize: SIZES.md,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  loginButton: {
    width: '100%',
    marginBottom: SPACING.md,
  },
  registerButton: {
    width: '100%',
  },
});

export default RestaurantMapScreen;
