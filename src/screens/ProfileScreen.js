import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { favoriteService } from '../services/favoriteService';
import { restaurantService } from '../services/restaurantService';
import { recipeService } from '../services/recipeService';
import { reviewService } from '../services/reviewService';
import LoadingSpinner from '../components/LoadingSpinner';
import RestaurantCard from '../components/RestaurantCard';
import RecipeCard from '../components/RecipeCard';
import ReviewCard from '../components/ReviewCard';
import Button from '../components/Button';
import { COLORS, SIZES, SPACING, BORDER_RADIUS } from '../config/theme';

const ProfileScreen = ({ navigation }) => {
  const { user, logout, isAdmin, isRestaurantAdmin, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('favorites'); // favorites, reviews, recipes
  const [favorites, setFavorites] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [myRecipes, setMyRecipes] = useState([]);
  const [myRestaurants, setMyRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [activeTab, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && isRestaurantAdmin()) {
      loadMyRestaurants();
    }
  }, [isAuthenticated]);

  const loadMyRestaurants = async () => {
    try {
      const data = await restaurantService.getMyRestaurants();
      console.log('📍 My Restaurants Response:', JSON.stringify(data, null, 2));
      // Service artık direkt array döndürüyor (response.data.restaurants || response.data)
      const restaurants = Array.isArray(data) ? data : (data.restaurants || []);
      console.log('📍 My Restaurants Array:', restaurants.length, 'restaurants');
      setMyRestaurants(restaurants);
    } catch (error) {
      console.error('Error loading my restaurants:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'favorites') {
        const data = await favoriteService.getFavorites();
        setFavorites(data.favorites || []);
      } else if (activeTab === 'reviews') {
        const data = await reviewService.getMyReviews();
        setReviews(data.reviews || []);
      } else if (activeTab === 'recipes') {
        const data = await recipeService.getMyRecipes();
        setMyRecipes(data.recipes || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Çıkış yapmak istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Hesabı Sil',
      'Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve tüm verileriniz kalıcı olarak silinecektir.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Hesabı Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              // Backend'e DELETE isteği gönder
              const API_URL = 'https://glutasyon-backend-production.up.railway.app/api';
              const token = await AsyncStorage.getItem('token');
              
              const response = await fetch(`${API_URL}/auth/me`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });

              if (response.ok) {
                Alert.alert('Başarılı', 'Hesabınız silindi', [
                  {
                    text: 'Tamam',
                    onPress: logout,
                  },
                ]);
              } else {
                throw new Error('Hesap silinemedi');
              }
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert('Hata', 'Hesap silinirken bir hata oluştu');
            }
          },
        },
      ]
    );
  };

  const handleSupportPress = () => {
    const email = 'glutasyon@gmail.com';
    const subject = 'Glutasyon Uygulaması Destek Talebi';
    const body = `Merhaba Glutasyon Destek Ekibi,\n\nAdım: ${user?.name}\nE-posta: ${user?.email}\n\nSorun/Talebim:\n\n`;
    
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.canOpenURL(mailtoUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(mailtoUrl);
        } else {
          Alert.alert(
            'Destek İletişim',
            `E-posta uygulaması bulunamadı.\n\nLütfen ${email} adresine e-posta gönderin.`,
            [
              { text: 'Tamam' },
              {
                text: 'E-posta Adresini Kopyala',
                onPress: () => {
                  // E-posta adresini göster
                  Alert.alert('Destek E-postası', email);
                }
              }
            ]
          );
        }
      })
      .catch((err) => {
        console.error('Error opening email:', err);
        Alert.alert('Hata', 'E-posta uygulaması açılamadı');
      });
  };

  const handleDeleteRecipe = async (recipeId) => {
    Alert.alert('Sil', 'Tarifi silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await recipeService.deleteRecipe(recipeId);
            Alert.alert('Başarılı', 'Tarif silindi');
            loadData();
          } catch (error) {
            Alert.alert('Hata', 'Tarif silinemedi');
          }
        },
      },
    ]);
  };

  const handleDeleteReview = async (reviewId) => {
    Alert.alert('Sil', 'Yorumu silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await reviewService.deleteReview(reviewId);
            Alert.alert('Başarılı', 'Yorum silindi');
            loadData();
          } catch (error) {
            Alert.alert('Hata', 'Yorum silinemedi');
          }
        },
      },
    ]);
  };

  const handleRemoveFavorite = async (restaurantId) => {
    try {
      await favoriteService.removeFavorite(restaurantId);
      loadData();
    } catch (error) {
      Alert.alert('Hata', 'Favori kaldırılamadı');
    }
  };

  const renderContent = () => {
    if (loading) {
      return <LoadingSpinner />;
    }

    if (activeTab === 'favorites') {
      if (favorites.length === 0) {
        return (
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color={COLORS.gray} />
            <Text style={styles.emptyText}>Henüz favori restoranınız yok</Text>
          </View>
        );
      }
      return favorites.map((fav) => (
        <RestaurantCard
          key={fav.restaurant.id}
          restaurant={fav.restaurant}
          onPress={() =>
            navigation.navigate('RestaurantDetail', {
              restaurantId: fav.restaurant.id,
            })
          }
          onFavoritePress={() => handleRemoveFavorite(fav.restaurant.id)}
          isFavorite={true}
        />
      ));
    }

    if (activeTab === 'reviews') {
      if (reviews.length === 0) {
        return (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubble-outline" size={64} color={COLORS.gray} />
            <Text style={styles.emptyText}>Henüz yorum yapmadınız</Text>
          </View>
        );
      }
      return reviews.map((review) => (
        <View key={review.id} style={styles.myReviewItem}>
          {review.restaurant && (
            <TouchableOpacity
              style={styles.reviewRestaurantHeader}
              onPress={() =>
                navigation.navigate('RestaurantDetail', {
                  restaurantId: review.restaurant.id,
                })
              }
            >
              <Ionicons name="restaurant" size={20} color={COLORS.primary} />
              <Text style={styles.reviewRestaurantName}>
                {review.restaurant.name}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          )}
          <ReviewCard review={review} canManage={true} onDelete={handleDeleteReview} />
        </View>
      ));
    }

    if (activeTab === 'recipes') {
      if (myRecipes.length === 0) {
        return (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color={COLORS.gray} />
            <Text style={styles.emptyText}>Henüz tarif eklemediniz</Text>
            <Button
              title="İlk Tarifini Ekle"
              onPress={() => navigation.navigate('AddRecipe')}
              style={styles.addButton}
            />
          </View>
        );
      }
      return myRecipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          onPress={() =>
            navigation.navigate('RecipeDetail', { recipeId: recipe.id })
          }
          onDelete={handleDeleteRecipe}
          showActions={true}
        />
      ));
    }
  };

  // Giriş yapmamışsa login ekranını göster
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loginPrompt}>
          <Ionicons name="person-circle-outline" size={80} color={COLORS.primary} />
          <Text style={styles.loginPromptTitle}>Giriş Yapın</Text>
          <Text style={styles.loginPromptText}>
            Profil özelliklerini kullanmak için giriş yapmanız gerekmektedir.
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.name}>{user?.name}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            {isAdmin() && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Ana Admin</Text>
              </View>
            )}
            {isRestaurantAdmin() && (
              <View style={[styles.badge, styles.restaurantBadge]}>
                <Text style={styles.badgeText}>Restoran Yöneticisi</Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={28} color={COLORS.danger} />
        </TouchableOpacity>
      </View>

      {/* Destek Hattı */}
      <TouchableOpacity style={styles.supportSection} onPress={handleSupportPress}>
        <View style={styles.supportContent}>
          <View style={styles.supportIconContainer}>
            <Ionicons name="help-circle" size={28} color={COLORS.primary} />
          </View>
          <View style={styles.supportText}>
            <Text style={styles.supportTitle}>Destek Hattı</Text>
            <Text style={styles.supportEmail}>glutasyon@gmail.com</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color={COLORS.textLight} />
      </TouchableOpacity>

      {/* Glutasyon Hakkında */}
      <TouchableOpacity 
        style={styles.aboutSection} 
        onPress={() => {
          Alert.alert(
            'Glutasyon Hakkında',
            'Glutasyon, glütensiz beslenme ihtiyacı olan bireylerin güvenle yemek yiyebilecekleri restoranları bulmasını ve glütensiz tarifler keşfetmesini sağlayan bir platformdur.\n\n' +
            '🔸 Sorumluluk Reddi\n\n' +
            'Platformumuzda yer alan restoran bilgileri, menü içerikleri ve glütensiz seçenekler restoran sahipleri tarafından sağlanmaktadır. ' +
            'Glutasyon, restoran menülerinin içerik doğruluğunu, çapraz bulaşma risklerini ve glütensiz beyanlarının kesinliğini garanti etmez.\n\n' +
            'Çölyak hastalığı veya glüten hassasiyeti olan kullanıcılarımız, restoranlarda sipariş vermeden önce mutlaka personelle iletişime geçmeli, ' +
            'malzeme içeriklerini teyit etmeli ve çapraz bulaşma riski hakkında bilgi almalıdır.\n\n' +
            '🔸 Gizlilik ve Güvenlik\n\n' +
            'Kullanıcı verileriniz güvenli sunucularda saklanır ve üçüncü taraflarla paylaşılmaz. Hesabınızı istediğiniz zaman silebilirsiniz.\n\n' +
            '📱 Versiyon: 1.0.2',
            [{ text: 'Tamam' }]
          );
        }}
      >
        <View style={styles.supportContent}>
          <View style={styles.supportIconContainer}>
            <Ionicons name="information-circle" size={28} color={COLORS.primary} />
          </View>
          <View style={styles.supportText}>
            <Text style={styles.supportTitle}>Glutasyon Hakkında</Text>
            <Text style={styles.supportEmail}>Uygulama bilgileri ve sorumluluk reddi</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color={COLORS.textLight} />
      </TouchableOpacity>

      {/* Hesabı Sil */}
      <TouchableOpacity style={styles.deleteAccountSection} onPress={handleDeleteAccount}>
        <View style={styles.supportContent}>
          <View style={[styles.supportIconContainer, styles.deleteIconContainer]}>
            <Ionicons name="trash-outline" size={28} color={COLORS.danger} />
          </View>
          <View style={styles.supportText}>
            <Text style={[styles.supportTitle, styles.deleteText]}>Hesabı Sil</Text>
            <Text style={styles.deleteSubtext}>Hesabınızı kalıcı olarak silin</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color={COLORS.danger} />
      </TouchableOpacity>

      {isAdmin() && (
        <View style={styles.adminSection}>
          <Button
            title="Restoran Başvurularını Yönet"
            onPress={() => navigation.navigate('AdminRestaurants')}
            style={styles.adminButton}
          />
        </View>
      )}

      {isRestaurantAdmin() && myRestaurants.length > 0 && (
        <View style={styles.adminSection}>
          <Text style={styles.sectionTitle}>Restoranlarım</Text>
          {myRestaurants.map((restaurant) => (
            <View key={restaurant.id} style={styles.restaurantItem}>
              <Text style={styles.restaurantName}>{restaurant.name}</Text>
              <View style={styles.restaurantActions}>
                <Button
                  title="Yönet"
                  onPress={() =>
                    navigation.navigate('RestaurantManagement', {
                      restaurantId: restaurant.id,
                    })
                  }
                  variant="secondary"
                  style={styles.restaurantActionButton}
                />
                <Button
                  title="Detay"
                  onPress={() =>
                    navigation.navigate('RestaurantDetail', {
                      restaurantId: restaurant.id,
                    })
                  }
                  style={styles.restaurantActionButton}
                />
              </View>
            </View>
          ))}
        </View>
      )}

      {!isAdmin() && (
        <View style={styles.applicationSection}>
          <Button
            title={isRestaurantAdmin() ? "Yeni Restoran Ekle" : "Restoran Başvurusu Yap"}
            onPress={() => navigation.navigate('RestaurantApplication')}
            variant="secondary"
            style={styles.applicationButton}
          />
        </View>
      )}

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
          onPress={() => setActiveTab('favorites')}
        >
          <Ionicons
            name="heart"
            size={24}
            color={activeTab === 'favorites' ? COLORS.primary : COLORS.gray}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'favorites' && styles.activeTabText,
            ]}
          >
            Favoriler
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
          onPress={() => setActiveTab('reviews')}
        >
          <Ionicons
            name="chatbubble"
            size={24}
            color={activeTab === 'reviews' ? COLORS.primary : COLORS.gray}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'reviews' && styles.activeTabText,
            ]}
          >
            Yorumlar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'recipes' && styles.activeTab]}
          onPress={() => setActiveTab('recipes')}
        >
          <Ionicons
            name="document-text"
            size={24}
            color={activeTab === 'recipes' ? COLORS.primary : COLORS.gray}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'recipes' && styles.activeTabText,
            ]}
          >
            Tariflerim
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>{renderContent()}</ScrollView>
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
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: SIZES.title,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  email: {
    fontSize: SIZES.md,
    color: COLORS.textLight,
    marginTop: 2,
  },
  badge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
    marginTop: SPACING.xs,
  },
  restaurantBadge: {
    backgroundColor: COLORS.secondary,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: SIZES.sm,
    fontWeight: '600',
  },
  supportSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  supportContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  supportIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  supportText: {
    flex: 1,
  },
  supportTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  supportEmail: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  aboutSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteAccountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  deleteIconContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  deleteText: {
    color: COLORS.danger,
  },
  deleteSubtext: {
    fontSize: SIZES.sm,
    color: COLORS.textLight,
  },
  adminSection: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  adminButton: {
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  restaurantItem: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  restaurantName: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  restaurantActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  restaurantActionButton: {
    flex: 1,
    marginBottom: 0,
    paddingVertical: SPACING.sm,
  },
  restaurantButton: {
    marginBottom: SPACING.sm,
  },
  applicationSection: {
    padding: SPACING.md,
    backgroundColor: COLORS.lightGray,
  },
  applicationButton: {
    marginBottom: 0,
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
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  emptyText: {
    fontSize: SIZES.lg,
    color: COLORS.textLight,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  myReviewItem: {
    marginBottom: SPACING.md,
  },
  reviewRestaurantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    padding: SPACING.sm,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
    marginBottom: -SPACING.xs,
  },
  reviewRestaurantName: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  addButton: {
    marginTop: SPACING.lg,
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

export default ProfileScreen;
