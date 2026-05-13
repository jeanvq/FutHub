import { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

const ALL_LEAGUES = [
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

const DEFAULT_ACTIVE = [2, 39, 140, 78, 135, 61, 13, 11, 239, 262, 71, 128];

const UserContext = createContext({});

export function UserProvider({ children }) {
  const [favoriteTeams, setFavoriteTeams] = useState([]);
  const [favoriteLeagues, setFavoriteLeagues] = useState([]);
  const [activeLeagues, setActiveLeagues] = useState(DEFAULT_ACTIVE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFavoriteTeams(data.favoriteTeams || []);
        setFavoriteLeagues(data.favoriteLeagues || []);
        setActiveLeagues(data.activeLeagues || DEFAULT_ACTIVE);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavoriteTeam = async (team) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const exists = favoriteTeams.find(t => t.id === team.id);
      const updated = exists
        ? favoriteTeams.filter(t => t.id !== team.id)
        : [...favoriteTeams, team];
      setFavoriteTeams(updated);
      await updateDoc(doc(db, 'users', user.uid), { favoriteTeams: updated });
    } catch (error) {
      console.error('Error toggling favorite team:', error);
    }
  };

  const toggleFavoriteLeague = async (league) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const exists = favoriteLeagues.find(l => l.id === league.id);
      const updated = exists
        ? favoriteLeagues.filter(l => l.id !== league.id)
        : [...favoriteLeagues, league];
      setFavoriteLeagues(updated);
      await updateDoc(doc(db, 'users', user.uid), { favoriteLeagues: updated });
    } catch (error) {
      console.error('Error toggling favorite league:', error);
    }
  };

  const toggleActiveLeague = async (leagueId) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const exists = activeLeagues.includes(leagueId);
      const updated = exists
        ? activeLeagues.filter(id => id !== leagueId)
        : [...activeLeagues, leagueId];
      setActiveLeagues(updated);
      await updateDoc(doc(db, 'users', user.uid), { activeLeagues: updated });
    } catch (error) {
      console.error('Error toggling active league:', error);
    }
  };

  const setAllLeaguesActive = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      setActiveLeagues(DEFAULT_ACTIVE);
      await updateDoc(doc(db, 'users', user.uid), { activeLeagues: DEFAULT_ACTIVE });
    } catch (error) {
      console.error(error);
    }
  };

  const isFavoriteTeam = (teamId) => favoriteTeams.some(t => t.id === teamId);
  const isFavoriteLeague = (leagueId) => favoriteLeagues.some(l => l.id === leagueId);
  const isActiveLeague = (leagueId) => activeLeagues.includes(leagueId);

  return (
    <UserContext.Provider value={{
      favoriteTeams,
      favoriteLeagues,
      activeLeagues,
      loading,
      toggleFavoriteTeam,
      toggleFavoriteLeague,
      toggleActiveLeague,
      setAllLeaguesActive,
      isFavoriteTeam,
      isFavoriteLeague,
      isActiveLeague,
      loadUserData,
      ALL_LEAGUES,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
