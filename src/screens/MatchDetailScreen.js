import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { colors, fonts } from '../theme';

const STATS = [
  { label: 'possession', home: 60, away: 40 },
  { label: 'shots', home: 10, away: 6 },
  { label: 'shots_on_target', home: 6, away: 3 },
  { label: 'passes', home: 521, away: 348 },
  { label: 'fouls', home: 8, away: 9 },
  { label: 'yellow_cards', home: 1, away: 2 },
];

const EVENTS = [
  { minute: "20'", team: 'home', type: '⚽', player: 'L. Yamal' },
  { minute: "33'", team: 'away', type: '⚽', player: 'Vinicius Jr.' },
  { minute: "56'", team: 'home', type: '⚽', player: 'Raphinha' },
  { minute: "68'", team: 'away', type: '🟨', player: 'Militao' },
  { minute: "75'", team: 'home', type: '🟨', player: 'Gavi' },
];

function StatBar({ label, home, away, t }) {
  const total = home + away;
  const homePct = (home / total) * 100;
  const awayPct = (away / total) * 100;
  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ color: colors.textPrimary, fontFamily: fonts.bold, fontSize: 13 }}>{home}</Text>
        <Text style={{ color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 12 }}>{t(label)}</Text>
        <Text style={{ color: colors.textPrimary, fontFamily: fonts.bold, fontSize: 13 }}>{away}</Text>
      </View>
      <View style={{ flexDirection: 'row', height: 4, borderRadius: 4, overflow: 'hidden', gap: 2 }}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientMid]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={{ flex: homePct, borderRadius: 4 }}
        />
        <View style={{ flex: awayPct, backgroundColor: colors.cardBorder, borderRadius: 4 }} />
      </View>
    </View>
  );
}

export default function MatchDetailScreen({ route, navigation }) {
  const { match } = route.params;
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);

  const TABS = [t('tab_summary'), t('tab_stats'), t('tab_events'), t('tab_ai_insights')];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 12,
        borderBottomWidth: 0.5, borderBottomColor: colors.cardBorder,
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 22, color: colors.textPrimary }}>←</Text>
        </TouchableOpacity>
        <Text style={{ color: colors.textSecondary, fontFamily: fonts.semibold, fontSize: 12 }}>
          {match.leagueIcon} {match.league}
        </Text>
        <TouchableOpacity>
          <Text style={{ fontSize: 22 }}>⭐</Text>
        </TouchableOpacity>
      </View>

      <View style={{
        alignItems: 'center', paddingVertical: 24, paddingHorizontal: 16,
        borderBottomWidth: 0.5, borderBottomColor: colors.cardBorder,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Image source={{ uri: match.home.logo }} style={{ width: 60, height: 60, marginBottom: 8 }} resizeMode="contain" />
            <Text style={{ color: colors.textPrimary, fontFamily: fonts.bold, fontSize: 14, textAlign: 'center' }}>
              {match.home.name}
            </Text>
          </View>
          <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
            <Text style={{ color: colors.textPrimary, fontFamily: fonts.extrabold, fontSize: 48, letterSpacing: -2 }}>
              {match.home.score} - {match.away.score}
            </Text>
            <Text style={{ color: colors.live, fontFamily: fonts.bold, fontSize: 14 }}>{match.minute}</Text>
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Image source={{ uri: match.away.logo }} style={{ width: 60, height: 60, marginBottom: 8 }} resizeMode="contain" />
            <Text style={{ color: colors.textPrimary, fontFamily: fonts.bold, fontSize: 14, textAlign: 'center' }}>
              {match.away.name}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: colors.cardBorder }}>
        {TABS.map((tab, i) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(i)}
            style={{
              flex: 1, paddingVertical: 12, alignItems: 'center',
              borderBottomWidth: activeTab === i ? 2 : 0,
              borderBottomColor: colors.live,
            }}
          >
            <Text style={{
              color: activeTab === i ? colors.live : colors.textSecondary,
              fontFamily: activeTab === i ? fonts.semibold : fonts.regular,
              fontSize: 11,
            }}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {activeTab === 0 && (
          <View style={{ padding: 16 }}>
            <View style={{
              backgroundColor: colors.card, borderRadius: 16,
              borderWidth: 0.5, borderColor: colors.cardBorder, padding: 16,
            }}>
              <Text style={{ color: colors.textPrimary, fontFamily: fonts.regular, fontSize: 13, lineHeight: 20 }}>
                Un partido intenso entre dos de los mejores equipos de Europa. El equipo local domina con mayor posesión.
              </Text>
            </View>
          </View>
        )}

        {activeTab === 1 && (
          <View style={{ padding: 16 }}>
            <View style={{
              backgroundColor: colors.card, borderRadius: 16,
              borderWidth: 0.5, borderColor: colors.cardBorder, padding: 16,
            }}>
              {STATS.map((stat, i) => (
                <StatBar key={i} {...stat} t={t} />
              ))}
            </View>
          </View>
        )}

        {activeTab === 2 && (
          <View style={{ padding: 16 }}>
            <View style={{
              backgroundColor: colors.card, borderRadius: 16,
              borderWidth: 0.5, borderColor: colors.cardBorder, padding: 16,
            }}>
              {EVENTS.map((event, i) => (
                <View key={i} style={{
                  flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
                  borderBottomWidth: i < EVENTS.length - 1 ? 0.5 : 0,
                  borderBottomColor: colors.cardBorder,
                }}>
                  {event.team === 'home' ? (
                    <>
                      <Text style={{ color: colors.textPrimary, fontFamily: fonts.bold, fontSize: 13, flex: 1 }}>{event.player}</Text>
                      <Text style={{ fontSize: 16, marginHorizontal: 8 }}>{event.type}</Text>
                      <Text style={{ color: colors.live, fontFamily: fonts.bold, fontSize: 13, width: 36, textAlign: 'right' }}>{event.minute}</Text>
                      <View style={{ width: 36 }} />
                    </>
                  ) : (
                    <>
                      <View style={{ width: 36 }} />
                      <Text style={{ color: colors.live, fontFamily: fonts.bold, fontSize: 13, width: 36 }}>{event.minute}</Text>
                      <Text style={{ fontSize: 16, marginHorizontal: 8 }}>{event.type}</Text>
                      <Text style={{ color: colors.textPrimary, fontFamily: fonts.bold, fontSize: 13, flex: 1, textAlign: 'right' }}>{event.player}</Text>
                    </>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 3 && (
          <View style={{ padding: 16 }}>
            <LinearGradient
              colors={['rgba(0,255,178,0.08)', 'rgba(0,207,255,0.05)']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={{ borderRadius: 16, borderWidth: 0.5, borderColor: colors.gradientStart + '40', padding: 16, marginBottom: 12 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Text style={{ fontSize: 20 }}>🧠</Text>
                <Text style={{ color: colors.live, fontFamily: fonts.bold, fontSize: 14 }}>{t('tab_ai_insights')}</Text>
              </View>
              <Text style={{ color: colors.textPrimary, fontFamily: fonts.regular, fontSize: 13, lineHeight: 20 }}>
                {t('ai_insight_text')}
              </Text>
            </LinearGradient>

            <View style={{
              backgroundColor: colors.card, borderRadius: 16,
              borderWidth: 0.5, borderColor: colors.cardBorder, padding: 16,
            }}>
              <Text style={{ color: colors.textSecondary, fontFamily: fonts.semibold, fontSize: 11, marginBottom: 12 }}>
                {t('probabilities')}
              </Text>
              {[
                { label: t('home_win'), pct: 78, color: colors.gradientStart },
                { label: t('draw'), pct: 12, color: colors.textSecondary },
                { label: t('away_win'), pct: 10, color: '#FF4757' },
              ].map((item, i) => (
                <View key={i} style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                    <Text style={{ color: colors.textPrimary, fontFamily: fonts.regular, fontSize: 13 }}>{item.label}</Text>
                    <Text style={{ color: item.color, fontFamily: fonts.bold, fontSize: 13 }}>{item.pct}%</Text>
                  </View>
                  <View style={{ height: 4, backgroundColor: colors.cardBorder, borderRadius: 4 }}>
                    <View style={{ height: 4, width: item.pct + '%', backgroundColor: item.color, borderRadius: 4 }} />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
