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
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      let msg = 'Login failed';
      if (error.code === 'auth/user-not-found') msg = 'User not found';
      if (error.code === 'auth/wrong-password') msg = 'Wrong password';
      if (error.code === 'auth/invalid-email') msg = 'Invalid email';
      if (error.code === 'auth/invalid-credential') msg = 'Invalid credentials';
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
        <View style={{ flex: 1, padding: 24 }}>

          {/* Top section */}
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

            {/* Logo */}
            <View style={{ alignItems: 'center', marginBottom: 40 }}>
              <Image
                source={require('../../../assets/futhub-icon.png')}
                style={{ width: 90, height: 90, borderRadius: 22, marginBottom: 20 }}
                resizeMode="cover"
              />
              <Text style={{ color: colors.textPrimary, fontFamily: fonts.extrabold, fontSize: 36, letterSpacing: -1 }}>
                Fut<Text style={{ color: colors.gradientStart }}>Hub</Text>
              </Text>
              <Text style={{ color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 15, marginTop: 6 }}>
                Live. Analyze. Win.
              </Text>
            </View>

            {/* Form */}
            <View style={{ width: '100%', gap: 12 }}>

              {/* Email */}
              <View style={{
                backgroundColor: colors.card,
                borderRadius: 14, borderWidth: 0.5,
                borderColor: colors.cardBorder,
                paddingHorizontal: 16, paddingVertical: 14,
              }}>
                <Text style={{ color: colors.textTertiary, fontFamily: fonts.semibold, fontSize: 10, marginBottom: 4, letterSpacing: 0.5 }}>
                  EMAIL
                </Text>
                <TextInput
                  style={{ color: colors.textPrimary, fontFamily: fonts.regular, fontSize: 15 }}
                  placeholder="your@email.com"
                  placeholderTextColor={colors.textTertiary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Password */}
              <View style={{
                backgroundColor: colors.card,
                borderRadius: 14, borderWidth: 0.5,
                borderColor: colors.cardBorder,
                paddingHorizontal: 16, paddingVertical: 14,
                flexDirection: 'row', alignItems: 'center',
              }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textTertiary, fontFamily: fonts.semibold, fontSize: 10, marginBottom: 4, letterSpacing: 0.5 }}>
                    PASSWORD
                  </Text>
                  <TextInput
                    style={{ color: colors.textPrimary, fontFamily: fonts.regular, fontSize: 15 }}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textTertiary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                </View>
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Text style={{ color: colors.textTertiary, fontSize: 18 }}>
                    {showPassword ? '🙈' : '👁️'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Forgot password */}
              <TouchableOpacity style={{ alignSelf: 'flex-end' }}>
                <Text style={{ color: colors.live, fontFamily: fonts.semibold, fontSize: 13 }}>
                  Forgot password?
                </Text>
              </TouchableOpacity>

              {/* Login button */}
              <TouchableOpacity onPress={handleLogin} disabled={loading} style={{ marginTop: 8 }}>
                <LinearGradient
                  colors={[colors.gradientStart, colors.gradientMid]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={{
                    paddingVertical: 16, borderRadius: 14,
                    alignItems: 'center',
                  }}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.background} />
                  ) : (
                    <Text style={{ color: colors.background, fontFamily: fonts.bold, fontSize: 16 }}>
                      Sign In
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

            </View>
          </View>

          {/* Bottom */}
          <View style={{ alignItems: 'center', paddingBottom: 16 }}>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={{ color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 14 }}>
                Don't have an account?{' '}
                <Text style={{ color: colors.live, fontFamily: fonts.bold }}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
