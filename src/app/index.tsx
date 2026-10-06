import { Redirect } from 'expo-router';
import { View } from 'react-native';

import { useAuth } from '@/state/auth';
import { useJourney } from '@/state/journey';
import { colors } from '@/theme/tokens';

export default function Index() {
  const { session, profile } = useAuth();
  const { state } = useJourney();
  if (!session) return <Redirect href="/bienvenida" />;
  if (!profile) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  if (profile.role === 'mentor') return <Redirect href="/admin" />;
  return <Redirect href={state.unlocked.length ? '/viaje' : '/nivel/1'} />;
}
