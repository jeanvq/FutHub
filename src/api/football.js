const BASE_URL = 'https://v3.football.api-sports.io';
const API_KEY = process.env.EXPO_PUBLIC_FOOTBALL_KEY;

console.log('FOOTBALL KEY:', API_KEY?.slice(0, 15));

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
    console.log('TODAY MATCHES:', JSON.stringify(data).slice(0, 300));
    return data.response || [];
  } catch (error) {
    console.error('Error fetching today matches:', error);
    return [];
  }
}

export async function getFixturesByLeague(leagueId) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(
      `${BASE_URL}/fixtures?league=${leagueId}&season=${SEASON}&from=${today}&to=${today}`,
      { headers }
    );
    const data = await response.json();
    return data.response || [];
  } catch (error) {
    console.error('Error fetching fixtures:', error);
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

export function formatMatch(fixture) {
  return {
    id: fixture.fixture.id.toString(),
    league: fixture.league.name,
    leagueIcon: getLeagueIcon(fixture.league.id),
    leagueLogo: fixture.league.logo,
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
    prediction: Math.floor(Math.random() * 30) + 55,
  };
}

function getLeagueIcon(leagueId) {
  const icons = {
    2: '🏆',
    39: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    140: '🇪🇸',
    78: '🇩🇪',
    135: '🇮🇹',
    239: '🇨🇴',
  };
  return icons[leagueId] || '⚽';
}
