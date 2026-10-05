import {
  CormorantGaramond_500Medium,
  CormorantGaramond_500Medium_Italic,
  CormorantGaramond_600SemiBold,
} from '@expo-google-fonts/cormorant-garamond';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { JourneyProvider, useJourney } from '@/state/journey';
import { colors } from '@/theme/tokens';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    CormorantGaramond_500Medium,
    CormorantGaramond_500Medium_Italic,
    CormorantGaramond_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  return (
    <SafeAreaProvider>
      <JourneyProvider>
        <StatusBar style="dark" />
        {fontsLoaded ? <Navigator /> : <View style={{ flex: 1, backgroundColor: colors.ivory }} />}
      </JourneyProvider>
    </SafeAreaProvider>
  );
}

function Navigator() {
  const { hydrated } = useJourney();
  if (!hydrated) return <View style={{ flex: 1, backgroundColor: colors.ivory }} />;
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.ivory }, animation: 'fade_from_bottom' }}>
      <Stack.Screen name="logro/[id]" options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="nivel/[id]/desbloquear" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
