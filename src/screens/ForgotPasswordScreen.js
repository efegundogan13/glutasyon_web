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
import { authService } from '../services/authService';
import Button from '../components/Button';
import Input from '../components/Input';
import { COLORS, SIZES, SPACING } from '../config/theme';
import { validateEmail } from '../utils/validation';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    if (!email) {
      setError('E-posta adresi gerekli');
      return false;
    }
    if (!validateEmail(email)) {
      setError('Geçerli bir e-posta adresi girin');
      return false;
    }
    setError('');
    return true;
  };

  const handleResetPassword = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setLoading(false);
      Alert.alert(
        'Kod Gönderildi',
        'E-posta adresinize şifre sıfırlama kodu gönderildi',
        [
          {
            text: 'Tamam',
            onPress: () => navigation.navigate('ResetPassword', { email }),
          },
        ]
      );
    } catch (err) {
      setLoading(false);
      Alert.alert('Hata', err.response?.data?.message || 'Bir hata oluştu');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.form}>
            <Text style={styles.title}>Şifremi Unuttum</Text>
            <Text style={styles.description}>
              E-posta adresinizi girin, size şifre sıfırlama linki gönderelim.
            </Text>

            <Input
              label="E-posta"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                setError('');
              }}
              placeholder="ornek@email.com"
              keyboardType="email-address"
              error={error}
            />

            <Button
              title="Sıfırlama Linki Gönder"
              onPress={handleResetPassword}
              loading={loading}
              style={styles.submitButton}
            />

            <Button
              title="Giriş Sayfasına Dön"
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
  title: {
    fontSize: SIZES.header,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: SIZES.md,
    color: COLORS.textLight,
    marginBottom: SPACING.lg,
    textAlign: 'center',
    lineHeight: 20,
  },
  submitButton: {
    marginTop: SPACING.md,
  },
  backButton: {
    marginTop: SPACING.md,
  },
});

export default ForgotPasswordScreen;
