import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, fonts } from '../theme';

import HomeScreen from '../screens/HomeScreen';
import MatchDetailScreen from '../screens/MatchDetailScreen';
import FavoritosScreen from '../screens/FavoritosScreen';
import IAScreen from '../screens/IAScreen';
import PerfilScreen from '../screens/PerfilScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabIcon({ icon, label, focused }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 6 }}>
      <Text style={{ fontSize: 20, marginBottom: 2 }}>{icon}</Text>
      <Text style={{
        fontSize: 10,
        fontFamily: focused ? fonts.semibold : fonts.regular,
        color: focused ? colors.tabActive : colors.tabInactive,
      }}>
        {label}
      </Text>
    </View>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="MatchDetail" component={MatchDetailScreen} />
    </Stack.Navigator>
  );
}

export default function TabNavigator() {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.backgroundSecondary,
          borderTopColor: colors.cardBorder,
          borderTopWidth: 0.5,
          height: 80,
          paddingBottom: 0,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen name="Inicio" component={HomeStack}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🏠" label={t('tab_home')} focused={focused} /> }}
      />
      <Tab.Screen name="Favoritos" component={FavoritosScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="⭐" label={t('tab_favorites')} focused={focused} /> }}
      />
      <Tab.Screen name="IA" component={IAScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🤖" label={t('tab_ai')} focused={focused} /> }}
      />
      <Tab.Screen name="Perfil" component={PerfilScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="👤" label={t('tab_profile')} focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}
