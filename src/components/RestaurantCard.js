import React, { memo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SPACING, BORDER_RADIUS } from '../config/theme';
import { getImageUrl } from '../config/api';

const RestaurantCard = memo(({ restaurant, onPress, onFavoritePress, isFavorite }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <Image
          source={{ uri: getImageUrl(restaurant.logo) }}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <Text style={styles.name} numberOfLines={2}>
              {restaurant.name}
            </Text>
            <TouchableOpacity onPress={onFavoritePress}>
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={24}
                color={isFavorite ? COLORS.danger : COLORS.gray}
              />
            </TouchableOpacity>
          </View>
          {restaurant.distance && (
            <View style={styles.distanceRow}>
              <Ionicons name="navigate" size={14} color={COLORS.primary} />
              <Text style={styles.distance}>{restaurant.distance} km</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.content}>
        
        <View style={styles.row}>
          <Ionicons name="location-outline" size={16} color={COLORS.textLight} />
          <Text style={styles.location} numberOfLines={1}>
            {restaurant.location}
          </Text>
        </View>
        
        {restaurant.crossContamination !== undefined && (
          <View style={styles.badge}>
            <Ionicons
              name={restaurant.crossContamination ? 'checkmark-circle' : 'close-circle'}
              size={16}
              color={restaurant.crossContamination ? COLORS.success : COLORS.warning}
            />
            <Text
              style={[
                styles.badgeText,
                { color: restaurant.crossContamination ? COLORS.success : COLORS.warning },
              ]}
            >
              {restaurant.crossContamination
                ? 'Çapraz bulaşa dikkat ediyor'
                : 'Çapraz bulaş riski var'}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    padding: SPACING.md,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.lightGray,
  },
  headerContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: COLORS.lightGray,
  },
  content: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  name: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  location: {
    fontSize: SIZES.md,
    color: COLORS.textLight,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  badgeText: {
    fontSize: SIZES.sm,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  distance: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    marginLeft: 4,
    fontWeight: '600',
  },
});

export default RestaurantCard;
