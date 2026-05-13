import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, TextInput } from 'react-native';
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
const currentYear = new Date().getFullYear();
const SEASON = new Date().getMonth() >= 7 ? currentYear : currentYear - 1;

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
      <Image source={{ uri: logo }} style={{ width: 40, height: 40, marginBottom: 4 }} resizeMode="contain" />
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

function SectionLabel({ title, icon }) {
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', gap: 6,
      marginBottom: 10, marginTop: 4,
    }}>
      <Text style={{ fontSize: 14 }}>{icon}</Text>
      <Text style={{ color: colors.textSecondary, fontFamily: fonts.bold, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8 }}>
        {title}
      </Text>
      <View style={{ flex: 1, height: 0.5, backgroundColor: colors.cardBorder, marginLeft: 6 }} />
    </View>
  );
}

function MatchCard({ match, onPress, isLive }) {
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
            {match.leagueLogo ? (
              <Image source={{ uri: match.leagueLogo }} style={{ width: 18, height: 18 }} resizeMode="contain" />
            ) : (
              <Text style={{ fontSize: 12 }}>{match.leagueIcon}</Text>
            )}
            <Text style={{ color: colors.textSecondary, fontFamily: fonts.semibold, fontSize: 11 }}>
              {match.league}
            </Text>
            <Text style={{ fontSize: 11 }}>{match.leagueCountryFlag}</Text>
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
              <Text style={{ color: colors.textSecondary, fontFamily: fonts.bold, fontSize: 18 }}>vs</Text>
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
        <TouchableOpacity onPress={(e) => { e.stopPropagation(); onFavorite(item); }} style={{ padding: 4 }}>
          <Text style={{ fontSize: 22 }}>{isFav ? '💚' : '🤍'}</Text>
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
  useEffect(() => {
    loadMatches();
  }, [activeTab]);

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

  // Separar favoritos del resto
  const favoriteMatches = matches.filter(match => {
    const homeFav = isFavoriteTeam(match.home.id);
    const awayFav = isFavoriteTeam(match.away.id);
    const leagueFav = isFavoriteLeague(match.leagueId);
    return homeFav || awayFav || leagueFav;
  });

  const otherMatches = matches.filter(match => {
  const homeFav = isFavoriteTeam(match.home.id);
  const awayFav = isFavoriteTeam(match.away.id);
  const leagueFav = isFavoriteLeague(match.leagueId);
  const leagueActive = isActiveLeague(match.leagueId);
  return !homeFav && !awayFav && !leagueFav && leagueActive;
});

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
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          {!showSearch ? (
            <>
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientMid]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{ borderRadius: 6, paddingHorizontal: 2 }}
              >
                <Text style={{ color: colors.background, fontFamily: fonts.extrabold, fontSize: 26, letterSpacing: -0.5 }}>
                  {t('app_name')}
                </Text>
              </LinearGradient>
              <View style={{ flexDirection: 'row', gap: 12 }}>
  <TouchableOpacity onPress={() => setShowSearch(true)}>
    <Text style={{ fontSize: 22 }}>🔍</Text>
  </TouchableOpacity>
  <TouchableOpacity onPress={() => setShowFilter(true)}>
    <Text style={{ fontSize: 22 }}>⚙️</Text>
  </TouchableOpacity>
  <TouchableOpacity>
    <Text style={{ fontSize: 22 }}>🔔</Text>
  </TouchableOpacity>
</View>
            </>
          ) : (
            <>
              <View style={{
                flex: 1, flexDirection: 'row', alignItems: 'center',
                backgroundColor: colors.card, borderRadius: 12,
                borderWidth: 0.5, borderColor: colors.cardBorder,
                paddingHorizontal: 12, paddingVertical: 8, gap: 8,
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
      if (item.type === 'team') {
        toggleFavoriteTeam({ id: item.id, name: item.name, logo: item.logo, country: item.league });
      } else {
        toggleFavoriteLeague({ id: item.id, name: item.name, logo: item.logo, country: item.country });
      }
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

        {/* Main content */}
        {!showSearch && (
          <>
            {/* Tabs */}
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
                  No matches right now
                </Text>
              </View>
            ) : (
              <>
                {/* Favoritos primero */}
                {favoriteMatches.length > 0 && (
                  <View style={{ marginBottom: 8 }}>
                    <SectionLabel title="Your favorites" icon="⭐" />
                    {favoriteMatches.map(match => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        isLive={activeTab === 0}
                        onPress={() => navigation.navigate('MatchDetail', { match })}
                      />
                    ))}
                  </View>
                )}

                {/* Resto de partidos */}
                <View>
                  {favoriteMatches.length > 0 && (
                    <SectionLabel title="All matches" icon="🌍" />
                  )}
                  {otherMatches.map(match => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      isLive={activeTab === 0}
                      onPress={() => navigation.navigate('MatchDetail', { match })}
                    />
                  ))}
                </View>
              </>
            )}

            {/* Refresh button */}
            <TouchableOpacity onPress={loadMatches} style={{ alignItems: 'center', marginTop: 16 }}>
              <Text style={{ color: colors.textTertiary, fontFamily: fonts.regular, fontSize: 13 }}>↻ Refresh</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
      <LeagueFilterModal visible={showFilter} onClose={() => setShowFilter(false)} />
    </SafeAreaView>
  );
}
