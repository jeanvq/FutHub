import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { colors, fonts } from '../theme';
import { getLiveMatches, getTodayMatches, getUpcomingFixtures, formatMatch, LEAGUES } from '../api/football';

function LiveBadge() {
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: colors.liveBackground,
      paddingHorizontal: 8, paddingVertical: 3,
      borderRadius: 999, alignSelf: 'flex-start',
    }}>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.live, marginRight: 5 }} />
      <Text style={{ color: colors.live, fontFamily: fonts.bold, fontSize: 10 }}>LIVE</Text>
    </View>
  );
}

function TeamLogo({ logo, name }) {
  if (logo) {
    return (
      <Image
        source={{ uri: logo }}
        style={{ width: 40, height: 40, marginBottom: 4 }}
        resizeMode="contain"
      />
    );
  }
  return (
    <View style={{
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: colors.card, borderWidth: 0.5,
      borderColor: colors.cardBorder, alignItems: 'center',
      justifyContent: 'center', marginBottom: 4,
    }}>
      <Text style={{ color: colors.textPrimary, fontFamily: fonts.bold, fontSize: 10 }}>
        {name?.slice(0, 2).toUpperCase()}
      </Text>
    </View>
  );
}

function MatchCard({ match, onPress, t, isLive }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={{
        backgroundColor: colors.card, borderRadius: 16,
        borderWidth: 0.5, borderColor: colors.cardBorder,
        marginBottom: 10, overflow: 'hidden',
      }}>
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 12 }}>{match.leagueIcon}</Text>
            <Text style={{ color: colors.textSecondary, fontFamily: fonts.semibold, fontSize: 11 }}>
              {match.league}
            </Text>
          </View>
          {isLive && <LiveBadge />}
        </View>

        <View style={{
          flexDirection: 'row', alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16, paddingVertical: 10,
        }}>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <TeamLogo logo={match.home.logo} name={match.home.name} />
            <Text style={{ color: colors.textPrimary, fontFamily: fonts.semibold, fontSize: 12, textAlign: 'center' }}>
              {match.home.name}
            </Text>
          </View>

          <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
            {isLive || match.status === 'FT' ? (
              <Text style={{ color: colors.textPrimary, fontFamily: fonts.extrabold, fontSize: 36, letterSpacing: -1 }}>
                {match.home.score} - {match.away.score}
              </Text>
            ) : (
              <Text style={{ color: colors.textSecondary, fontFamily: fonts.bold, fontSize: 18 }}>
                vs
              </Text>
            )}
            <Text style={{ color: isLive ? colors.live : colors.textSecondary, fontFamily: fonts.bold, fontSize: 12 }}>
              {match.minute}
            </Text>
          </View>

          <View style={{ flex: 1, alignItems: 'center' }}>
            <TeamLogo logo={match.away.logo} name={match.away.name} />
            <Text style={{ color: colors.textPrimary, fontFamily: fonts.semibold, fontSize: 12, textAlign: 'center' }}>
              {match.away.name}
            </Text>
          </View>
        </View>

        <LinearGradient
          colors={['rgba(0,255,178,0.08)', 'rgba(0,207,255,0.08)']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={{
            flexDirection: 'row', alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16, paddingVertical: 10,
            borderTopWidth: 0.5, borderTopColor: colors.cardBorder,
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
  const [activeTab, setActiveTab] = useState(0);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
  }, [activeTab]);

  const loadMatches = async () => {
    setLoading(true);
    try {
      let data = [];
      if (activeTab === 0) {
        data = await getLiveMatches();
      } else if (activeTab === 1) {
        data = await getTodayMatches();
      } else {
        const upcoming = await Promise.all(
          Object.values(LEAGUES).map(id => getUpcomingFixtures(id, 2))
        );
        data = upcoming.flat();
      }
      setMatches(data.map(formatMatch));
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [t('tab_live'), t('tab_today'), t('tab_upcoming')];

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
          {tabs.map((tab, i) => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(i)}>
              <LinearGradient
                colors={i === activeTab ? [colors.gradientStart, colors.gradientMid] : ['transparent', 'transparent']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{
                  paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999,
                  borderWidth: i !== activeTab ? 0.5 : 0, borderColor: colors.cardBorder,
                }}
              >
                <Text style={{
                  color: i === activeTab ? colors.background : colors.textSecondary,
                  fontFamily: fonts.semibold, fontSize: 13,
                }}>
                  {tab}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ color: colors.textPrimary, fontFamily: fonts.bold, fontSize: 16 }}>
            {tabs[activeTab]}
          </Text>
          <TouchableOpacity onPress={loadMatches}>
            <Text style={{ color: colors.live, fontFamily: fonts.semibold, fontSize: 13 }}>↻ {t('see_all')}</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={{ paddingTop: 60, alignItems: 'center' }}>
            <ActivityIndicator color={colors.live} size="large" />
            <Text style={{ color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 14, marginTop: 12 }}>
              {t('loading')}
            </Text>
          </View>
        ) : matches.length === 0 ? (
          <View style={{ paddingTop: 60, alignItems: 'center' }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>⚽</Text>
            <Text style={{ color: colors.textSecondary, fontFamily: fonts.semibold, fontSize: 16 }}>
              No hay partidos ahora mismo
            </Text>
          </View>
        ) : (
          matches.map(match => (
            <MatchCard
              key={match.id}
              match={match}
              t={t}
              isLive={activeTab === 0}
              onPress={() => navigation.navigate('MatchDetail', { match })}
            />
          ))
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
