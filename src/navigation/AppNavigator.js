import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import MainNavigator from './MainNavigator';
import LoadingSpinner from '../components/LoadingSpinner';

const AppNavigator = () => {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  // Kullanıcılar giriş yapmadan da uygulamayı kullanabilir
  // Sadece profil ve belirli özelliklere erişmek için giriş gerekir
  return (
    <NavigationContainer>
      <MainNavigator />
    </NavigationContainer>
  );
};

export default AppNavigator;
