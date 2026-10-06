import { HankenGrotesk_400Regular, HankenGrotesk_500Medium, HankenGrotesk_600SemiBold } from '@expo-google-fonts/hanken-grotesk';
import { Newsreader_400Regular, Newsreader_400Regular_Italic, Newsreader_500Medium } from '@expo-google-fonts/newsreader';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
        <JourneyProvider>
          <StatusBar style="dark" />
          {fontsLoaded ? <Navigator /> : <View style={{ flex: 1, backgroundColor: colors.bg }} />}
        </JourneyProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}

function Navigator() {
  const { hydrated } = useJourney();
  if (!hydrated) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: 'fade' }} />;
}
