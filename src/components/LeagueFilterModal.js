import { View, Text, Modal, ScrollView, TouchableOpacity, Image } from 'react-native';
import { colors, fonts } from '../theme';
import { useUser } from '../context/UserContext';

export default function LeagueFilterModal({ visible, onClose }) {
  const { ALL_LEAGUES, isActiveLeague, toggleActiveLeague, setAllLeaguesActive, activeLeagues } = useUser();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: colors.background }}>

        {/* Header */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          padding: 20, borderBottomWidth: 0.5, borderBottomColor: colors.cardBorder,
        }}>
          <Text style={{ color: colors.textPrimary, fontFamily: fonts.extrabold, fontSize: 20 }}>
            Filter Leagues
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ color: colors.live, fontFamily: fonts.semibold, fontSize: 15 }}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Select all / none */}
        <View style={{ flexDirection: 'row', padding: 16, gap: 8 }}>
          <TouchableOpacity
            onPress={setAllLeaguesActive}
            style={{
              flex: 1, paddingVertical: 8, borderRadius: 8,
              backgroundColor: colors.card, borderWidth: 0.5,
              borderColor: colors.cardBorder, alignItems: 'center',
            }}
          >
            <Text style={{ color: colors.live, fontFamily: fonts.semibold, fontSize: 13 }}>Select all</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              for (const l of ALL_LEAGUES) {
                if (isActiveLeague(l.id)) await toggleActiveLeague(l.id);
              }
            }}
            style={{
              flex: 1, paddingVertical: 8, borderRadius: 8,
              backgroundColor: colors.card, borderWidth: 0.5,
              borderColor: colors.cardBorder, alignItems: 'center',
            }}
          >
            <Text style={{ color: '#ef4444', fontFamily: fonts.semibold, fontSize: 13 }}>Clear all</Text>
          </TouchableOpacity>
        </View>

        <Text style={{
          color: colors.textTertiary, fontFamily: fonts.regular,
          fontSize: 12, paddingHorizontal: 16, marginBottom: 8,
        }}>
          {activeLeagues.length} of {ALL_LEAGUES.length} leagues selected
        </Text>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingTop: 0 }}>
          {ALL_LEAGUES.map(league => {
            const active = isActiveLeague(league.id);
            return (
              <TouchableOpacity
                key={league.id}
                onPress={() => toggleActiveLeague(league.id)}
                activeOpacity={0.8}
              >
                <View style={{
                  flexDirection: 'row', alignItems: 'center',
                  backgroundColor: colors.card, borderRadius: 12,
                  borderWidth: active ? 1 : 0.5,
                  borderColor: active ? colors.live : colors.cardBorder,
                  padding: 12, marginBottom: 8, gap: 12,
                }}>
                  <Image source={{ uri: league.logo }} style={{ width: 36, height: 36 }} resizeMode="contain" />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.textPrimary, fontFamily: fonts.semibold, fontSize: 14 }}>
                      {league.name}
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 12 }}>
                      {league.country}
                    </Text>
                  </View>
                  <View style={{
                    width: 24, height: 24, borderRadius: 12,
                    backgroundColor: active ? colors.live : 'transparent',
                    borderWidth: 1.5,
                    borderColor: active ? colors.live : colors.cardBorder,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    {active && <Text style={{ color: colors.background, fontSize: 14, fontWeight: 'bold' }}>✓</Text>}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}
