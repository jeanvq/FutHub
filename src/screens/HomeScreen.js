import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { colors, fonts } from '../theme';

const LIVE_MATCHES = [
  {
    id: '1',
    league: 'Champions League',
    leagueIcon: '🏆',
    home: { name: 'FC Barcelona', logo: '🔵🔴', score: 2 },
    away: { name: 'Real Madrid', logo: '⚪', score: 1 },
    minute: "75'",
    prediction: 78,
  },
  {
    id: '2',
    league: 'Premier League',
    leagueIcon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    home: { name: 'Man. City', logo: '🔵', score: 2 },
    away: { name: 'Arsenal', logo: '🔴', score: 1 },
    minute: "72'",
    prediction: 65,
  },
  {
    id: '3',
    league: 'La Liga',
    leagueIcon: '🇪🇸',
    home: { name: 'Atletico Madrid', logo: '🔴⚪', score: 1 },
    away: { name: 'Villarreal', logo: '🟡', score: 0 },
    minute: "66'",
    prediction: 71,
  },
];

function LiveBadge() {
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.liveBackground,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 999,
      alignSelf: 'flex-start',
    }}>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.live, marginRight: 5 }} />
      <Text style={{ color: colors.live, fontFamily: fonts.bold, fontSize: 10 }}>LIVE</Text>
    </View>
  );
}

function MatchCard({ match, onPress, t }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        borderWidth: 0.5,
        borderColor: colors.cardBorder,
        marginBottom: 10,
        overflow: 'hidden',
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingTop: 10,
          paddingBottom: 6,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 12 }}>{match.leagueIcon}</Text>
            <Text style={{ color: colors.textSecondary, fontFamily: fonts.semibold, fontSize: 11 }}>
              {match.league}
            </Text>
          </View>
          <LiveBadge />
        </View>

        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 10,
        }}>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 28, marginBottom: 4 }}>{match.home.logo}</Text>
            <Text style={{ color: colors.textPrimary, fontFamily: fonts.semibold, fontSize: 12, textAlign: 'center' }}>
              {match.home.name}
            </Text>
          </View>
          <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
            <Text style={{ color: colors.textPrimary, fontFamily: fonts.extrabold, fontSize: 36, letterSpacing: -1 }}>
              {match.home.score} - {match.away.score}
            </Text>
            <Text style={{ color: colors.live, fontFamily: fonts.bold, fontSize: 12 }}>
              {match.minute}
            </Text>
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 28, marginBottom: 4 }}>{match.away.logo}</Text>
            <Text style={{ color: colors.textPrimary, fontFamily: fonts.semibold, fontSize: 12, textAlign: 'center' }}>
              {match.away.name}
            </Text>
          </View>
        </View>

        <LinearGradient
          colors={['rgba(0,255,178,0.08)', 'rgba(0,207,255,0.08)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderTopWidth: 0.5,
            borderTopColor: colors.cardBorder,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Text style={{ fontSize: 14, marginRight: 6 }}>🤖</Text>
            <Text style={{ color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 11, flex: 1 }}>
              {t('ai_prediction')} · {match.home.name} {match.prediction}% {t('win_probability')}
            </Text>
          </View>
          <Text style={{ color: colors.live, fontFamily: fonts.extrabold, fontSize: 16 }}>
            {match.prediction}%
          </Text>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientMid]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={{ borderRadius: 6, paddingHorizontal: 2 }}
          >
            <Text style={{ color: colors.background, fontFamily: fonts.extrabold, fontSize: 26, letterSpacing: -0.5 }}>
              {t('app_name')}
            </Text>
          </LinearGradient>
          <TouchableOpacity>
            <Text style={{ fontSize: 22 }}>🔔</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
          {[t('tab_live'), t('tab_today'), t('tab_upcoming')].map((tab, i) => (
            <TouchableOpacity key={tab}>
              <LinearGradient
                colors={i === 0 ? [colors.gradientStart, colors.gradientMid] : ['transparent', 'transparent']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{
                  paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999,
                  borderWidth: i !== 0 ? 0.5 : 0, borderColor: colors.cardBorder,
                }}
              >
                <Text style={{ color: i === 0 ? colors.background : colors.textSecondary, fontFamily: fonts.semibold, fontSize: 13 }}>
                  {tab}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ color: colors.textPrimary, fontFamily: fonts.bold, fontSize: 16 }}>{t('live_matches')}</Text>
          <TouchableOpacity>
            <Text style={{ color: colors.live, fontFamily: fonts.semibold, fontSize: 13 }}>{t('see_all')}</Text>
          </TouchableOpacity>
        </View>

        {LIVE_MATCHES.map(match => (
          <MatchCard
            key={match.id}
            match={match}
            t={t}
            onPress={() => navigation.navigate('MatchDetail', { match })}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
