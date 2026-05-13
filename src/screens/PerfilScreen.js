import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useUser } from '../context/UserContext';
import { colors, fonts } from '../theme';

export default function PerfilScreen() {
  const { favoriteTeams, favoriteLeagues, toggleFavoriteTeam, toggleFavoriteLeague } = useUser();
  const [activeTab, setActiveTab] = useState(0);
  const [signingOut, setSigningOut] = useState(false);
  const user = auth.currentUser;

  const handleSignOut = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            setSigningOut(true);
            try {
              await signOut(auth);
            } catch (e) {
              console.error(e);
              setSigningOut(false);
            }
          }
        }
      ]
    );
  };

  const handleRemoveTeam = (team) => {
    Alert.alert(
      'Remove team',
      `Remove ${team.name} from favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => toggleFavoriteTeam(team) }
      ]
    );
  };

  const handleRemoveLeague = (league) => {
    Alert.alert(
      'Remove league',
      `Remove ${league.name} from favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => toggleFavoriteLeague(league) }
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header perfil */}
        <LinearGradient
          colors={['rgba(0,255,178,0.08)', 'rgba(0,207,255,0.05)']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ padding: 24, alignItems: 'center', borderBottomWidth: 0.5, borderBottomColor: colors.cardBorder }}
        >
          <View style={{
            width: 80, height: 80, borderRadius: 40,
            backgroundColor: colors.card,
            borderWidth: 2, borderColor: colors.gradientStart,
            alignItems: 'center', justifyContent: 'center',
            marginBottom: 12,
          }}>
            <Text style={{ fontSize: 36 }}>
              {user?.displayName?.charAt(0).toUpperCase() || '👤'}
            </Text>
          </View>
          <Text style={{ color: colors.textPrimary, fontFamily: fonts.extrabold, fontSize: 22, marginBottom: 4 }}>
            {user?.displayName || 'Usuario'}
          </Text>
          <Text style={{ color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 14 }}>
            {user?.email}
          </Text>

          <View style={{ flexDirection: 'row', gap: 24, marginTop: 16 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: colors.live, fontFamily: fonts.extrabold, fontSize: 20 }}>
                {favoriteTeams.length}
              </Text>
              <Text style={{ color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 12 }}>
                Teams
              </Text>
            </View>
            <View style={{ width: 0.5, backgroundColor: colors.cardBorder }} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: colors.live, fontFamily: fonts.extrabold, fontSize: 20 }}>
                {favoriteLeagues.length}
              </Text>
              <Text style={{ color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 12 }}>
                Leagues
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Tabs */}
        <View style={{ flexDirection: 'row', padding: 16, gap: 8 }}>
          {['My Teams', 'My Leagues'].map((tab, i) => (
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

        <View style={{ paddingHorizontal: 16 }}>

          {/* My Teams */}
          {activeTab === 0 && (
            <View>
              {favoriteTeams.length === 0 ? (
                <View style={{ alignItems: 'center', paddingTop: 40 }}>
                  <Text style={{ fontSize: 40, marginBottom: 12 }}>⚽</Text>
                  <Text style={{ color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 14, textAlign: 'center' }}>
                    No favorite teams yet.{'\n'}Search and add teams from the home screen.
                  </Text>
                </View>
              ) : (
                favoriteTeams.map(team => (
                  <View key={team.id} style={{
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
                    <TouchableOpacity
                      onPress={() => handleRemoveTeam(team)}
                      style={{
                        backgroundColor: 'rgba(239,68,68,0.15)',
                        paddingHorizontal: 10, paddingVertical: 6,
                        borderRadius: 8,
                      }}
                    >
                      <Text style={{ color: '#ef4444', fontFamily: fonts.semibold, fontSize: 12 }}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          )}

          {/* My Leagues */}
          {activeTab === 1 && (
            <View>
              {favoriteLeagues.length === 0 ? (
                <View style={{ alignItems: 'center', paddingTop: 40 }}>
                  <Text style={{ fontSize: 40, marginBottom: 12 }}>🏆</Text>
                  <Text style={{ color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 14, textAlign: 'center' }}>
                    No favorite leagues yet.{'\n'}Go to Favorites to add leagues.
                  </Text>
                </View>
              ) : (
                favoriteLeagues.map(league => (
                  <View key={league.id} style={{
                    flexDirection: 'row', alignItems: 'center',
                    backgroundColor: colors.card, borderRadius: 12,
                    borderWidth: 0.5, borderColor: colors.cardBorder,
                    padding: 12, marginBottom: 8, gap: 12,
                  }}>
                    {league.logo ? (
                      <Image source={{ uri: league.logo }} style={{ width: 36, height: 36 }} resizeMode="contain" />
                    ) : (
                      <View style={{
                        width: 36, height: 36, borderRadius: 18,
                        backgroundColor: colors.backgroundSecondary,
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Text style={{ fontSize: 18 }}>🏆</Text>
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.textPrimary, fontFamily: fonts.semibold, fontSize: 14 }}>
                        {league.name}
                      </Text>
                      <Text style={{ color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 12 }}>
                        {league.country}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemoveLeague(league)}
                      style={{
                        backgroundColor: 'rgba(239,68,68,0.15)',
                        paddingHorizontal: 10, paddingVertical: 6,
                        borderRadius: 8,
                      }}
                    >
                      <Text style={{ color: '#ef4444', fontFamily: fonts.semibold, fontSize: 12 }}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          )}

        </View>

        {/* Sign out */}
        <View style={{ padding: 24, marginTop: 8 }}>
          <TouchableOpacity onPress={handleSignOut} disabled={signingOut}>
            <View style={{
              backgroundColor: 'rgba(239,68,68,0.1)',
              borderWidth: 0.5, borderColor: '#ef4444',
              borderRadius: 12, paddingVertical: 14,
              alignItems: 'center',
            }}>
              {signingOut ? (
                <ActivityIndicator color="#ef4444" />
              ) : (
                <Text style={{ color: '#ef4444', fontFamily: fonts.bold, fontSize: 15 }}>
                  Sign out
                </Text>
              )}
            </View>
          </TouchableOpacity>

          <Text style={{ color: colors.textTertiary, fontFamily: fonts.regular, fontSize: 11, textAlign: 'center', marginTop: 16 }}>
            FutHub v1.0.0
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
