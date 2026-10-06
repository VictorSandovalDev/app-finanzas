import { ReactNode } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { Icon, IconName } from '@/components/Icon';
import { FadeUp, useOnce, useProgress } from '@/components/motion';
import { colors } from '@/theme/tokens';

const SIZE = 148;
const R = 70;
const C = 2 * Math.PI * R;

/** Full-screen moment: a brass ring draws itself around the emblem, then the content rises in. */
export function Celebration({ icon, children }: { icon: IconName; children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const ring = useProgress(1100, 200);
  const emblem = useOnce(600, 700);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 24, paddingBottom: 24 }]}>
      <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFill}>
          <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke="rgba(244,241,233,0.12)" strokeWidth={1} fill="none" />
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            stroke={colors.brass}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${C} ${C}`}
            strokeDashoffset={C * (1 - ring)}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        </Svg>
        <Animated.View style={{ opacity: emblem, transform: [{ scale: emblem.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }] }}>
          <Icon name={icon} size={56} color={colors.onDark} weight="light" />
        </Animated.View>
      </View>
      <FadeUp delay={1100} style={styles.content}>
        {children}
      </FadeUp>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.forestDeep, alignItems: 'center', justifyContent: 'center', gap: 36, paddingHorizontal: 24 },
  content: { width: '100%', maxWidth: 420, alignItems: 'center', gap: 14 },
});
