import { Tabs } from 'expo-router';
import { ComponentProps, useEffect, useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon, IconName } from '@/components/Icon';
import { colors, fonts } from '@/theme/tokens';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const TABS: { name: string; label: string; icon: IconName }[] = [
  { name: 'viaje', label: 'Inicio', icon: 'home' },
  { name: 'mapa', label: 'Ruta', icon: 'map' },
  { name: 'mentor', label: 'Mentor', icon: 'chat' },
  { name: 'perfil', label: 'Perfil', icon: 'passport' },
];

/** Detail sections live inside the tabs; this is the tab they belong to. */
const SECTION_OF: Record<string, string> = { nivel: 'mapa', logro: 'mapa', mision: 'mapa' };

function useKeyboardVisible() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const show = Keyboard.addListener('keyboardDidShow', () => setVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return visible;
}

/** Bottom bar on phones; left sidebar on wide screens. Always visible except while typing. */
export function TabBar({ state, navigation, insets, vertical }: TabBarProps & { vertical: boolean }) {
  const keyboard = useKeyboardVisible();
  const currentName = state.routes[state.index].name.split('/')[0];
  const active = SECTION_OF[currentName] ?? currentName;

  const go = (name: string) => {
    const route = state.routes.find((r) => r.name === name);
    if (!route) return;
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!event.defaultPrevented) navigation.navigate(name);
  };

  if (keyboard && !vertical) return null;

  if (vertical) {
    return (
      <View style={[styles.side, { paddingTop: insets.top + 28 }]}>
        <Text style={styles.brand}>Viaje Financiero</Text>
        <View style={{ gap: 2 }}>
          {TABS.map((tab) => {
            const focused = active === tab.name;
            return (
              <Pressable
                key={tab.name}
                onPress={() => go(tab.name)}
                accessibilityRole="tab"
                accessibilityState={{ selected: focused }}
                style={({ pressed }) => [styles.sideRow, focused && styles.sideActive, pressed && { opacity: 0.8 }]}
              >
                <Icon name={tab.icon} size={22} color={focused ? colors.ink : colors.muted} weight={focused ? 'fill' : 'regular'} />
                <Text style={[styles.sideLabel, { color: focused ? colors.ink : colors.muted }]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {TABS.map((tab) => {
        const focused = active === tab.name;
        return (
          <Pressable
            key={tab.name}
            onPress={() => go(tab.name)}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: focused }}
            style={styles.item}
          >
            <Icon name={tab.icon} size={24} color={focused ? colors.ink : colors.muted} weight={focused ? 'fill' : 'regular'} />
            <Text style={[styles.label, { color: focused ? colors.ink : colors.muted }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottom: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  item: { flex: 1, alignItems: 'center', gap: 3, paddingTop: 8, paddingBottom: 4 },
  label: { fontFamily: fonts.sansSemi, fontSize: 11 },
  side: {
    width: 248,
    paddingHorizontal: 16,
    gap: 28,
    backgroundColor: colors.surface,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.line,
  },
  brand: { fontFamily: fonts.display, fontSize: 19, color: colors.ink, paddingHorizontal: 12 },
  sideRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, paddingHorizontal: 12, borderRadius: 10 },
  sideActive: { backgroundColor: colors.sunken },
  sideLabel: { fontFamily: fonts.sansMedium, fontSize: 15 },
});
