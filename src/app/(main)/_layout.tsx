import { Tabs } from 'expo-router';

import { Icon } from '@/components/Icon';
import { colors, fonts } from '@/theme/tokens';

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.ivory },
        tabBarActiveTintColor: colors.forest,
        tabBarInactiveTintColor: colors.warmGray,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.line, height: 64, paddingTop: 6 },
        tabBarLabelStyle: { fontFamily: fonts.sansMedium, fontSize: 11 },
      }}
    >
      <Tabs.Screen name="viaje" options={{ title: 'Mi viaje', tabBarIcon: ({ color }) => <Icon name="map" color={color as string} /> }} />
      <Tabs.Screen name="entregables" options={{ title: 'Entregables', tabBarIcon: ({ color }) => <Icon name="doc" color={color as string} /> }} />
      <Tabs.Screen name="perfil" options={{ title: 'Pasaporte', tabBarIcon: ({ color }) => <Icon name="passport" color={color as string} /> }} />
    </Tabs>
  );
}
