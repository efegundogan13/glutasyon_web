import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import { COLORS, SIZES, SPACING, BORDER_RADIUS } from '../config/theme';
import Button from './Button';

const CURRENT_VERSION = '1.0.2'; // app.json version ile senkron
const VERSION_CHECK_KEY = '@app_version_dismissed';
const CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 saat

const UpdateChecker = () => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);

  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      // Son kontrol zamanını al
      const lastCheck = await AsyncStorage.getItem(VERSION_CHECK_KEY);
      const now = Date.now();
      
      // 24 saatten önce kontrol yapıldıysa tekrar kontrol etme
      if (lastCheck && (now - parseInt(lastCheck)) < CHECK_INTERVAL) {
        return;
      }

      try {
        // Backend'den son versiyon bilgisini al
        const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.CHECK_VERSION}`, {
          params: { platform: Platform.OS }
        });
        
        const { latestVersion, updateMessage, features, isForceUpdate } = response.data;

        if (compareVersions(latestVersion, CURRENT_VERSION) > 0) {
          setUpdateInfo({
            version: latestVersion,
            message: updateMessage || 'Yeni özellikler ve performans iyileştirmeleri eklendi!',
            features: features || [],
            isForceUpdate: isForceUpdate || false,
          });
          setShowUpdateModal(true);
        }
      } catch (apiError) {
        // Backend'den cevap gelmezse, sessizce devam et
        console.log('Version API yanıt vermedi, kontrol atlandı');
      }

      // Son kontrol zamanını kaydet
      await AsyncStorage.setItem(VERSION_CHECK_KEY, now.toString());
    } catch (error) {
      console.error('Version check error:', error);
    }
  };

  const compareVersions = (v1, v2) => {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < 3; i++) {
      if (parts1[i] > parts2[i]) return 1;
      if (parts1[i] < parts2[i]) return -1;
    }
    return 0;
  };

  const handleUpdate = () => {
    const storeUrl = Platform.select({
      ios: 'https://apps.apple.com/app/YOUR_APP_ID', // iOS App Store URL
      android: 'https://play.google.com/store/apps/details?id=com.glutasyon.mobile', // Google Play URL
    });

    Linking.openURL(storeUrl).catch(() => {
      console.error('Store URL açılamadı');
    });
  };

  const handleDismiss = async () => {
    if (!updateInfo?.isForceUpdate) {
      setShowUpdateModal(false);
      // Kapatıldı olarak işaretle
      await AsyncStorage.setItem(VERSION_CHECK_KEY, Date.now().toString());
    }
  };

  if (!showUpdateModal || !updateInfo) {
    return null;
  }

  return (
    <Modal
      visible={showUpdateModal}
      transparent
      animationType="fade"
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.iconContainer}>
            <Ionicons name="rocket" size={60} color={COLORS.primary} />
          </View>

          <Text style={styles.title}>Yeni Güncelleme!</Text>
          <Text style={styles.version}>Versiyon {updateInfo.version}</Text>
          <Text style={styles.message}>{updateInfo.message}</Text>

          {updateInfo.features && updateInfo.features.length > 0 && (
            <View style={styles.features}>
              {updateInfo.features.map((feature, index) => (
                <View key={index} style={styles.feature}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          )}

          <Button
            title="Şimdi Güncelle"
            onPress={handleUpdate}
            style={styles.updateButton}
          />

          {!updateInfo.isForceUpdate && (
            <TouchableOpacity onPress={handleDismiss} style={styles.dismissButton}>
              <Text style={styles.dismissText}>Daha Sonra</Text>
            </TouchableOpacity>
          )}

          {updateInfo.isForceUpdate && (
            <Text style={styles.forceUpdateText}>
              Bu güncelleme zorunludur. Uygulamayı kullanmaya devam etmek için güncellemelisiniz.
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modal: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: SIZES.header,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  version: {
    fontSize: SIZES.lg,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  message: {
    fontSize: SIZES.md,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  features: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  featureText: {
    fontSize: SIZES.md,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  updateButton: {
    width: '100%',
    marginBottom: SPACING.md,
  },
  dismissButton: {
    padding: SPACING.sm,
  },
  dismissText: {
    fontSize: SIZES.md,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  forceUpdateText: {
    fontSize: SIZES.sm,
    color: COLORS.danger,
    textAlign: 'center',
    marginTop: SPACING.md,
    fontStyle: 'italic',
  },
});

export default UpdateChecker;
