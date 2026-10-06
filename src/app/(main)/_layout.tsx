import { Redirect, Tabs } from 'expo-router';
import { useEffect } from 'react';
import { useWindowDimensions } from 'react-native';

import { TabBar } from '@/components/TabBar';
import { useAuth } from '@/state/auth';
import { useTransformation } from '@/state/conversation';
import { useJourney } from '@/state/journey';
import { colors } from '@/theme/tokens';

export default function MainLayout() {
  const vertical = useWindowDimensions().width >= 1024;
  const { session } = useAuth();
  useMentorDeliverables(session?.user.id);
  if (!session) return <Redirect href="/bienvenida" />;
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

/** When the mentor publishes the Personal Map and phrases, they land in the member's journey. */
function useMentorDeliverables(memberId: string | undefined) {
  const row = useTransformation(memberId);
  const { update } = useJourney();
  useEffect(() => {
    if (!row?.published_at) return;
    update((s) => {
      if (s.level1.map && JSON.stringify(s.level1.map) === JSON.stringify(row.map) && JSON.stringify(s.level1.mantras) === JSON.stringify(row.mantras)) return s;
      return { ...s, level1: { ...s.level1, map: row.map, mantras: row.mantras } };
    });
  }, [row, update]);
}
