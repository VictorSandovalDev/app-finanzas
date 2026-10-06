import { CormorantGaramond_600SemiBold_Italic } from '@expo-google-fonts/cormorant-garamond';
import { Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold, Nunito_900Black } from '@expo-google-fonts/nunito';
import { Silkscreen_400Regular } from '@expo-google-fonts/silkscreen';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { JourneyProvider, useJourney } from '@/state/journey';
import { colors } from '@/theme/tokens';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
    Silkscreen_400Regular,
    CormorantGaramond_600SemiBold_Italic,
  });

  return (
    <SafeAreaProvider>
      <JourneyProvider>
        <StatusBar style="dark" />
        {fontsLoaded ? <Navigator /> : <View style={{ flex: 1, backgroundColor: colors.bg }} />}
      </JourneyProvider>
    </SafeAreaProvider>
  );
}

function Navigator() {
  const { hydrated } = useJourney();
  if (!hydrated) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: 'fade_from_bottom' }}>
      <Stack.Screen name="logro/[id]" options={{ animation: 'fade', gestureEnabled: false, contentStyle: { backgroundColor: colors.bosque } }} />
      <Stack.Screen name="nivel/[id]/desbloquear" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
