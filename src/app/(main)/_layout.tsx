import { Tabs } from 'expo-router';
import { useWindowDimensions } from 'react-native';

import { TabBar } from '@/components/TabBar';
import { colors } from '@/theme/tokens';

export default function MainLayout() {
  const vertical = useWindowDimensions().width >= 1024;
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} vertical={vertical} />}
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
      {/* Detail sections: inside the tabs so the bar stays visible, but not shown as tabs. */}
      <Tabs.Screen name="nivel" options={{ href: null }} />
      <Tabs.Screen name="mision" options={{ href: null }} />
      <Tabs.Screen name="logro" options={{ href: null }} />
    </Tabs>
  );
}
