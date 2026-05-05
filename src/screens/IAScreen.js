import { View, Text } from 'react-native';
import { colors, fonts } from '../theme';
export default function IAScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: colors.textPrimary, fontFamily: fonts.bold, fontSize: 24 }}>🤖 IA</Text>
    </View>
  );
}
