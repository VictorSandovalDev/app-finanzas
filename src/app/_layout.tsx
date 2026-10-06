import { HankenGrotesk_400Regular, HankenGrotesk_500Medium, HankenGrotesk_600SemiBold } from '@expo-google-fonts/hanken-grotesk';
import { Newsreader_400Regular, Newsreader_400Regular_Italic, Newsreader_500Medium } from '@expo-google-fonts/newsreader';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ReactNode, useEffect } from 'react';
import { View } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '@/state/auth';
import { JourneyProvider, useJourney } from '@/state/journey';
import { colors } from '@/theme/tokens';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Newsreader_400Regular,
    Newsreader_400Regular_Italic,
    Newsreader_500Medium,
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
  });

  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <AuthProvider>
          <Journey>
            <StatusBar style="dark" />
            {fontsLoaded ? <Navigator /> : <Blank />}
          </Journey>
        </AuthProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}

/** Progress belongs to the signed-in account. */
function Journey({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  return <JourneyProvider userId={session?.user.id}>{children}</JourneyProvider>;
}

function Blank() {
  return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
}

function Navigator() {
  const { loading, session, profile } = useAuth();
  const { hydrated, state, update } = useJourney();

  // First time a member opens their journey, carry over the name they signed up with.
  useEffect(() => {
    if (!hydrated || !profile || profile.role !== 'member' || state.onboarded) return;
    update((s) => ({ ...s, name: profile.name, onboarded: true, joinedAt: s.joinedAt ?? profile.created_at }));
  }, [hydrated, profile, state.onboarded, update]);

  if (loading || (session && !hydrated)) return <Blank />;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: 'fade' }} />;
}
