import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import { NavigationContainer } from '@react-navigation/native';
import TabNavigator from './src/navigation/TabNavigator';
import { colors } from './src/theme';
import './src/theme/i18n';

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={colors.gradientStart} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor={colors.background} />
      <TabNavigator />
    </NavigationContainer>
  );
}
