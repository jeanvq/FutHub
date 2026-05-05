import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors, fonts } from '../theme';

export default function PerfilScreen() {
  const { t } = useTranslation();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: colors.textPrimary, fontFamily: fonts.bold, fontSize: 24 }}>👤 {t('tab_profile')}</Text>
    </SafeAreaView>
  );
}
