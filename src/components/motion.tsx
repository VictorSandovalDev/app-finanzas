import { ReactNode, useEffect, useState } from 'react';
import { Animated, Easing, StyleProp, ViewStyle } from 'react-native';

import { useNativeDriver } from '@/theme/tokens';

/** A 0→1 value that loops forever. */
export function useLoop(duration: number, delay = 0) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, { toValue: 1, duration, easing: Easing.linear, useNativeDriver }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v, duration, delay]);
  return v;
}

/** A 0→1 value that plays once after `delay`. */
export function useOnce(duration: number, delay = 0) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const anim = Animated.timing(v, { toValue: 1, duration, delay, easing: Easing.linear, useNativeDriver });
    anim.start();
    return () => anim.stop();
  }, [v, duration, delay]);
  return v;
}

/**
 * CSS `steps(n)`: holds each keyframe value instead of tweening.
 * `frames` are the values shown at t = 0, 1/n, 2/n …
 */
export function stepped(v: Animated.Value, frames: number[]) {
  const n = frames.length;
  const inputRange: number[] = [];
  const outputRange: number[] = [];
  frames.forEach((f, i) => {
    inputRange.push(i / n, (i + 1) / n - 0.0001);
    outputRange.push(f, f);
  });
  inputRange.push(1);
  outputRange.push(frames[n - 1]);
  return v.interpolate({ inputRange, outputRange });
}

/** vfBob: floats 6px up and back in discrete steps. */
export function Bob({ children, duration = 2000, steps = 4, amplitude = 6, style }: { children: ReactNode; duration?: number; steps?: number; amplitude?: number; style?: StyleProp<ViewStyle> }) {
  const v = useLoop(duration);
  const frames = Array.from({ length: steps }, (_, i) => -amplitude * Math.sin((Math.PI * i) / steps));
  return <Animated.View style={[style, { transform: [{ translateY: stepped(v, frames) }] }]}>{children}</Animated.View>;
}

/** vfPop: 0.4 → 1.12 → 1 scale with fade, in steps, after a delay. */
export function Pop({ children, delay = 0, duration = 500, style }: { children: ReactNode; delay?: number; duration?: number; style?: StyleProp<ViewStyle> }) {
  const v = useOnce(duration, delay);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: stepped(v, [0, 0.5, 1, 1, 1]),
          transform: [{ scale: stepped(v, [0.4, 0.75, 1.12, 1.04, 1]) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
