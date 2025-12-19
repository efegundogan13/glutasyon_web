import React, { useState } from 'react';
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
import Button from '../components/Button';
import Input from '../components/Input';
import { COLORS, SIZES, SPACING } from '../config/theme';
import { validatePassword } from '../utils/validation';
import { API_BASE_URL } from '../config/api';

const ResetPasswordScreen = ({ navigation, route }) => {
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const email = route.params?.email || '';

  const validate = () => {
    const newErrors = {};

    if (!code || code.length !== 6) {
      newErrors.code = '6 haneli doğrulama kodu gerekli';
    }

    if (!password) {
      newErrors.password = 'Yeni şifre gerekli';
    } else if (!validatePassword(password)) {
      newErrors.password = 'Şifre en az 6 karakter olmalı';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        email,
        code,
        password,
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
        error.response?.data?.message || 'Şifre sıfırlama başarısız'
      );
    } finally {
      setLoading(false);
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
            <Text style={styles.title}>Şifre Sıfırla</Text>
            <Text style={styles.description}>
              {email} adresine gönderilen kodu girin ve yeni şifrenizi belirleyin
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
              error={errors.code}
            />

            <Input
              label="Yeni Şifre"
              value={password}
              onChangeText={setPassword}
              placeholder="Yeni şifrenizi girin"
              secureTextEntry
              error={errors.password}
            />

            <Input
              label="Yeni Şifre (Tekrar)"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Şifrenizi tekrar girin"
              secureTextEntry
              error={errors.confirmPassword}
            />

            <Button
              title="Şifreyi Sıfırla"
              onPress={handleResetPassword}
              loading={loading}
              style={styles.resetButton}
            />

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
  resetButton: {
    marginTop: SPACING.md,
  },
  backButton: {
    marginTop: SPACING.lg,
  },
});

export default ResetPasswordScreen;
