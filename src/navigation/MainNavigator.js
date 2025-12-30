import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { COLORS } from '../config/theme';

// Navigators
import TabNavigator from './TabNavigator';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

// Screens
import RestaurantDetailScreen from '../screens/RestaurantDetailScreen';
import RestaurantApplicationScreen from '../screens/RestaurantApplicationScreen';
import RestaurantMapScreen from '../screens/RestaurantMapScreen';
import AddRecipeScreen from '../screens/AddRecipeScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import AdminRestaurantsScreen from '../screens/AdminRestaurantsScreen';
import EventManagementScreen from '../screens/EventManagementScreen';
import ProductManagementScreen from '../screens/ProductManagementScreen';
import RestaurantManagementScreen from '../screens/RestaurantManagementScreen';
import AddProductScreen from '../screens/AddProductScreen';
import CampaignDetailScreen from '../screens/CampaignDetailScreen';
import AddCampaignScreen from '../screens/AddCampaignScreen';
import ManageCampaignsScreen from '../screens/ManageCampaignsScreen';
import ManageEventsScreen from '../screens/ManageEventsScreen';
import AddEventScreen from '../screens/AddEventScreen';
import EventDetailScreen from '../screens/EventDetailScreen';

const Stack = createStackNavigator();

const MainNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RestaurantDetail"
        component={RestaurantDetailScreen}
        options={{ title: 'Restoran Detayı' }}
      />
      <Stack.Screen
        name="RestaurantApplication"
        component={RestaurantApplicationScreen}
        options={{ title: 'Restoran Başvurusu' }}
      />
      <Stack.Screen
        name="RestaurantMap"
        component={RestaurantMapScreen}
        options={{ title: 'Harita' }}
      />
      <Stack.Screen
        name="AddRecipe"
        component={AddRecipeScreen}
        options={{ title: 'Tarif Ekle' }}
      />
      <Stack.Screen
        name="RecipeDetail"
        component={RecipeDetailScreen}
        options={{ title: 'Tarif Detayı' }}
      />
      <Stack.Screen
        name="AdminRestaurants"
        component={AdminRestaurantsScreen}
        options={{ title: 'Başvuru Yönetimi' }}
      />
      <Stack.Screen
        name="EventManagement"
        component={EventManagementScreen}
        options={{ title: 'Etkinlik Yönetimi' }}
      />
      <Stack.Screen
        name="ProductManagement"
        component={ProductManagementScreen}
        options={{ title: 'Ürün Yönetimi' }}
      />
      <Stack.Screen
        name="RestaurantManagement"
        component={RestaurantManagementScreen}
        options={{ title: 'Restoran Yönetimi' }}
      />
      <Stack.Screen
        name="AddProduct"
        component={AddProductScreen}
        options={{ title: 'Ürün Ekle' }}
      />
      <Stack.Screen
        name="CampaignDetail"
        component={CampaignDetailScreen}
        options={{ title: 'Kampanya Detayı' }}
      />
      <Stack.Screen
        name="AddCampaign"
        component={AddCampaignScreen}
        options={{ title: 'Kampanya Ekle' }}
      />
      <Stack.Screen
        name="ManageCampaigns"
        component={ManageCampaignsScreen}
        options={{ title: 'Kampanyalarım' }}
      />
      <Stack.Screen
        name="ManageEvents"
        component={ManageEventsScreen}
        options={{ title: 'Etkinliklerim' }}
      />
      <Stack.Screen
        name="AddEvent"
        component={AddEventScreen}
        options={{ title: 'Etkinlik Ekle' }}
      />
      <Stack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{ title: 'Etkinlik Detayı' }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: 'Giriş Yap' }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: 'Kayıt Ol' }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ title: 'Şifremi Unuttum' }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;
