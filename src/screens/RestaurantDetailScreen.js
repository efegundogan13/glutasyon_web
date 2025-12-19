import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Linking,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import StarRating from 'react-native-star-rating-widget';
import { restaurantService } from '../services/restaurantService';
import { reviewService } from '../services/reviewService';
import { favoriteService } from '../services/favoriteService';
import { eventService } from '../services/eventService';
import { productService } from '../services/productService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { getImageUrl } from '../config/api';
import ReviewCard from '../components/ReviewCard';
import Button from '../components/Button';
import Input from '../components/Input';
import { COLORS, SIZES, SPACING, BORDER_RADIUS } from '../config/theme';
import { openMapsWithDirections } from '../utils/location';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const RestaurantDetailScreen = ({ route, navigation }) => {
  const { restaurantId } = route.params;
  const { user, isRestaurantAdmin } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [events, setEvents] = useState([]);
  const [products, setProducts] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);

  useEffect(() => {
    loadRestaurantData();
  }, [restaurantId]);

  const loadRestaurantData = async () => {
    try {
      const [restaurantData, reviewsData, eventsData, productsData, favoritesData] = await Promise.all([
        restaurantService.getRestaurant(restaurantId),
        reviewService.getReviews(restaurantId),
        eventService.getEvents(restaurantId),
        productService.getProducts(restaurantId),
        favoriteService.getFavorites(),
      ]);

      setRestaurant(restaurantData.restaurant);
      setReviews(reviewsData.reviews || []);
      setEvents(eventsData.events || []);
      setProducts(productsData.products || []);
      
      const isFav = favoritesData.favorites?.some((f) => f.restaurantId === restaurantId);
      setIsFavorite(isFav);
    } catch (error) {
      console.error('Error loading restaurant:', error);
      Alert.alert('Hata', 'Restoran bilgileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    try {
      if (isFavorite) {
        await favoriteService.removeFavorite(restaurantId);
      } else {
        await favoriteService.addFavorite(restaurantId);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      Alert.alert('Hata', 'Favori işlemi yapılamadı');
    }
  };

  const handleSubmitReview = async () => {
    if (!comment.trim()) {
      Alert.alert('Uyarı', 'Lütfen yorum yazın');
      return;
    }

    setSubmittingReview(true);
    try {
      await reviewService.createReview({
        restaurantId,
        rating: Math.round(rating), // Ensure integer value
        comment,
      });
      Alert.alert('Başarılı', 'Yorumunuz onay için gönderildi');
      setShowReviewForm(false);
      setComment('');
      setRating(5);
      loadRestaurantData();
    } catch (error) {
      console.error('Submit review error:', error);
      const errorMessage = error.response?.data?.message || 'Yorum gönderilemedi';
      Alert.alert('Hata', errorMessage);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleApproveReview = async (reviewId) => {
    try {
      await reviewService.approveReview(reviewId);
      Alert.alert('Başarılı', 'Yorum onaylandı');
      loadRestaurantData();
    } catch (error) {
      Alert.alert('Hata', 'Yorum onaylanamadı');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    Alert.alert('Onay', 'Yorumu silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await reviewService.deleteReview(reviewId);
            Alert.alert('Başarılı', 'Yorum silindi');
            loadRestaurantData();
          } catch (error) {
            Alert.alert('Hata', 'Yorum silinemedi');
          }
        },
      },
    ]);
  };

  const canManageReviews = () => {
    return (isRestaurantAdmin() && restaurant?.ownerId === user?.id) || user?.role === 'admin';
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!restaurant) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Restoran bulunamadı</Text>
      </View>
    );
  }

  const approvedReviews = reviews.filter((r) => r.approved);
  const averageRating = approvedReviews.length > 0
    ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: getImageUrl(restaurant.logo) }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.name}>{restaurant.name}</Text>
              <View style={styles.ratingContainer}>
                <StarRating
                  rating={averageRating}
                  onChange={() => {}}
                  starSize={20}
                  color={COLORS.accent}
                  enableSwiping={false}
                />
                <Text style={styles.reviewCount}>
                  ({approvedReviews.length} yorum)
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleFavoriteToggle}>
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={32}
                color={isFavorite ? COLORS.danger : COLORS.gray}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location" size={20} color={COLORS.primary} />
            <Text style={styles.location}>{restaurant.location}</Text>
          </View>

          <TouchableOpacity
            style={styles.directionButton}
            onPress={() => openMapsWithDirections(
              restaurant.latitude,
              restaurant.longitude,
              restaurant.name
            )}
          >
            <Ionicons name="navigate" size={20} color={COLORS.white} />
            <Text style={styles.directionText}>Yol Tarifi Al</Text>
          </TouchableOpacity>

          {restaurant.crossContamination !== undefined && (
            <View style={styles.badge}>
              <Ionicons
                name={restaurant.crossContamination ? 'shield-checkmark' : 'warning'}
                size={24}
                color={restaurant.crossContamination ? COLORS.success : COLORS.warning}
              />
              <Text style={styles.badgeText}>
                {restaurant.crossContamination
                  ? 'Çapraz bulaşa dikkat ediliyor'
                  : 'Çapraz bulaş riski var'}
              </Text>
            </View>
          )}

          {/* Menu PDF */}
          {restaurant.menuPdf && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Menü</Text>
              <TouchableOpacity onPress={() => setShowMenuModal(true)}>
                <Image
                  source={{ uri: getImageUrl(restaurant.menuPdf) }}
                  style={styles.menuImage}
                  resizeMode="contain"
                />
                <View style={styles.menuOverlay}>
                  <Ionicons name="expand" size={32} color={COLORS.white} />
                  <Text style={styles.menuOverlayText}>Menüyü Görüntüle</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Products */}
          {products.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ürünler</Text>
              {products.map((product) => (
                <View key={product.id} style={styles.productItem}>
                  <Text style={styles.productName}>{product.name}</Text>
                  {product.description && (
                    <Text style={styles.productDescription}>{product.description}</Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Events */}
          {events.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Etkinlikler</Text>
              {events.map((event) => (
                <TouchableOpacity 
                  key={event.id} 
                  style={styles.eventItem}
                  onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
                >
                  <View style={styles.eventContent}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventDescription}>{event.description}</Text>
                    {event.endDate && (
                      <Text style={styles.eventDate}>
                        Son Tarih: {new Date(event.endDate).toLocaleDateString('tr-TR')}
                      </Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.primary} style={styles.eventChevron} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Reviews Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Yorumlar</Text>
              {!canManageReviews() && (
                <Button
                  title="Yorum Yap"
                  onPress={() => setShowReviewForm(!showReviewForm)}
                  style={styles.addReviewButton}
                />
              )}
            </View>

            {showReviewForm && (
              <View style={styles.reviewForm}>
                <Text style={styles.formLabel}>Puanınız</Text>
                <StarRating
                  rating={rating}
                  onChange={setRating}
                  starSize={32}
                  color={COLORS.accent}
                  enableHalfStar={false}
                />
                <Input
                  label="Yorumunuz"
                  value={comment}
                  onChangeText={setComment}
                  placeholder="Deneyiminizi paylaşın..."
                  multiline
                  numberOfLines={4}
                />
                <Button
                  title="Gönder"
                  onPress={handleSubmitReview}
                  loading={submittingReview}
                />
              </View>
            )}

            {canManageReviews() ? (
              // Show all reviews for restaurant admin
              reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onApprove={handleApproveReview}
                  onDelete={handleDeleteReview}
                  canManage={true}
                />
              ))
            ) : (
              // Show only approved reviews for regular users
              approvedReviews.map((review) => (
                <ReviewCard key={review.id} review={review} canManage={false} />
              ))
            )}

            {reviews.length === 0 && (
              <Text style={styles.noReviews}>Henüz yorum yapılmamış</Text>
            )}
          </View>

          {canManageReviews() && (
            <View style={styles.adminActions}>
              <Button
                title="Restoran Yönetimi"
                onPress={() => navigation.navigate('RestaurantManagement', { restaurantId })}
                style={styles.adminButton}
              />
              <Button
                title="Kampanya Yönetimi"
                onPress={() => navigation.navigate('ManageCampaigns')}
                style={styles.adminButton}
              />
              <Button
                title="Etkinlik Yönetimi"
                onPress={() => navigation.navigate('ManageEvents')}
                style={styles.adminButton}
              />
              <Button
                title="Ürün Yönetimi"
                onPress={() => navigation.navigate('ProductManagement', { restaurantId })}
                style={styles.adminButton}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Menu PDF Modal */}
      {restaurant?.menuPdf && (
        <Modal
          visible={showMenuModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowMenuModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Menü</Text>
              <TouchableOpacity onPress={() => setShowMenuModal(false)}>
                <Ionicons name="close" size={32} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            <ScrollView 
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalContent}
              maximumZoomScale={3}
              minimumZoomScale={1}
            >
              <Image
                source={{ uri: getImageUrl(restaurant.menuPdf) }}
                style={styles.modalMenuImage}
                resizeMode="contain"
              />
            </ScrollView>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  logoContainer: {
    width: '100%',
    height: 300,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  titleContainer: {
    flex: 1,
  },
  name: {
    fontSize: SIZES.header,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewCount: {
    fontSize: SIZES.md,
    color: COLORS.textLight,
    marginLeft: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  location: {
    fontSize: SIZES.lg,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  directionButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  directionText: {
    color: COLORS.white,
    fontSize: SIZES.lg,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badgeText: {
    fontSize: SIZES.md,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    fontWeight: '500',
  },
  section: {
    marginTop: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: SIZES.title,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  addReviewButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  productItem: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  productName: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  productDescription: {
    fontSize: SIZES.md,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  eventItem: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventContent: {
    flex: 1,
  },
  eventChevron: {
    marginLeft: SPACING.sm,
  },
  eventTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  eventDescription: {
    fontSize: SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  eventDate: {
    fontSize: SIZES.sm,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
  menuImage: {
    width: '100%',
    height: 400,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.lightGray,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuOverlayText: {
    color: COLORS.white,
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    paddingTop: SPACING.xl,
  },
  modalTitle: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  modalScrollView: {
    flex: 1,
  },
  modalContent: {
    padding: SPACING.md,
  },
  modalMenuImage: {
    width: SCREEN_WIDTH - (SPACING.md * 2),
    height: SCREEN_HEIGHT * 1.5,
  },
  reviewForm: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  formLabel: {
    fontSize: SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    fontWeight: '500',
  },
  noReviews: {
    fontSize: SIZES.md,
    color: COLORS.textLight,
    textAlign: 'center',
    padding: SPACING.lg,
  },
  adminActions: {
    marginTop: SPACING.lg,
  },
  adminButton: {
    marginBottom: SPACING.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: SIZES.lg,
    color: COLORS.textLight,
  },
});

export default RestaurantDetailScreen;
