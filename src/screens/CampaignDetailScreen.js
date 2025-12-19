import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getImageUrl } from '../config/api';
import { COLORS, SIZES, SPACING } from '../config/theme';

const CampaignDetailScreen = ({ route, navigation }) => {
  const { campaign } = route.params;

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const handleOpenLink = async () => {
    if (!campaign.externalUrl) return;

    try {
      const supported = await Linking.canOpenURL(campaign.externalUrl);
      if (supported) {
        await Linking.openURL(campaign.externalUrl);
      } else {
        Alert.alert('Hata', 'Bu link açılamıyor');
      }
    } catch (error) {
      Alert.alert('Hata', 'Link açılırken bir hata oluştu');
    }
  };

  const handleRestaurantPress = () => {
    if (campaign.restaurant?.id) {
      navigation.navigate('RestaurantDetail', { 
        restaurantId: campaign.restaurant.id 
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView>
        {campaign.image ? (
          <Image
            source={{ uri: getImageUrl(campaign.image) }}
            style={styles.campaignImage}
            resizeMode="contain"
          />
        ) : (
          <View style={[styles.campaignImage, styles.placeholderImage]}>
            <Ionicons name="megaphone-outline" size={80} color={COLORS.textLight} />
          </View>
        )}

        <View style={styles.content}>
          <Text style={styles.title}>{campaign.title}</Text>

          {/* Restoran Bilgisi */}
          <TouchableOpacity 
            style={styles.restaurantCard}
            onPress={handleRestaurantPress}
          >
            {campaign.restaurant?.logo && (
              <Image
                source={{ uri: getImageUrl(campaign.restaurant.logo) }}
                style={styles.restaurantLogo}
              />
            )}
            <View style={styles.restaurantInfo}>
              <Text style={styles.restaurantName}>
                {campaign.restaurant?.name || 'Restoran'}
              </Text>
              {campaign.restaurant?.location && (
                <Text style={styles.restaurantAddress} numberOfLines={1}>
                  {campaign.restaurant.location}
                </Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>

          {/* Tarih Bilgisi */}
          <View style={styles.dateSection}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
            <View style={styles.dateInfo}>
              <Text style={styles.dateLabel}>Kampanya Tarihi</Text>
              <Text style={styles.dateText}>
                {formatDate(campaign.startDate)}
                {campaign.endDate && ` - ${formatDate(campaign.endDate)}`}
              </Text>
            </View>
          </View>

          {/* Açıklama */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kampanya Detayı</Text>
            <Text style={styles.description}>{campaign.description}</Text>
          </View>

          {/* Kampanya Linki */}
          {campaign.externalUrl && (
            <TouchableOpacity 
              style={styles.linkButton}
              onPress={handleOpenLink}
            >
              <Ionicons name="link-outline" size={20} color={COLORS.white} />
              <Text style={styles.linkButtonText}>Kampanyaya Git</Text>
              <Ionicons name="open-outline" size={18} color={COLORS.white} />
            </TouchableOpacity>
          )}

          {/* Restoran İletişim */}
          {campaign.Restaurant?.phone && (
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => Linking.openURL(`tel:${campaign.Restaurant.phone}`)}
            >
              <Ionicons name="call-outline" size={20} color={COLORS.primary} />
              <Text style={styles.contactButtonText}>Restoranı Ara</Text>
            </TouchableOpacity>
          )}
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
  campaignImage: {
    width: '100%',
    height: 180,
    backgroundColor: COLORS.background,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: SPACING.lg,
  },
  title: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  restaurantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  restaurantLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: SPACING.md,
    backgroundColor: COLORS.background,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  restaurantAddress: {
    fontSize: SIZES.sm,
    color: COLORS.textLight,
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.lg,
  },
  dateInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  dateLabel: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  dateText: {
    fontSize: SIZES.md,
    color: COLORS.text,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: SIZES.md,
    color: COLORS.text,
    lineHeight: 24,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  linkButtonText: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.white,
    flex: 1,
    textAlign: 'center',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: SPACING.sm,
  },
  contactButtonText: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

export default CampaignDetailScreen;
