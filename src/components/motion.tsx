import { ReactNode, useEffect, useState } from 'react';
import { Animated, Easing, StyleProp, ViewStyle } from 'react-native';

import { useNativeDriver } from '@/theme/tokens';

const EASE_OUT = Easing.out(Easing.cubic);

/** A 0→1 Animated value that plays once after `delay`. */
export function useOnce(duration: number, delay = 0) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const anim = Animated.timing(v, { toValue: 1, duration, delay, easing: EASE_OUT, useNativeDriver });
    anim.start();
    return () => anim.stop();
  }, [v, duration, delay]);
  return v;
}

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * A 0→1 number driven by requestAnimationFrame, for animating SVG attributes
 * (Animated SVG props are unreliable on web).
 */
export function useProgress(duration: number, delay = 0) {
  const [p, setP] = useState(0);
  useEffect(() => {
    let frame = 0;
    let start: number | undefined;
    const timer = setTimeout(() => {
      const tick = (now: number) => {
        start ??= now;
        const t = Math.min(1, (now - start) / duration);
        setP(easeInOutCubic(t));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [duration, delay]);
  return p;
}

/** A 0→1→0 value that breathes forever. */
export function useBreath(duration: number) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: duration / 2, easing: Easing.inOut(Easing.sin), useNativeDriver }),
        Animated.timing(v, { toValue: 0, duration: duration / 2, easing: Easing.inOut(Easing.sin), useNativeDriver }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v, duration]);
  return v;
}

/** Fades in while rising a few pixels. */
export function FadeUp({ children, delay = 0, duration = 520, distance = 10, style }: { children: ReactNode; delay?: number; duration?: number; distance?: number; style?: StyleProp<ViewStyle> }) {
  const v = useOnce(duration, delay);
  return (
    <Animated.View style={[style, { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }] }]}>
      {children}
    </Animated.View>
  );
}
