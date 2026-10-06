import { Tabs } from 'expo-router';
import { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Sprite, SpriteName } from '@/components/Sprite';
import { colors, fonts } from '@/theme/tokens';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const TABS: Record<string, { label: string; webLabel: string; sprite: SpriteName }> = {
  viaje: { label: 'INICIO', webLabel: 'Inicio', sprite: 'house' },
  mapa: { label: 'MAPA', webLabel: 'Mapa', sprite: 'compass' },
  mentor: { label: 'MENTOR', webLabel: 'Mentor', sprite: 'mentor' },
  perfil: { label: 'PASAPORTE', webLabel: 'Pasaporte', sprite: 'seal' },
};

/** Bottom bar on phones; left sidebar on wide screens (`vertical`). */
export function GameTabBar({ state, navigation, insets, vertical }: TabBarProps & { vertical: boolean }) {
  const items = state.routes.filter((r) => TABS[r.name]);
  const onPress = (name: string, key: string, focused: boolean) => {
    const event = navigation.emit({ type: 'tabPress', target: key, canPreventDefault: true });
    if (!focused && !event.defaultPrevented) navigation.navigate(name);
  };

  if (vertical) {
    return (
      <View style={[styles.side, { paddingTop: insets.top + 20 }]}>
        <View style={styles.brand}>
          <Sprite name="compass" width={32} />
          <Text style={styles.brandText}>Viaje Financiero</Text>
        </View>
        {items.map((route) => {
          const tab = TABS[route.name];
          const focused = state.routes[state.index].key === route.key;
          return (
            <Pressable
              key={route.key}
              onPress={() => onPress(route.name, route.key, focused)}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              style={[styles.sideRow, focused && styles.active]}
            >
              <Sprite name={tab.sprite} width={32} height={32} filter={focused ? 'none' : 'grayscale'} opacity={focused ? 1 : 0.55} />
              <Text style={[styles.sideLabel, { color: focused ? colors.verde : colors.muted }]}>{tab.webLabel}</Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {items.map((route) => {
        const tab = TABS[route.name];
        const focused = state.routes[state.index].key === route.key;
        return (
          <Pressable
            key={route.key}
            onPress={() => onPress(route.name, route.key, focused)}
            accessibilityRole="tab"
            accessibilityLabel={tab.webLabel}
            accessibilityState={{ selected: focused }}
            style={[styles.bottomItem, focused && styles.active]}
          >
            <Sprite name={tab.sprite} width={28} height={28} filter={focused ? 'none' : 'grayscale'} opacity={focused ? 1 : 0.55} />
            <Text style={[styles.bottomLabel, { color: focused ? colors.verde : colors.muted }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottom: {
    flexDirection: 'row',
    gap: 6,
    paddingTop: 8,
    paddingHorizontal: 10,
    backgroundColor: colors.bg,
    borderTopWidth: 2,
    borderTopColor: colors.divider,
  },
  bottomItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  bottomLabel: { fontFamily: fonts.game, fontSize: 9 },
  active: { backgroundColor: colors.verdePick, borderColor: colors.verdeLight },
  side: {
    width: 240,
    paddingHorizontal: 12,
    gap: 6,
    backgroundColor: colors.bg,
    borderRightWidth: 2,
    borderRightColor: colors.divider,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8, paddingBottom: 18 },
  brandText: { fontFamily: fonts.title, fontSize: 20, color: colors.bosque },
  sideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sideLabel: { fontFamily: fonts.title, fontSize: 15, letterSpacing: 0.6, textTransform: 'uppercase' },
});
