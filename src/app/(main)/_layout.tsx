import { Tabs } from 'expo-router';
import { useWindowDimensions } from 'react-native';

import { GameTabBar } from '@/components/GameTabBar';
import { colors } from '@/theme/tokens';

export default function MainLayout() {
  const vertical = useWindowDimensions().width >= 1024;
  return (
    <Tabs
      tabBar={(props) => <GameTabBar {...props} vertical={vertical} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bg },
        tabBarPosition: vertical ? 'left' : 'bottom',
      }}
    >
      <Tabs.Screen name="viaje" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="mapa" options={{ title: 'Mapa' }} />
      <Tabs.Screen name="mentor" options={{ title: 'Mentor' }} />
      <Tabs.Screen name="perfil" options={{ title: 'Pasaporte' }} />
    </Tabs>
  );
}
