import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { eventService } from '../services/eventService';
import { getImageUrl } from '../config/api';
import { COLORS, SIZES, SPACING } from '../config/theme';

const EventDetailScreen = ({ navigation, route }) => {
  const { eventId } = route.params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      const data = await eventService.getEvent(eventId);
      setEvent(data);
    } catch (error) {
      console.error('Error loading event:', error);
      Alert.alert('Hata', 'Etkinlik yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleExternalLink = () => {
    if (event.externalUrl) {
      Linking.canOpenURL(event.externalUrl).then((supported) => {
        if (supported) {
          Linking.openURL(event.externalUrl);
        } else {
          Alert.alert('Hata', 'Link açılamıyor');
        }
      });
    }
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={80} color={COLORS.gray} />
        <Text style={styles.errorText}>Etkinlik bulunamadı</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Etkinlik Detayı</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Event Image */}
        {event.image && (
          <Image
            source={{ uri: getImageUrl(event.image) }}
            style={styles.eventImage}
            resizeMode="cover"
          />
        )}

        {/* Event Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{event.title}</Text>

          {/* Restaurant Info */}
          {event.restaurant && (
            <TouchableOpacity
              style={styles.restaurantCard}
              onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: event.restaurant.id })}
            >
              <Ionicons name="restaurant" size={20} color={COLORS.primary} />
              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>{event.restaurant.name}</Text>
                {event.restaurant.address && (
                  <Text style={styles.restaurantAddress}>{event.restaurant.address}</Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          )}

          {/* Date */}
          {event.endDate && (
            <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={24} color={COLORS.primary} />
              <View>
                <Text style={styles.dateLabel}>Bitiş Tarihi</Text>
                <Text style={styles.dateText}>{formatDate(event.endDate)}</Text>
              </View>
            </View>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Açıklama</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          {/* External Link */}
          {event.externalUrl && (
            <TouchableOpacity style={styles.linkButton} onPress={handleExternalLink}>
              <Ionicons name="link" size={24} color={COLORS.white} />
              <Text style={styles.linkButtonText}>Daha Fazla Bilgi</Text>
              <Ionicons name="open-outline" size={20} color={COLORS.white} />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorText: {
    marginTop: SPACING.md,
    fontSize: SIZES.lg,
    color: COLORS.gray,
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
  },
  eventImage: {
    width: '100%',
    height: 250,
    backgroundColor: COLORS.gray,
  },
  infoContainer: {
    padding: SPACING.md,
  },
  title: {
    fontSize: SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  restaurantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  restaurantAddress: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    marginTop: 2,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  dateLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textLight,
  },
  dateText: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 2,
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: SIZES.md,
    color: COLORS.textLight,
    lineHeight: 22,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 12,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  linkButtonText: {
    color: COLORS.white,
    fontSize: SIZES.md,
    fontWeight: '600',
  },
});

export default EventDetailScreen;
