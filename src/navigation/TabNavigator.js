import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../config/theme';

// Screens
import RestaurantsScreen from '../screens/RestaurantsScreen';
import RecipesScreen from '../screens/RecipesScreen';
import CampaignsScreen from '../screens/CampaignsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'RestaurantsTab') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'CampaignsTab') {
            iconName = focused ? 'megaphone' : 'megaphone-outline';
          } else if (route.name === 'RecipesTab') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="RestaurantsTab"
        component={RestaurantsScreen}
        options={{
          title: 'Restoranlar',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="CampaignsTab"
        component={CampaignsScreen}
        options={{
          title: 'Kampanyalar',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="RecipesTab"
        component={RecipesScreen}
        options={{
          title: 'Tarifler',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: 'Profil',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
