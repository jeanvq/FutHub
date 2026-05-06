import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { colors, fonts } from '../theme';
import { getFixtureStats, getFixtureEvents } from '../api/football';

function TeamLogo({ logo, name, size = 60 }) {
  if (logo && logo.startsWith('http')) {
    return (
      <Image
        source={{ uri: logo }}
        style={{ width: size, height: size, marginBottom: 8 }}
        resizeMode="contain"
      />
    );
  }
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: colors.card, borderWidth: 0.5,
      borderColor: colors.cardBorder, alignItems: 'center',
      justifyContent: 'center', marginBottom: 8,
    }}>
      <Text style={{ color: colors.textPrimary, fontFamily: fonts.bold, fontSize: 12 }}>
        {name?.slice(0, 2).toUpperCase()}
      </Text>
    </View>
  );
}

function StatBar({ label, home, away }) {
  const total = (home || 0) + (away || 0);
  const homePct = total > 0 ? ((home || 0) / total) * 100 : 50;
  const awayPct = total > 0 ? ((away || 0) / total) * 100 : 50;
  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ color: colors.textPrimary, fontFamily: fonts.bold, fontSize: 13 }}>{home ?? '-'}</Text>
        <Text style={{ color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 12 }}>{label}</Text>
        <Text style={{ color: colors.textPrimary, fontFamily: fonts.bold, fontSize: 13 }}>{away ?? '-'}</Text>
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

function EventIcon({ type, detail }) {
  if (type === 'Goal') return '⚽';
  if (type === 'Card') return detail === 'Red Card' ? '🟥' : '🟨';
  if (type === 'subst') return '🔄';
  return '📋';
}

export default function MatchDetailScreen({ route, navigation }) {
  const { match } = route.params;
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const TABS = [t('tab_summary'), t('tab_stats'), t('tab_events'), t('tab_ai_insights')];

  useEffect(() => {
    if (activeTab === 1 && stats.length === 0) loadStats();
    if (activeTab === 2 && events.length === 0) loadEvents();
  }, [activeTab]);

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const data = await getFixtureStats(match.id);
      setStats(data);
    } catch (e) {
      console.error('Stats error:', e);
    } finally {
      setLoadingStats(false);
    }
  };

  const loadEvents = async () => {
    setLoadingEvents(true);
    try {
      const data = await getFixtureEvents(match.id);
      setEvents(data);
    } catch (e) {
      console.error('Events error:', e);
    } finally {
      setLoadingEvents(false);
    }
  };

  const getStatValue = (teamStats, statType) => {
    const stat = teamStats?.statistics?.find(s => s.type === statType);
    return stat?.value ?? null;
  };

  const statTypes = [
    'Ball Possession',
    'Total Shots',
    'Shots on Goal',
    'Total passes',
    'Fouls',
    'Yellow Cards',
    'Red Cards',
    'Corner Kicks',
    'Offsides',
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>

      {/* Header */}
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

      {/* Score */}
      <View style={{
        alignItems: 'center', paddingVertical: 24, paddingHorizontal: 16,
        borderBottomWidth: 0.5, borderBottomColor: colors.cardBorder,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <TeamLogo logo={match.home.logo} name={match.home.name} size={60} />
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
            <TeamLogo logo={match.away.logo} name={match.away.name} size={60} />
            <Text style={{ color: colors.textPrimary, fontFamily: fonts.bold, fontSize: 14, textAlign: 'center' }}>
              {match.away.name}
            </Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: colors.cardBorder }}>
        {TABS.map((tab, i) => (
          <TouchableOpacity
            key={tab} onPress={() => setActiveTab(i)}
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

      {/* Tab Content */}
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Resumen */}
        {activeTab === 0 && (
          <View style={{ padding: 16 }}>
            <View style={{
              backgroundColor: colors.card, borderRadius: 16,
              borderWidth: 0.5, borderColor: colors.cardBorder, padding: 16,
            }}>
              <Text style={{ color: colors.textPrimary, fontFamily: fonts.regular, fontSize: 13, lineHeight: 20 }}>
                {match.home.name} vs {match.away.name} — {match.league}.
                {match.status === 'FT'
                  ? ` Partido finalizado con marcador ${match.home.score}-${match.away.score}.`
                  : ` Partido en curso, minuto ${match.minute}.`
                }
              </Text>
            </View>
          </View>
        )}

        {/* Estadísticas */}
        {activeTab === 1 && (
          <View style={{ padding: 16 }}>
            {loadingStats ? (
              <ActivityIndicator color={colors.live} size="large" style={{ marginTop: 40 }} />
            ) : stats.length === 0 ? (
              <View style={{ alignItems: 'center', marginTop: 40 }}>
                <Text style={{ fontSize: 32, marginBottom: 12 }}>📊</Text>
                <Text style={{ color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 14 }}>
                  Estadísticas no disponibles
                </Text>
              </View>
            ) : (
              <View style={{
                backgroundColor: colors.card, borderRadius: 16,
                borderWidth: 0.5, borderColor: colors.cardBorder, padding: 16,
              }}>
                {statTypes.map((statType, i) => {
                  const homeVal = getStatValue(stats[0], statType);
                  const awayVal = getStatValue(stats[1], statType);
                  if (homeVal === null && awayVal === null) return null;
                  const homeNum = typeof homeVal === 'string' && homeVal.includes('%')
                    ? parseFloat(homeVal) : (homeVal || 0);
                  const awayNum = typeof awayVal === 'string' && awayVal.includes('%')
                    ? parseFloat(awayVal) : (awayVal || 0);
                  return (
                    <StatBar
                      key={i}
                      label={statType}
                      home={homeVal}
                      away={awayVal}
                    />
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Eventos */}
        {activeTab === 2 && (
          <View style={{ padding: 16 }}>
            {loadingEvents ? (
              <ActivityIndicator color={colors.live} size="large" style={{ marginTop: 40 }} />
            ) : events.length === 0 ? (
              <View style={{ alignItems: 'center', marginTop: 40 }}>
                <Text style={{ fontSize: 32, marginBottom: 12 }}>📋</Text>
                <Text style={{ color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 14 }}>
                  No hay eventos disponibles
                </Text>
              </View>
            ) : (
              <View style={{
                backgroundColor: colors.card, borderRadius: 16,
                borderWidth: 0.5, borderColor: colors.cardBorder, padding: 16,
              }}>
                {events.map((event, i) => {
                  const isHome = event.team?.name === match.home.name;
                  return (
                    <View key={i} style={{
                      flexDirection: 'row', alignItems: 'center',
                      paddingVertical: 10,
                      borderBottomWidth: i < events.length - 1 ? 0.5 : 0,
                      borderBottomColor: colors.cardBorder,
                    }}>
                      {isHome ? (
                        <>
                          <Text style={{ color: colors.textPrimary, fontFamily: fonts.bold, fontSize: 13, flex: 1 }}>
                            {event.player?.name}
                          </Text>
                          <Text style={{ fontSize: 16, marginHorizontal: 8 }}>
                            {EventIcon({ type: event.type, detail: event.detail })}
                          </Text>
                          <Text style={{ color: colors.live, fontFamily: fonts.bold, fontSize: 13, width: 36, textAlign: 'right' }}>
                            {event.time?.elapsed}'
                          </Text>
                          <View style={{ width: 36 }} />
                        </>
                      ) : (
                        <>
                          <View style={{ width: 36 }} />
                          <Text style={{ color: colors.live, fontFamily: fonts.bold, fontSize: 13, width: 36 }}>
                            {event.time?.elapsed}'
                          </Text>
                          <Text style={{ fontSize: 16, marginHorizontal: 8 }}>
                            {EventIcon({ type: event.type, detail: event.detail })}
                          </Text>
                          <Text style={{ color: colors.textPrimary, fontFamily: fonts.bold, fontSize: 13, flex: 1, textAlign: 'right' }}>
                            {event.player?.name}
                          </Text>
                        </>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* IA Insights */}
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
                { label: t('home_win'), pct: match.prediction, color: colors.gradientStart },
                { label: t('draw'), pct: Math.floor(Math.random() * 15) + 10, color: colors.textSecondary },
                { label: t('away_win'), pct: 100 - match.prediction - 15, color: '#FF4757' },
              ].map((item, i) => (
                <View key={i} style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                    <Text style={{ color: colors.textPrimary, fontFamily: fonts.regular, fontSize: 13 }}>{item.label}</Text>
                    <Text style={{ color: item.color, fontFamily: fonts.bold, fontSize: 13 }}>{item.pct}%</Text>
                  </View>
                  <View style={{ height: 4, backgroundColor: colors.cardBorder, borderRadius: 4 }}>
                    <View style={{ height: 4, width: `${item.pct}%`, backgroundColor: item.color, borderRadius: 4 }} />
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
