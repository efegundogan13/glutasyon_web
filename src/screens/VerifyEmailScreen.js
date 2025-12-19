import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from '../components/Button';
import Input from '../components/Input';
import { COLORS, SIZES, SPACING } from '../config/theme';
import { API_BASE_URL } from '../config/api';

const VerifyEmailScreen = ({ navigation, route }) => {
  const [code, setCode] = useState('');
  const [email, setEmail] = useState(route.params?.email || '');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(t => t - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      Alert.alert('Hata', 'Lütfen 6 haneli doğrulama kodunu girin');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-email`, {
        email,
        code,
      });

      Alert.alert('Başarılı', response.data.message, [
        {
          text: 'Giriş Yap',
          onPress: () => navigation.navigate('Login'),
        },
      ]);
    } catch (error) {
      Alert.alert(
        'Hata',
        error.response?.data?.message || 'Doğrulama başarısız'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/resend-verification`, {
        email,
      });

      Alert.alert('Başarılı', response.data.message);
      setTimer(60);
      setCanResend(false);
    } catch (error) {
      Alert.alert(
        'Hata',
        error.response?.data?.message || 'Kod gönderilemedi'
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Email Doğrulama</Text>
            <Text style={styles.description}>
              {email} adresine gönderilen 6 haneli doğrulama kodunu girin
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Doğrulama Kodu"
              value={code}
              onChangeText={setCode}
              placeholder="123456"
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />

            <Button
              title="Doğrula"
              onPress={handleVerify}
              loading={loading}
              style={styles.verifyButton}
            />

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>
                Kod almadınız mı?
              </Text>
              {canResend ? (
                <Button
                  title="Tekrar Gönder"
                  onPress={handleResend}
                  loading={resendLoading}
                  variant="outline"
                  style={styles.resendButton}
                />
              ) : (
                <Text style={styles.timerText}>
                  {timer} saniye sonra tekrar gönderebilirsiniz
                </Text>
              )}
            </View>

            <Button
              title="Giriş Ekranına Dön"
              onPress={() => navigation.navigate('Login')}
              variant="outline"
              style={styles.backButton}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: SIZES.header,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: SIZES.md,
    color: COLORS.textLight,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
  },
  form: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  verifyButton: {
    marginTop: SPACING.md,
  },
  resendContainer: {
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  resendText: {
    fontSize: SIZES.md,
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
  },
  resendButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  timerText: {
    fontSize: SIZES.sm,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  backButton: {
    marginTop: SPACING.lg,
  },
});

export default VerifyEmailScreen;
