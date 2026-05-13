const BASE_URL = 'https://v3.football.api-sports.io';
const API_KEY = process.env.EXPO_PUBLIC_FOOTBALL_KEY;

const headers = {
  'x-apisports-key': API_KEY,
};

export const LEAGUES = {
  CHAMPIONS_LEAGUE: 2,
  PREMIER_LEAGUE: 39,
  LA_LIGA: 140,
  BUNDESLIGA: 78,
  SERIE_A: 135,
  LIGA_BETPLAY: 239,
  LIBERTADORES: 13,
  SUDAMERICANA: 11,
  LIGUE_1: 61,
  LIGA_MX: 262,
  BRASILEIRAO: 71,
  ARGENTINA_LIGA: 128,
};

const SEASON = 2024;

export async function getLiveMatches() {
  try {
    const response = await fetch(`${BASE_URL}/fixtures?live=all`, { headers });
    const data = await response.json();
    return data.response || [];
  } catch (error) {
    console.error('Error fetching live matches:', error);
    return [];
  }
}

export async function getTodayMatches() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(`${BASE_URL}/fixtures?date=${today}`, { headers });
    const data = await response.json();
    return data.response || [];
  } catch (error) {
    console.error('Error fetching today matches:', error);
    return [];
  }
}

export async function getUpcomingFixtures(leagueId, next = 5) {
  try {
    const response = await fetch(
      `${BASE_URL}/fixtures?league=${leagueId}&season=${SEASON}&next=${next}`,
      { headers }
    );
    const data = await response.json();
    return data.response || [];
  } catch (error) {
    console.error('Error fetching upcoming fixtures:', error);
    return [];
  }
}

export async function getFixtureStats(fixtureId) {
  try {
    const response = await fetch(
      `${BASE_URL}/fixtures/statistics?fixture=${fixtureId}`,
      { headers }
    );
    const data = await response.json();
    return data.response || [];
  } catch (error) {
    console.error('Error fetching fixture stats:', error);
    return [];
  }
}

export async function getFixtureEvents(fixtureId) {
  try {
    const response = await fetch(
      `${BASE_URL}/fixtures/events?fixture=${fixtureId}`,
      { headers }
    );
    const data = await response.json();
    return data.response || [];
  } catch (error) {
    console.error('Error fetching fixture events:', error);
    return [];
  }
}

export async function getFixturePrediction(fixtureId) {
  try {
    const response = await fetch(
      `${BASE_URL}/predictions?fixture=${fixtureId}`,
      { headers }
    );
    const data = await response.json();
    if (data.response && data.response.length > 0) {
      const pred = data.response[0];
      return {
        homeWin: pred.predictions?.percent?.home?.replace('%', '') || null,
        draw: pred.predictions?.percent?.draw?.replace('%', '') || null,
        awayWin: pred.predictions?.percent?.away?.replace('%', '') || null,
        winner: pred.predictions?.winner?.name || null,
        advice: pred.predictions?.advice || null,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching prediction:', error);
    return null;
  }
}

function getCountryFlag(country) {
  const flags = {
    'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'Spain': '🇪🇸',
    'Germany': '🇩🇪',
    'Italy': '🇮🇹',
    'France': '🇫🇷',
    'Colombia': '🇨🇴',
    'World': '🌍',
    'South America': '🌎',
    'Netherlands': '🇳🇱',
    'Portugal': '🇵🇹',
    'Brazil': '🇧🇷',
    'Argentina': '🇦🇷',
    'Mexico': '🇲🇽',
    'USA': '🇺🇸',
    'Belgium': '🇧🇪',
    'Turkey': '🇹🇷',
    'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  };
  return flags[country] || '🌐';
}

export function formatMatch(fixture) {
  return {
    id: fixture.fixture.id.toString(),
    fixtureId: fixture.fixture.id,
    league: fixture.league.name,
    leagueIcon: getCountryFlag(fixture.league.country),
    leagueLogo: fixture.league.logo,
    leagueCountry: fixture.league.country,
    leagueCountryFlag: getCountryFlag(fixture.league.country),
    home: {
      name: fixture.teams.home.name,
      logo: fixture.teams.home.logo,
      score: fixture.goals.home ?? 0,
    },
    away: {
      name: fixture.teams.away.name,
      logo: fixture.teams.away.logo,
      score: fixture.goals.away ?? 0,
    },
    minute: fixture.fixture.status.elapsed
      ? `${fixture.fixture.status.elapsed}'`
      : new Date(fixture.fixture.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    status: fixture.fixture.status.short,
    prediction: null,
  };
}
