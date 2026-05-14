import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, TextInput, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { colors, fonts } from '../theme';
import { getLiveMatches, getTodayMatches, getUpcomingFixtures, formatMatch, LEAGUES } from '../api/football';
import { useUser } from '../context/UserContext';
import LeagueFilterModal from '../components/LeagueFilterModal';

const BASE_URL = 'https://v3.football.api-sports.io';
const API_KEY = process.env.EXPO_PUBLIC_FOOTBALL_KEY;
const headers = { 'x-apisports-key': API_KEY };
const { width } = Dimensions.get('window');

function HeroMatchCard({ match, onPress, isLive }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <LinearGradient
        colors={['#0d2137', '#0a1628', '#051020']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 20, overflow: 'hidden',
          marginBottom: 16, borderWidth: 0.5,
          borderColor: 'rgba(0,255,178,0.2)',
        }}
      >
        {/* League header */}
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {isLive && (
              <View style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: 'rgba(0,255,178,0.15)',
                paddingHorizontal: 8, paddingVertical: 3,
                borderRadius: 20,
              }}>
                <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: colors.live, marginRight: 4 }} />
                <Text style={{ color: colors.live, fontFamily: fonts.bold, fontSize: 10 }}>LIVE</Text>
              </View>
            )}
            {match.leagueLogo && (
              <Image source={{ uri: match.leagueLogo }} style={{ width: 16, height: 16 }} resizeMode="contain" />
            )}
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontFamily: fonts.semibold, fontSize: 12 }}>
              {match.league}
            </Text>
          </View>
          <Text style={{ fontSize: 12 }}>{match.leagueCountryFlag}</Text>
        </View>

        {/* Score */}
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20, paddingVertical: 16,
        }}>
          <View style={{ flex: 1, alignItems: 'center' }}>
            {match.home.logo ? (
              <Image source={{ uri: match.home.logo }} style={{ width: 64, height: 64, marginBottom: 8 }} resizeMode="contain" />
            ) : (
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.card, marginBottom: 8, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: colors.textPrimary, fontFamily: fonts.bold, fontSize: 14 }}>{match.home.name?.slice(0, 2)}</Text>
              </View>
            )}
            <Text style={{ color: '#fff', fontFamily: fonts.bold, fontSize: 13, textAlign: 'center' }}>
              {match.home.name}
            </Text>
          </View>

          <View style={{ alignItems: 'center', paddingHorizontal: 12 }}>
            <Text style={{ color: '#fff', fontFamily: fonts.extrabold, fontSize: 44, letterSpacing: -2 }}>
              {match.home.score} - {match.away.score}
            </Text>
            <Text style={{ color: colors.live, fontFamily: fonts.bold, fontSize: 13, marginTop: 2 }}>
              {match.minute}
            </Text>
          </View>

          <View style={{ flex: 1, alignItems: 'center' }}>
            {match.away.logo ? (
              <Image source={{ uri: match.away.logo }} style={{ width: 64, height: 64, marginBottom: 8 }} resizeMode="contain" />
            ) : (
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.card, marginBottom: 8, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: colors.textPrimary, fontFamily: fonts.bold, fontSize: 14 }}>{match.away.name?.slice(0, 2)}</Text>
              </View>
            )}
            <Text style={{ color: '#fff', fontFamily: fonts.bold, fontSize: 13, textAlign: 'center' }}>
              {match.away.name}
            </Text>
          </View>
        </View>

        {/* IA Prediction */}
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.3)',
          marginHorizontal: 16, marginBottom: 14,
          borderRadius: 12, padding: 10, gap: 10,
          borderWidth: 0.5, borderColor: 'rgba(0,255,178,0.15)',
        }}>
          <View style={{
            width: 32, height: 32, borderRadius: 16,
            backgroundColor: 'rgba(0,255,178,0.1)',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 16 }}>🤖</Text>
          </View>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontFamily: fonts.regular, fontSize: 12, flex: 1 }}>
            Predicción IA · {match.home.name} tiene ventaja en este partido
          </Text>
          <View style={{
            width: 44, height: 44, borderRadius: 22,
            borderWidth: 2, borderColor: colors.live,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ color: colors.live, fontFamily: fonts.extrabold, fontSize: 13 }}>IA</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function CompactMatchRow({ match, onPress, isLive }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 10, paddingHorizontal: 12,
        backgroundColor: colors.card,
        borderRadius: 12, marginBottom: 6,
        borderWidth: 0.5, borderColor: colors.cardBorder,
        gap: 10,
      }}>
        {/* League icon */}
        <View style={{ width: 28, alignItems: 'center' }}>
          {match.leagueLogo ? (
            <Image source={{ uri: match.leagueLogo }} style={{ width: 20, height: 20 }} resizeMode="contain" />
          ) : (
            <Text style={{ fontSize: 14 }}>{match.leagueIcon}</Text>
          )}
        </View>

        {/* Teams */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            {match.home.logo && (
              <Image source={{ uri: match.home.logo }} style={{ width: 18, height: 18 }} resizeMode="contain" />
            )}
            <Text style={{ color: colors.textPrimary, fontFamily: fonts.semibold, fontSize: 13, flex: 1 }}>
              {match.home.name}
            </Text>
            <Text style={{ color: colors.textPrimary, fontFamily: fonts.extrabold, fontSize: 14, minWidth: 20, textAlign: 'right' }}>
              {isLive || match.status === 'FT' ? match.home.score : ''}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {match.away.logo && (
              <Image source={{ uri: match.away.logo }} style={{ width: 18, height: 18 }} resizeMode="contain" />
            )}
            <Text style={{ color: colors.textPrimary, fontFamily: fonts.semibold, fontSize: 13, flex: 1 }}>
              {match.away.name}
            </Text>
            <Text style={{ color: colors.textPrimary, fontFamily: fonts.extrabold, fontSize: 14, minWidth: 20, textAlign: 'right' }}>
              {isLive || match.status === 'FT' ? match.away.score : ''}
            </Text>
          </View>
        </View>

        {/* Time/Status */}
        <View style={{ alignItems: 'center', minWidth: 36 }}>
          {isLive ? (
            <Text style={{ color: colors.live, fontFamily: fonts.bold, fontSize: 12 }}>
              {match.minute}
            </Text>
          ) : match.status === 'FT' ? (
            <Text style={{ color: colors.textTertiary, fontFamily: fonts.regular, fontSize: 11 }}>FT</Text>
          ) : (
            <Text style={{ color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 11 }}>
              {match.minute}
            </Text>
          )}
          <Text style={{ color: colors.textTertiary, fontSize: 14, marginTop: 2 }}>›</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function SearchResult({ item, onPress, onFavorite, isFav }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 12,
        padding: 12, backgroundColor: colors.card,
        borderRadius: 12, marginBottom: 8,
        borderWidth: 0.5, borderColor: colors.cardBorder,
      }}>
        {item.logo ? (
          <Image source={{ uri: item.logo }} style={{ width: 36, height: 36 }} resizeMode="contain" />
        ) : (
          <View style={{
            width: 36, height: 36, borderRadius: 18,
            backgroundColor: colors.backgroundSecondary,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 18 }}>{item.type === 'league' ? '🏆' : '⚽'}</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.textPrimary, fontFamily: fonts.semibold, fontSize: 14 }}>{item.name}</Text>
          <Text style={{ color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 12 }}>
            {item.type === 'league' ? item.country : item.league}
          </Text>
        </View>
        <TouchableOpacity onPress={() => onFavorite(item)} style={{ padding: 4 }}>
          <Text style={{ fontSize: 22 }}>{isFav ? '🏆' : '🫙'}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const { t } = useTranslation();
  const { favoriteTeams, favoriteLeagues, toggleFavoriteTeam, toggleFavoriteLeague, isFavoriteTeam, isFavoriteLeague, isActiveLeague } = useUser();
  const [activeTab, setActiveTab] = useState(0);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => { loadMatches(); }, [activeTab]);

  useEffect(() => {
    if (searchQuery.length >= 3) handleSearch(searchQuery);
    else setSearchResults([]);
  }, [searchQuery]);

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
    console.log('MATCHES COUNT:', data.length);
    setMatches(data.map(formatMatch));
  } catch (error) {
    console.error('Error loading matches:', error);
  } finally {
    setLoading(false);
  }
};

  const handleSearch = async (query) => {
    setSearching(true);
    try {
      const [teamsRes, leaguesRes] = await Promise.all([
        fetch(`${BASE_URL}/teams?search=${query}`, { headers }),
        fetch(`${BASE_URL}/leagues?search=${query}`, { headers }),
      ]);
      const teamsData = await teamsRes.json();
      const leaguesData = await leaguesRes.json();
      const teams = (teamsData.response || []).slice(0, 5).map(t => ({
        id: t.team.id, name: t.team.name, logo: t.team.logo,
        league: t.venue?.city || '', type: 'team',
      }));
      const leagues = (leaguesData.response || []).slice(0, 3).map(l => ({
        id: l.league.id, name: l.league.name, logo: l.league.logo,
        country: l.country.name, type: 'league',
      }));
      setSearchResults([...leagues, ...teams]);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const favoriteMatches = matches.filter(match =>
    isFavoriteTeam(match.home.id) || isFavoriteTeam(match.away.id) || isFavoriteLeague(match.leagueId)
  );

  const otherMatches = matches.filter(match =>
    !isFavoriteTeam(match.home.id) && !isFavoriteTeam(match.away.id) &&
    !isFavoriteLeague(match.leagueId) && isActiveLeague(match.leagueId)
  );

 const heroMatch = favoriteMatches.length > 0 ? favoriteMatches[0] : null;
const restMatches = heroMatch
  ? [...favoriteMatches.slice(1), ...otherMatches]
  : otherMatches;

  const tabs = [t('tab_live'), t('tab_today'), t('tab_upcoming')];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          {!showSearch ? (
            <>
              <Text style={{ color: colors.textPrimary, fontFamily: fonts.extrabold, fontSize: 28, letterSpacing: -0.5 }}>
                Fut<Text style={{ color: colors.gradientStart }}>Hub</Text>
              </Text>
              <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
                <TouchableOpacity onPress={() => setShowSearch(true)}>
                  <Text style={{ fontSize: 20, color: colors.textSecondary }}>🔍</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowFilter(true)}>
                  <Text style={{ fontSize: 20, color: colors.textSecondary }}>⚙️</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <View style={{ position: 'relative' }}>
                    <Text style={{ fontSize: 20, color: colors.textSecondary }}>🔔</Text>
                    <View style={{
                      position: 'absolute', top: -2, right: -2,
                      width: 8, height: 8, borderRadius: 4,
                      backgroundColor: colors.live,
                    }} />
                  </View>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={{
                flex: 1, flexDirection: 'row', alignItems: 'center',
                backgroundColor: colors.card, borderRadius: 12,
                borderWidth: 0.5, borderColor: colors.cardBorder,
                paddingHorizontal: 12, paddingVertical: 10, gap: 8,
              }}>
                <Text style={{ fontSize: 16 }}>🔍</Text>
                <TextInput
                  style={{ flex: 1, color: colors.textPrimary, fontFamily: fonts.regular, fontSize: 14 }}
                  placeholder="Search teams or leagues..."
                  placeholderTextColor={colors.textTertiary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Text style={{ color: colors.textTertiary, fontSize: 16 }}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity
                onPress={() => { setShowSearch(false); setSearchQuery(''); setSearchResults([]); }}
                style={{ marginLeft: 12 }}
              >
                <Text style={{ color: colors.live, fontFamily: fonts.semibold, fontSize: 14 }}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Search results */}
        {showSearch && (
          <View style={{ marginBottom: 16 }}>
            {searching && <ActivityIndicator color={colors.live} size="small" style={{ marginVertical: 20 }} />}
            {searchResults.map(item => (
              <SearchResult
                key={`${item.type}-${item.id}`}
                item={item}
                onPress={() => { setShowSearch(false); setSearchQuery(''); setSearchResults([]); }}
                isFav={item.type === 'team' ? isFavoriteTeam(item.id) : isFavoriteLeague(item.id)}
                onFavorite={(item) => {
                  if (item.type === 'team') toggleFavoriteTeam({ id: item.id, name: item.name, logo: item.logo, country: item.league });
                  else toggleFavoriteLeague({ id: item.id, name: item.name, logo: item.logo, country: item.country });
                }}
              />
            ))}
            {!searching && searchQuery.length >= 3 && searchResults.length === 0 && (
              <Text style={{ color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 14, textAlign: 'center', marginTop: 20 }}>
                No results found
              </Text>
            )}
            {searchQuery.length < 3 && searchQuery.length > 0 && (
              <Text style={{ color: colors.textTertiary, fontFamily: fonts.regular, fontSize: 13, textAlign: 'center', marginTop: 20 }}>
                Type at least 3 characters
              </Text>
            )}
          </View>
        )}

        {!showSearch && (
          <>
            {/* Tabs */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
              {tabs.map((tab, i) => (
                <TouchableOpacity key={tab} onPress={() => setActiveTab(i)}>
                  <LinearGradient
                    colors={i === activeTab ? [colors.gradientStart, colors.gradientMid] : ['transparent', 'transparent']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={{
                      paddingHorizontal: 18, paddingVertical: 9,
                      borderRadius: 50,
                      borderWidth: i !== activeTab ? 0.5 : 0,
                      borderColor: colors.cardBorder,
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

            {loading ? (
              <View style={{ paddingTop: 80, alignItems: 'center' }}>
                <ActivityIndicator color={colors.live} size="large" />
                <Text style={{ color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 14, marginTop: 12 }}>
                  {t('loading')}
                </Text>
              </View>
            ) : matches.length === 0 ? (
              <View style={{ paddingTop: 80, alignItems: 'center' }}>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>⚽</Text>
                <Text style={{ color: colors.textSecondary, fontFamily: fonts.semibold, fontSize: 16 }}>
                  No matches right now
                </Text>
              </View>
            ) : (
              <>
                {/* Hero card */}
                {heroMatch && (
                  <HeroMatchCard
                    match={heroMatch}
                    isLive={activeTab === 0}
                    onPress={() => navigation.navigate('MatchDetail', { match: heroMatch })}
                  />
                )}

                {/* Section label */}
                {restMatches.length > 0 && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <Text style={{ color: colors.textPrimary, fontFamily: fonts.bold, fontSize: 15 }}>
                      {activeTab === 0 ? 'Partidos en vivo' : activeTab === 1 ? 'Hoy' : 'Próximos'}
                    </Text>
                    <TouchableOpacity onPress={() => loadMatches()}>
                      <Text style={{ color: colors.live, fontFamily: fonts.semibold, fontSize: 13 }}>Ver todos</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Compact rows */}
                {restMatches.map(match => (
                  <CompactMatchRow
                    key={match.id}
                    match={match}
                    isLive={activeTab === 0}
                    onPress={() => navigation.navigate('MatchDetail', { match })}
                  />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>

      <LeagueFilterModal visible={showFilter} onClose={() => setShowFilter(false)} />
    </SafeAreaView>
  );
}
