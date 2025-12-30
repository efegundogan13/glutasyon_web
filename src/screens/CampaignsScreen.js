import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { campaignService } from '../services/campaignService';
import { getImageUrl } from '../config/api';
import { COLORS, SIZES, SPACING } from '../config/theme';

const CampaignsScreen = ({ navigation }) => {
  const { isAuthenticated } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Giriş yapmamışsa login ekranına yönlendir
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loginPrompt}>
          <Ionicons name="pricetag-outline" size={80} color={COLORS.primary} />
          <Text style={styles.loginPromptTitle}>Kampanyaları Görüntüle</Text>
          <Text style={styles.loginPromptText}>
            Kampanyaları görmek için giriş yapmanız gerekmektedir.
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

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const data = await campaignService.getCampaigns();
      setCampaigns(data);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCampaigns();
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const renderCampaign = ({ item }) => (
    <TouchableOpacity
      style={styles.campaignCard}
      onPress={() => navigation.navigate('CampaignDetail', { campaign: item })}
    >
      <View style={styles.cardContent}>
        {item.image && (
          <Image
            source={{ uri: getImageUrl(item.image) }}
            style={styles.campaignImage}
          />
        )}
        
        <View style={styles.campaignInfo}>
          <Text style={styles.campaignTitle} numberOfLines={2}>
            {item.title}
          </Text>
          
          <View style={styles.restaurantRow}>
            {item.Restaurant?.logo && (
              <Image
                source={{ uri: getImageUrl(item.Restaurant.logo) }}
                style={styles.restaurantLogo}
              />
            )}
            <Text style={styles.restaurantName} numberOfLines={1}>
              {item.Restaurant?.name || 'Restoran'}
            </Text>
          </View>

          <Text style={styles.campaignDescription} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.textLight} />
            <Text style={styles.dateText}>
              {formatDate(item.startDate)}
              {item.endDate && ` - ${formatDate(item.endDate)}`}
            </Text>
          </View>

          {item.externalUrl && (
            <View style={styles.linkBadge}>
              <Ionicons name="link-outline" size={14} color={COLORS.primary} />
              <Text style={styles.linkText}>Kampanya Linki</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kampanyalar</Text>
        <Ionicons name="megaphone" size={24} color={COLORS.primary} />
      </View>

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
            <Text style={styles.emptyText}>Henüz kampanya bulunmuyor</Text>
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
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: SIZES.header,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: SPACING.md,
  },
  campaignCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    flexDirection: 'row',
  },
  campaignImage: {
    width: 120,
    height: 120,
    backgroundColor: COLORS.background,
  },
  campaignInfo: {
    flex: 1,
    padding: SPACING.md,
  },
  campaignTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  restaurantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  restaurantLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: SPACING.xs,
  },
  restaurantName: {
    fontSize: SIZES.md,
    color: COLORS.textLight,
    flex: 1,
  },
  campaignDescription: {
    fontSize: SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  dateText: {
    fontSize: SIZES.sm,
    color: COLORS.textLight,
    marginLeft: SPACING.xs,
  },
  linkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: SPACING.xs,
  },
  linkText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    marginLeft: 4,
    fontWeight: '600',
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

export default CampaignsScreen;
