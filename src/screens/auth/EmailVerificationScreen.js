import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import authService from '../../services/authService';

const EmailVerificationScreen = ({ route, navigation }) => {
  const { email } = route.params || {};
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      Alert.alert('Hata', 'Lütfen 6 haneli kodu girin');
      return;
    }

    setLoading(true);
    try {
      await authService.verifyEmail(email, code);
      Alert.alert(
        'Başarılı!',
        'Email adresiniz doğrulandı. Giriş yapabilirsiniz.',
        [
          {
            text: 'Tamam',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Hata', error.response?.data?.message || 'Doğrulama başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authService.resendVerification(email);
      Alert.alert('Başarılı', 'Doğrulama kodu tekrar gönderildi');
    } catch (error) {
      Alert.alert('Hata', error.response?.data?.message || 'Kod gönderilemedi');
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="mail-outline" size={80} color="#4CAF50" />
        </View>

        <Text style={styles.title}>Email Doğrulama</Text>
        <Text style={styles.subtitle}>
          {email ? `${email} adresine` : 'Email adresinize'} gönderilen 6 haneli kodu girin
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="123456"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Doğrula</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Kodu almadınız mı? </Text>
          <TouchableOpacity onPress={handleResend} disabled={resending}>
            {resending ? (
              <ActivityIndicator size="small" color="#4CAF50" />
            ) : (
              <Text style={styles.resendLink}>Tekrar Gönder</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.backButtonText}>Giriş Ekranına Dön</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#a5d6a7',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  resendText: {
    color: '#666',
    fontSize: 14,
  },
  resendLink: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 30,
  },
  backButtonText: {
    color: '#666',
    fontSize: 14,
  },
});

export default EmailVerificationScreen;
