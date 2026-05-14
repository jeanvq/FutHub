import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../theme';

const BASE_URL = 'https://v3.football.api-sports.io';
const API_KEY = process.env.EXPO_PUBLIC_FOOTBALL_KEY;
const headers = { 'x-apisports-key': API_KEY };
const currentYear = new Date().getFullYear();
const SEASON = new Date().getMonth() >= 7 ? currentYear : currentYear - 1;

export default function TeamDetailScreen({ route, navigation }) {
  const { team } = route.params;
  const [upcoming, setUpcoming] = useState([]);
  const [recent, setRecent] = useState([]);
  const [standing, setStanding] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    setLoading(true);
    try {
      const [upcomingRes, recentRes] = await Promise.all([
        fetch(`${BASE_URL}/fixtures?team=${team.id}&season=${SEASON}&next=5`, { headers }),
        fetch(`${BASE_URL}/fixtures?team=${team.id}&season=${SEASON}&last=5`, { headers }),
      ]);
      const upcomingData = await upcomingRes.json();
      const recentData = await recentRes.json();
      setUpcoming(upcomingData.response || []);
      setRecent(recentData.response || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  function FixtureRow({ fixture, isUpcoming }) {
    const home = fixture.teams.home;
    const away = fixture.teams.away;
    const isHome = home.id === team.id;
    const date = new Date(fixture.fixture.date);
    const dateStr = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    const timeStr = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const finished = fixture.fixture.status.short === 'FT';
    const teamWon = finished && (
      isHome
        ? fixture.goals.home > fixture.goals.away
        : fixture.goals.away > fixture.goals.home
    );
    const teamLost = finished && (
      isHome
        ? fixture.goals.home < fixture.goals.away
        : fixture.goals.away < fixture.goals.home
    );
    const teamDrew = finished && fixture.goals.home === fixture.goals.away;

    return (
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 12, paddingHorizontal: 14,
        borderBottomWidth: 0.5, borderBottomColor: colors.cardBorder,
        gap: 10,
      }}>
        {/* Result badge */}
        {finished && (
          <View style={{
            width: 24, height: 24, borderRadius: 6,
            backgroundColor: teamWon
              ? 'rgba(0,255,178,0.15)'
              : teamLost
                ? 'rgba(239,68,68,0.15)'
                : 'rgba(139,155,180,0.15)',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{
              fontFamily: fonts.extrabold, fontSize: 10,
              color: teamWon ? colors.live : teamLost ? '#ef4444' : colors.textSecondary,
            }}>
              {teamWon ? 'W' : teamLost ? 'L' : 'D'}
            </Text>
          </View>
        )}

        {/* League logo */}
        {fixture.league.logo && (
          <Image source={{ uri: fixture.league.logo }} style={{ width: 20, height: 20 }} resizeMode="contain" />
        )}

        {/* Teams */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            {home.logo && <Image source={{ uri: home.logo }} style={{ width: 16, height: 16 }} resizeMode="contain" />}
            <Text style={{
              color: home.id === team.id ? colors.textPrimary : colors.textSecondary,
              fontFamily: home.id === team.id ? fonts.bold : fonts.regular,
              fontSize: 13, flex: 1,
            }}>
              {home.name}
            </Text>
            {finished && (
              <Text style={{ color: colors.textPrimary, fontFamily: fonts.extrabold, fontSize: 14 }}>
                {fixture.goals.home}
              </Text>
            )}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {away.logo && <Image source={{ uri: away.logo }} style={{ width: 16, height: 16 }} resizeMode="contain" />}
            <Text style={{
              color: away.id === team.id ? colors.textPrimary : colors.textSecondary,
              fontFamily: away.id === team.id ? fonts.bold : fonts.regular,
              fontSize: 13, flex: 1,
            }}>
              {away.name}
            </Text>
            {finished && (
              <Text style={{ color: colors.textPrimary, fontFamily: fonts.extrabold, fontSize: 14 }}>
                {fixture.goals.away}
              </Text>
            )}
          </View>
        </View>

        {/* Date/Time */}
        <View style={{ alignItems: 'flex-end' }}>
          {isUpcoming ? (
            <>
              <Text style={{ color: colors.live, fontFamily: fonts.bold, fontSize: 13 }}>{timeStr}</Text>
              <Text style={{ color: colors.textTertiary, fontFamily: fonts.regular, fontSize: 11 }}>{dateStr}</Text>
            </>
          ) : (
            <Text style={{ color: colors.textTertiary, fontFamily: fonts.regular, fontSize: 11 }}>{dateStr}</Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>

      {/* Header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 12,
        borderBottomWidth: 0.5, borderBottomColor: colors.cardBorder,
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={{ color: colors.textPrimary, fontFamily: fonts.bold, fontSize: 16 }}>
          {team.name}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Team hero */}
        <LinearGradient
          colors={['#0d2137', '#0a1628']}
          style={{ alignItems: 'center', paddingVertical: 32, paddingHorizontal: 16 }}
        >
          {team.logo ? (
            <Image source={{ uri: team.logo }} style={{ width: 100, height: 100, marginBottom: 16 }} resizeMode="contain" />
          ) : (
            <View style={{
              width: 100, height: 100, borderRadius: 50,
              backgroundColor: colors.card, marginBottom: 16,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 40 }}>⚽</Text>
            </View>
          )}
          <Text style={{ color: colors.textPrimary, fontFamily: fonts.extrabold, fontSize: 24, marginBottom: 4 }}>
            {team.name}
          </Text>
          <Text style={{ color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 14 }}>
            {team.country}
          </Text>
        </LinearGradient>

        {loading ? (
          <ActivityIndicator color={colors.live} size="large" style={{ marginTop: 40 }} />
        ) : (
          <View style={{ padding: 16 }}>

            {/* Upcoming */}
            <Text style={{ color: colors.textPrimary, fontFamily: fonts.bold, fontSize: 16, marginBottom: 10 }}>
              Próximos partidos
            </Text>
            <View style={{
              backgroundColor: colors.card, borderRadius: 14,
              borderWidth: 0.5, borderColor: colors.cardBorder,
              marginBottom: 20, overflow: 'hidden',
            }}>
              {upcoming.length === 0 ? (
                <Text style={{ color: colors.textTertiary, fontFamily: fonts.regular, fontSize: 13, padding: 16, textAlign: 'center' }}>
                  No hay próximos partidos disponibles
                </Text>
              ) : (
                upcoming.map((fixture, i) => (
                  <FixtureRow key={i} fixture={fixture} isUpcoming={true} />
                ))
              )}
            </View>

            {/* Recent */}
            <Text style={{ color: colors.textPrimary, fontFamily: fonts.bold, fontSize: 16, marginBottom: 10 }}>
              Resultados recientes
            </Text>
            <View style={{
              backgroundColor: colors.card, borderRadius: 14,
              borderWidth: 0.5, borderColor: colors.cardBorder,
              marginBottom: 20, overflow: 'hidden',
            }}>
              {recent.length === 0 ? (
                <Text style={{ color: colors.textTertiary, fontFamily: fonts.regular, fontSize: 13, padding: 16, textAlign: 'center' }}>
                  No hay resultados disponibles
                </Text>
              ) : (
                recent.map((fixture, i) => (
                  <FixtureRow key={i} fixture={fixture} isUpcoming={false} />
                ))
              )}
            </View>

          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
