import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { colors, fonts } from '../../theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      let msg = 'Error al iniciar sesión';
      if (error.code === 'auth/user-not-found') msg = 'Usuario no encontrado';
      if (error.code === 'auth/wrong-password') msg = 'Contraseña incorrecta';
      if (error.code === 'auth/invalid-email') msg = 'Email inválido';
      if (error.code === 'auth/invalid-credential') msg = 'Credenciales inválidas';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>

          {/* Logo */}
          <View style={{ alignItems: 'center', marginBottom: 48 }}>
            <Image
  source={require('../../../assets/futhub-icon.png')}
  style={{ width: 100, height: 100, borderRadius: 22, marginBottom: 16 }}
  resizeMode="cover"
/>
            <Text style={{ color: colors.textPrimary, fontFamily: fonts.extrabold, fontSize: 32, letterSpacing: -1 }}>
              FutHub
            </Text>
            <Text style={{ color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 14, marginTop: 4 }}>
              Tu hub de fútbol con IA
            </Text>
          </View>

          {/* Inputs */}
          <View style={{ gap: 12, marginBottom: 24 }}>
            <View style={{
              backgroundColor: colors.card, borderRadius: 12,
              borderWidth: 0.5, borderColor: colors.cardBorder,
              paddingHorizontal: 16, paddingVertical: 14,
            }}>
              <Text style={{ color: colors.textTertiary, fontFamily: fonts.regular, fontSize: 11, marginBottom: 4 }}>
                CORREO ELECTRÓNICO
              </Text>
              <TextInput
                style={{ color: colors.textPrimary, fontFamily: fonts.regular, fontSize: 15 }}
                placeholder="tu@email.com"
                placeholderTextColor={colors.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={{
              backgroundColor: colors.card, borderRadius: 12,
              borderWidth: 0.5, borderColor: colors.cardBorder,
              paddingHorizontal: 16, paddingVertical: 14,
            }}>
              <Text style={{ color: colors.textTertiary, fontFamily: fonts.regular, fontSize: 11, marginBottom: 4 }}>
                CONTRASEÑA
              </Text>
              <TextInput
                style={{ color: colors.textPrimary, fontFamily: fonts.regular, fontSize: 15 }}
                placeholder="••••••••"
                placeholderTextColor={colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          {/* Login button */}
          <TouchableOpacity onPress={handleLogin} disabled={loading}>
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientMid]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={{
                paddingVertical: 16, borderRadius: 12,
                alignItems: 'center', marginBottom: 16,
              }}
            >
              {loading ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={{ color: colors.background, fontFamily: fonts.bold, fontSize: 16 }}>
                  Iniciar sesión
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Register link */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={{ alignItems: 'center' }}
          >
            <Text style={{ color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 14 }}>
              ¿No tienes cuenta?{' '}
              <Text style={{ color: colors.live, fontFamily: fonts.semibold }}>
                Regístrate
              </Text>
            </Text>
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
