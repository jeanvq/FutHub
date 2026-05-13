import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { colors, fonts } from '../theme';
import { useUser } from '../context/UserContext';

const BASE_URL = 'https://v3.football.api-sports.io';
const API_KEY = process.env.EXPO_PUBLIC_FOOTBALL_KEY;
const headers = { 'x-apisports-key': API_KEY };
const currentYear = new Date().getFullYear();
const SEASON = new Date().getMonth() >= 7 ? currentYear : currentYear - 1;

async function getTeamNextFixtures(teamId) {
  try {
    const url = `${BASE_URL}/fixtures?team=${teamId}&season=2025&next=3`;
    console.log('FETCHING:', url);
    const res = await fetch(url, { headers });
    const data = await res.json();
    console.log('TEAM FIXTURES RESPONSE:', JSON.stringify(data).slice(0, 400));
    return data.response || [];
  } catch (e) { return []; }
}

async function getLeagueNextFixtures(leagueId) {
  try {
    const res = await fetch(`${BASE_URL}/fixtures?league=${leagueId}&season=${SEASON}&next=3`, { headers });
    const data = await res.json();
    return data.response || [];
  } catch (e) { return []; }
}

function UpcomingMatchCard({ fixture, onPress }) {
  const home = fixture.teams.home;
  const away = fixture.teams.away;
  const date = new Date(fixture.fixture.date);
  const dateStr = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  const timeStr = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={{
        backgroundColor: colors.card, borderRadius: 12,
        borderWidth: 0.5, borderColor: colors.cardBorder,
        padding: 12, marginBottom: 8,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          {fixture.league.logo ? (
            <Image source={{ uri: fixture.league.logo }} style={{ width: 16, height: 16, marginRight: 6 }} resizeMode="contain" />
          ) : null}
          <Text style={{ color: colors.textSecondary, fontFamily: fonts.semibold, fontSize: 11 }}>
            {fixture.league.name}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Image source={{ uri: home.logo }} style={{ width: 32, height: 32, marginBottom: 4 }} resizeMode="contain" />
            <Text style={{ color: colors.textPrimary, fontFamily: fonts.semibold, fontSize: 11, textAlign: 'center' }}>
              {home.name}
            </Text>
          </View>
          <View style={{ alignItems: 'center', paddingHorizontal: 12 }}>
            <Text style={{ color: colors.textPrimary, fontFamily: fonts.bold, fontSize: 13 }}>{dateStr}</Text>
            <Text style={{ color: colors.live, fontFamily: fonts.extrabold, fontSize: 15 }}>{timeStr}</Text>
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Image source={{ uri: away.logo }} style={{ width: 32, height: 32, marginBottom: 4 }} resizeMode="contain" />
            <Text style={{ color: colors.textPrimary, fontFamily: fonts.semibold, fontSize: 11, textAlign: 'center' }}>
              {away.name}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const POPULAR_LEAGUES = [
  { id: 2, name: 'Champions League', logo: 'https://media.api-sports.io/football/leagues/2.png', country: 'World' },
  { id: 39, name: 'Premier League', logo: 'https://media.api-sports.io/football/leagues/39.png', country: 'England' },
  { id: 140, name: 'La Liga', logo: 'https://media.api-sports.io/football/leagues/140.png', country: 'Spain' },
  { id: 78, name: 'Bundesliga', logo: 'https://media.api-sports.io/football/leagues/78.png', country: 'Germany' },
  { id: 135, name: 'Serie A', logo: 'https://media.api-sports.io/football/leagues/135.png', country: 'Italy' },
  { id: 61, name: 'Ligue 1', logo: 'https://media.api-sports.io/football/leagues/61.png', country: 'France' },
  { id: 13, name: 'Copa Libertadores', logo: 'https://media.api-sports.io/football/leagues/13.png', country: 'South America' },
  { id: 11, name: 'Copa Sudamericana', logo: 'https://media.api-sports.io/football/leagues/11.png', country: 'South America' },
  { id: 239, name: 'Liga BetPlay', logo: 'https://media.api-sports.io/football/leagues/239.png', country: 'Colombia' },
  { id: 262, name: 'Liga MX', logo: 'https://media.api-sports.io/football/leagues/262.png', country: 'Mexico' },
  { id: 71, name: 'Brasileirao', logo: 'https://media.api-sports.io/football/leagues/71.png', country: 'Brazil' },
  { id: 128, name: 'Liga Argentina', logo: 'https://media.api-sports.io/football/leagues/128.png', country: 'Argentina' },
];

export default function FavoritosScreen({ navigation }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const { favoriteTeams, favoriteLeagues, toggleFavoriteTeam, toggleFavoriteLeague, isFavoriteTeam, isFavoriteLeague, loading } = useUser();
  const [teamFixtures, setTeamFixtures] = useState([]);
  const [leagueFixtures, setLeagueFixtures] = useState([]);
  const [loadingFixtures, setLoadingFixtures] = useState(false);

  useEffect(() => {
    if (activeTab === 0 && favoriteTeams.length > 0) loadTeamFixtures();
    if (activeTab === 1 && favoriteLeagues.length > 0) loadLeagueFixtures();
  }, [activeTab, favoriteTeams, favoriteLeagues]);

  const loadTeamFixtures = async () => {
  setLoadingFixtures(true);
  try {
    console.log('FAVORITE TEAMS:', JSON.stringify(favoriteTeams));
    const results = await Promise.all(
      favoriteTeams.slice(0, 3).map(t => getTeamNextFixtures(t.id))
    );
    console.log('FIXTURES:', JSON.stringify(results).slice(0, 200));
    setTeamFixtures(results.flat().slice(0, 6));
  } catch (e) {
    console.error(e);
  } finally {
    setLoadingFixtures(false);
  }
};

  const loadLeagueFixtures = async () => {
    setLoadingFixtures(true);
    try {
      const results = await Promise.all(
        favoriteLeagues.slice(0, 3).map(l => getLeagueNextFixtures(l.id))
      );
      setLeagueFixtures(results.flat().slice(0, 6));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFixtures(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={colors.live} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{
        paddingHorizontal: 16, paddingVertical: 14,
        borderBottomWidth: 0.5, borderBottomColor: colors.cardBorder,
      }}>
        <Text style={{ color: colors.textPrimary, fontFamily: fonts.extrabold, fontSize: 22 }}>
          {t('tab_favorites')}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', padding: 16, gap: 8 }}>
        {[t('favorites_teams'), t('favorites_competitions')].map((tab, i) => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(i)} style={{ flex: 1 }}>
            <LinearGradient
              colors={i === activeTab ? [colors.gradientStart, colors.gradientMid] : ['transparent', 'transparent']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={{
                paddingVertical: 10, borderRadius: 10, alignItems: 'center',
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingTop: 0 }}>

        {/* TEAMS TAB */}
        {activeTab === 0 && (
          <View>
            {favoriteTeams.length === 0 ? (
              <View style={{ alignItems: 'center', paddingTop: 60 }}>
                <Text style={{ fontSize: 48, marginBottom: 16 }}>⭐</Text>
                <Text style={{ color: colors.textPrimary, fontFamily: fonts.bold, fontSize: 18, marginBottom: 8 }}>
                  No favorite teams yet
                </Text>
                <Text style={{ color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 14, textAlign: 'center' }}>
                  Use the search to find and save your teams
                </Text>
              </View>
            ) : (
              <>
                {/* Lista de equipos favoritos */}
                <Text style={{ color: colors.textSecondary, fontFamily: fonts.semibold, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
                  My Teams
                </Text>
                {favoriteTeams.map(team => (
                  <TouchableOpacity
                    key={team.id}
                    onPress={() => navigation.navigate('TeamDetail', { team })}
                    activeOpacity={0.8}
                  >
                    <View style={{
                      flexDirection: 'row', alignItems: 'center',
                      backgroundColor: colors.card, borderRadius: 12,
                      borderWidth: 0.5, borderColor: colors.cardBorder,
                      padding: 12, marginBottom: 8, gap: 12,
                    }}>
                      {team.logo ? (
                        <Image source={{ uri: team.logo }} style={{ width: 40, height: 40 }} resizeMode="contain" />
                      ) : (
                        <View style={{
                          width: 40, height: 40, borderRadius: 20,
                          backgroundColor: colors.backgroundSecondary,
                          alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Text style={{ fontSize: 20 }}>⚽</Text>
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.textPrimary, fontFamily: fonts.semibold, fontSize: 14 }}>
                          {team.name}
                        </Text>
                        <Text style={{ color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 12 }}>
                          {team.country}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Text style={{ color: colors.textTertiary, fontSize: 16 }}>›</Text>
                        <TouchableOpacity onPress={() => toggleFavoriteTeam(team)}>
                          <Text style={{ fontSize: 20 }}>💚</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}

                {/* Próximos partidos de equipos favoritos */}
                <Text style={{ color: colors.textSecondary, fontFamily: fonts.semibold, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 16, marginBottom: 10 }}>
                  Upcoming matches
                </Text>
                {loadingFixtures ? (
                  <ActivityIndicator color={colors.live} style={{ marginTop: 20 }} />
                ) : teamFixtures.length === 0 ? (
                  <Text style={{ color: colors.textTertiary, fontFamily: fonts.regular, fontSize: 13, textAlign: 'center', marginTop: 10 }}>
                    No upcoming matches found
                  </Text>
                ) : (
                  teamFixtures.map((fixture, i) => (
                    <UpcomingMatchCard key={i} fixture={fixture} onPress={() => {}} />
                  ))
                )}
              </>
            )}
          </View>
        )}

        {/* LEAGUES TAB */}
        {activeTab === 1 && (
          <View>
            {/* Próximos partidos de ligas favoritas */}
            {favoriteLeagues.length > 0 && (
              <>
                <Text style={{ color: colors.textSecondary, fontFamily: fonts.semibold, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
                  Upcoming in your leagues
                </Text>
                {loadingFixtures ? (
                  <ActivityIndicator color={colors.live} style={{ marginBottom: 16 }} />
                ) : leagueFixtures.length > 0 ? (
                  leagueFixtures.map((fixture, i) => (
                    <UpcomingMatchCard key={i} fixture={fixture} onPress={() => {}} />
                  ))
                ) : null}
                <View style={{ height: 0.5, backgroundColor: colors.cardBorder, marginVertical: 16 }} />
              </>
            )}

            {/* Todas las ligas */}
            <Text style={{ color: colors.textSecondary, fontFamily: fonts.semibold, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
              All Leagues
            </Text>
            {POPULAR_LEAGUES.map(league => (
              <TouchableOpacity key={league.id} onPress={() => toggleFavoriteLeague(league)}>
                <View style={{
                  flexDirection: 'row', alignItems: 'center',
                  backgroundColor: colors.card, borderRadius: 12,
                  borderWidth: isFavoriteLeague(league.id) ? 1 : 0.5,
                  borderColor: isFavoriteLeague(league.id) ? colors.live : colors.cardBorder,
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
                  <Text style={{ fontSize: 22 }}>
                    {isFavoriteLeague(league.id) ? '💚' : '🤍'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
