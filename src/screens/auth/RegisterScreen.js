import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { colors, fonts } from '../../theme';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name,
        email,
        createdAt: new Date(),
        favoriteTeams: [],
        favoriteLeagues: [2, 39, 140, 78, 135],
        activeLeagues: [2, 39, 140, 78, 135, 239],
      });
    } catch (error) {
      let msg = 'Error al registrarse';
      if (error.code === 'auth/email-already-in-use') msg = 'Este email ya está registrado';
      if (error.code === 'auth/invalid-email') msg = 'Email inválido';
      if (error.code === 'auth/weak-password') msg = 'Contraseña muy débil';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 24, justifyContent: 'center', flexGrow: 1 }}>

          {/* Header */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 32 }}>
            <Text style={{ color: colors.textSecondary, fontSize: 22 }}>←</Text>
          </TouchableOpacity>

          <Text style={{ color: colors.textPrimary, fontFamily: fonts.extrabold, fontSize: 28, marginBottom: 8 }}>
            Crear cuenta
          </Text>
          <Text style={{ color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 14, marginBottom: 32 }}>
            Únete a FutHub y personaliza tu experiencia
          </Text>

          {/* Inputs */}
          <View style={{ gap: 12, marginBottom: 24 }}>
            {[
              { label: 'NOMBRE', value: name, setter: setName, placeholder: 'Tu nombre', type: 'default' },
              { label: 'CORREO ELECTRÓNICO', value: email, setter: setEmail, placeholder: 'tu@email.com', type: 'email-address' },
              { label: 'CONTRASEÑA', value: password, setter: setPassword, placeholder: '••••••••', secure: true },
            ].map((field, i) => (
              <View key={i} style={{
                backgroundColor: colors.card, borderRadius: 12,
                borderWidth: 0.5, borderColor: colors.cardBorder,
                paddingHorizontal: 16, paddingVertical: 14,
              }}>
                <Text style={{ color: colors.textTertiary, fontFamily: fonts.regular, fontSize: 11, marginBottom: 4 }}>
                  {field.label}
                </Text>
                <TextInput
                  style={{ color: colors.textPrimary, fontFamily: fonts.regular, fontSize: 15 }}
                  placeholder={field.placeholder}
                  placeholderTextColor={colors.textTertiary}
                  value={field.value}
                  onChangeText={field.setter}
                  keyboardType={field.type || 'default'}
                  autoCapitalize={field.type === 'email-address' ? 'none' : 'words'}
                  secureTextEntry={field.secure}
                />
              </View>
            ))}
          </View>

          {/* Register button */}
          <TouchableOpacity onPress={handleRegister} disabled={loading}>
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientMid]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={{ paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 16 }}
            >
              {loading ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={{ color: colors.background, fontFamily: fonts.bold, fontSize: 16 }}>
                  Crear cuenta
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ alignItems: 'center' }}>
            <Text style={{ color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 14 }}>
              ¿Ya tienes cuenta?{' '}
              <Text style={{ color: colors.live, fontFamily: fonts.semibold }}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
