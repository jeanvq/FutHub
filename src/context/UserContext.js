import { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

const UserContext = createContext({});

export function UserProvider({ children }) {
  const [favoriteTeams, setFavoriteTeams] = useState([]);
  const [favoriteLeagues, setFavoriteLeagues] = useState([]);
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
      let updated;
      if (exists) {
        updated = favoriteTeams.filter(t => t.id !== team.id);
      } else {
        updated = [...favoriteTeams, team];
      }
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
      let updated;
      if (exists) {
        updated = favoriteLeagues.filter(l => l.id !== league.id);
      } else {
        updated = [...favoriteLeagues, league];
      }
      setFavoriteLeagues(updated);
      await updateDoc(doc(db, 'users', user.uid), { favoriteLeagues: updated });
    } catch (error) {
      console.error('Error toggling favorite league:', error);
    }
  };

  const isFavoriteTeam = (teamId) => favoriteTeams.some(t => t.id === teamId);
  const isFavoriteLeague = (leagueId) => favoriteLeagues.some(l => l.id === leagueId);

  return (
    <UserContext.Provider value={{
      favoriteTeams,
      favoriteLeagues,
      loading,
      toggleFavoriteTeam,
      toggleFavoriteLeague,
      isFavoriteTeam,
      isFavoriteLeague,
      loadUserData,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
