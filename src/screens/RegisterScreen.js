import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import { COLORS, SIZES, SPACING } from '../config/theme';
import { validateEmail, validatePassword } from '../utils/validation';

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const updateFormData = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user types
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Ad Soyad gerekli';
    }

    if (!formData.email) {
      newErrors.email = 'E-posta adresi gerekli';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    }

    if (!formData.password) {
      newErrors.password = 'Şifre gerekli';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Şifre en az 6 karakter olmalı';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });
    setLoading(false);

    if (result.success) {
      Alert.alert(
        'Kayıt Başarılı',
        'Lütfen e-posta adresinize gönderilen doğrulama kodunu girin',
        [
          {
            text: 'Tamam',
            onPress: () => navigation.navigate('VerifyEmail', { 
              email: formData.email 
            }),
          },
        ]
      );
    } else {
      Alert.alert('Hata', result.error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.form}>
            <Text style={styles.title}>Kayıt Ol</Text>
            <Text style={styles.description}>
              Glutensiz yaşam topluluğumuza katılın
            </Text>

            <Input
              label="Ad Soyad"
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
              placeholder="Adınız ve soyadınız"
              autoCapitalize="words"
              error={errors.name}
            />

            <Input
              label="E-posta"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              placeholder="ornek@email.com"
              keyboardType="email-address"
              error={errors.email}
            />

            <Input
              label="Şifre"
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              placeholder="En az 6 karakter"
              secureTextEntry
              error={errors.password}
            />

            <Input
              label="Şifre Tekrar"
              value={formData.confirmPassword}
              onChangeText={(value) => updateFormData('confirmPassword', value)}
              placeholder="Şifrenizi tekrar girin"
              secureTextEntry
              error={errors.confirmPassword}
            />

            <Button
              title="Kayıt Ol"
              onPress={handleRegister}
              loading={loading}
              style={styles.registerButton}
            />

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Zaten hesabınız var mı? </Text>
              <Button
                title="Giriş Yap"
                onPress={() => navigation.navigate('Login')}
                variant="outline"
                style={styles.loginButton}
              />
            </View>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.lg,
    justifyContent: 'center',
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
  },
  registerButton: {
    marginTop: SPACING.md,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  loginText: {
    fontSize: SIZES.md,
    color: COLORS.textLight,
  },
  loginButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
});

export default RegisterScreen;
