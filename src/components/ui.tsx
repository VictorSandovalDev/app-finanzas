import { router } from 'expo-router';
import { createContext, ReactNode, useContext } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextProps,
  TextStyle,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Sprite } from '@/components/Sprite';
import { colors, fonts, maxContentWidth, radius, space } from '@/theme/tokens';

/** Horizontal page padding: clamp(16px, 3cqw, 40px). */
export function useGutter() {
  const { width } = useWindowDimensions();
  return Math.min(40, Math.max(16, width * 0.03));
}

/** True on wide (web/tablet) layouts, where the design switches to two columns. */
export function useWide(breakpoint = 760) {
  return useWindowDimensions().width >= breakpoint;
}

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  background?: string;
  /** Sticky content above the scroll area (e.g. the HUD). */
  header?: ReactNode;
  /** Sticky bar at the bottom. */
  footer?: ReactNode;
  maxWidth?: number;
  contentStyle?: StyleProp<ViewStyle>;
  /** Skip the top safe-area inset (when a header already handles it). */
  edgeToEdge?: boolean;
};

export function Screen({
  children,
  scroll = true,
  background = colors.bg,
  header,
  footer,
  maxWidth = maxContentWidth,
  contentStyle,
  edgeToEdge,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const gutter = useGutter();
  const inner = (
    <View style={[{ width: '100%', maxWidth, alignSelf: 'center', paddingHorizontal: gutter, gap: space.lg }, contentStyle]}>
      {children}
    </View>
  );
  return (
    <View style={{ flex: 1, backgroundColor: background, paddingTop: edgeToEdge ? 0 : insets.top }}>
      {header}
      {scroll ? (
        <ScrollView
          contentContainerStyle={{ paddingTop: space.lg, paddingBottom: footer ? space.xl : insets.bottom + space.xxxl }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {inner}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>{inner}</View>
      )}
      {footer ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 18, backgroundColor: background }]}>
          <View style={{ width: '100%', maxWidth, alignSelf: 'center', paddingHorizontal: gutter, gap: space.sm }}>{footer}</View>
        </View>
      ) : null}
    </View>
  );
}

type Variant = 'title' | 'h2' | 'body' | 'bodyStrong' | 'small' | 'phrase';

export function T({ variant = 'body', style, ...rest }: TextProps & { variant?: Variant }) {
  return <Text {...rest} style={[text[variant], style]} />;
}

/** Silkscreen label — short game texts only. */
export function GameLabel({ children, color = colors.inkSoft, size = 12, style }: { children: ReactNode; color?: string; size?: number; style?: StyleProp<TextStyle> }) {
  return <Text style={[{ fontFamily: fonts.game, fontSize: size, color, lineHeight: size * 1.35 }, style]}>{children}</Text>;
}

export type ButtonVariant = 'verde' | 'oro' | 'brasa' | 'lacre' | 'secondary' | 'outlineDark' | 'bosque';

const BUTTON: Record<ButtonVariant, { bg: string; fg: string; shade: string; border?: string }> = {
  verde: { bg: colors.verde, fg: colors.bg, shade: colors.bosque },
  oro: { bg: colors.oro, fg: colors.bosque, shade: colors.oroDark },
  brasa: { bg: colors.brasa, fg: colors.bg, shade: colors.lacre },
  lacre: { bg: colors.lacre, fg: colors.bg, shade: colors.lacreDark },
  bosque: { bg: colors.bosque, fg: colors.bg, shade: colors.bosqueDeep },
  secondary: { bg: colors.card, fg: colors.verde, shade: colors.border, border: colors.border },
  outlineDark: { bg: 'transparent', fg: colors.bg, shade: 'rgba(251,248,242,0.3)', border: 'rgba(251,248,242,0.3)' },
};

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: 'lg' | 'md' | 'sm';
  loading?: boolean;
  disabled?: boolean;
  uppercase?: boolean;
  left?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** "Botón con volumen": a 5px bottom edge that sinks 3px when pressed. */
export function ChunkyButton({ label, onPress, variant = 'verde', size = 'lg', loading, disabled, uppercase = true, left, style }: ButtonProps) {
  const v = BUTTON[variant];
  const edge = size === 'sm' ? 4 : 5;
  const pad = size === 'lg' ? 16 : size === 'md' ? 13 : 10;
  const fontSize = size === 'lg' ? 16 : size === 'md' ? 15 : 13;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => {
        const sunk = pressed && !disabled ? edge - 2 : 0;
        return [
          {
            backgroundColor: v.bg,
            borderColor: v.border ?? v.shade,
            borderWidth: v.border ? 2 : 0,
            borderBottomWidth: edge - sunk,
            borderBottomColor: v.shade,
            marginTop: sunk,
            borderRadius: size === 'sm' ? 14 : radius.button,
            paddingVertical: pad - (v.border ? 2 : 0),
            paddingHorizontal: size === 'sm' ? 12 : 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            opacity: disabled ? 0.5 : 1,
          } as ViewStyle,
          style,
        ];
      }}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <>
          {left}
          <Text
            style={{
              fontFamily: fonts.title,
              fontSize,
              color: v.fg,
              letterSpacing: uppercase ? fontSize * 0.06 : 0,
              textTransform: uppercase ? 'uppercase' : 'none',
              textAlign: 'center',
            }}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

type CardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  bg?: string;
  borderColor?: string;
  edge?: number;
  dashed?: boolean;
  radius?: number;
};

/** Card: 2px border with a 5px bottom edge. */
export function Card({ children, style, onPress, bg = colors.card, borderColor = colors.border, edge = 5, dashed, radius: r = radius.card }: CardProps) {
  const base: ViewStyle = {
    backgroundColor: bg,
    borderWidth: 2,
    borderBottomWidth: dashed ? 2 : edge,
    borderColor,
    borderStyle: dashed ? 'dashed' : 'solid',
    borderRadius: r,
    padding: space.lg,
  };
  if (!onPress) return <View style={[base, style]}>{children}</View>;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [base, style, pressed && { opacity: 0.85 }]}>
      {children}
    </Pressable>
  );
}

export function Chip({ label, fg, bg, size = 11 }: { label: string; fg: string; bg: string; size?: number }) {
  return (
    <View style={{ backgroundColor: bg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' }}>
      <Text style={{ fontFamily: fonts.game, fontSize: size, color: fg }}>{label}</Text>
    </View>
  );
}

/** Chunky progress bar with an inset bottom shade on the fill. */
export function ProgressBar({
  value,
  color = colors.oro,
  shade = colors.oroDark,
  track = colors.divider,
  height = 16,
}: {
  value: number;
  color?: string;
  shade?: string;
  track?: string;
  height?: number;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <View style={{ height, borderRadius: radius.pill, backgroundColor: track, overflow: 'hidden' }}>
      {pct > 0 && (
        <View style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: radius.pill, overflow: 'hidden' }}>
          <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: Math.max(3, Math.round(height / 4)), backgroundColor: shade }} />
        </View>
      )}
    </View>
  );
}

/** Round route node: fill with an inset bottom shade (box-shadow: inset 0 -6px 0). */
export function Node({
  size = 64,
  color,
  shade,
  children,
  style,
}: {
  size?: number;
  color: string;
  shade: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const h = Math.round(size * 0.94);
  const inset = Math.max(3, Math.round(size / 10.5));
  return (
    <View style={[{ width: size, height: h, borderRadius: size, backgroundColor: shade, overflow: 'hidden' }, style]}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: inset, borderRadius: size, backgroundColor: color }} />
      <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', paddingBottom: inset / 2 }]}>{children}</View>
    </View>
  );
}

export function BackButton({ onPress, kind = 'back' }: { onPress?: () => void; kind?: 'back' | 'close' }) {
  return (
    <Pressable
      onPress={onPress ?? (() => (router.canGoBack() ? router.back() : router.replace('/viaje')))}
      accessibilityLabel={kind === 'back' ? 'Volver' : 'Cerrar'}
      hitSlop={8}
      style={styles.back}
    >
      <Text style={{ fontFamily: fonts.title, fontSize: 18, color: colors.inkSoft }}>{kind === 'back' ? '←' : '✕'}</Text>
    </Pressable>
  );
}

/** Victor speaking: portrait + speech bubble with a flat bottom-left corner. */
export function MentorSays({ children, size = 56, footer }: { children: ReactNode; size?: number; footer?: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}>
      <Sprite name="mentor" width={size} />
      <View style={styles.bubble}>
        {typeof children === 'string' ? <T variant="bodyStrong" style={{ fontFamily: fonts.bold }}>{children}</T> : children}
        {footer}
      </View>
    </View>
  );
}

const RowContext = createContext(false);

/** Two columns on wide screens, stacked on phones. */
export function Columns({ children, gap = space.lg, min = 760 }: { children: ReactNode; gap?: number; min?: number }) {
  const wide = useWide(min);
  return (
    <RowContext.Provider value={wide}>
      <View style={{ flexDirection: wide ? 'row' : 'column', gap, alignItems: wide ? 'flex-start' : 'stretch' }}>{children}</View>
    </RowContext.Provider>
  );
}

export function Column({ children, gap = space.lg }: { children: ReactNode; gap?: number }) {
  const inRow = useContext(RowContext);
  return <View style={[{ gap, minWidth: 0 }, inRow && { flex: 1 }]}>{children}</View>;
}

const text = StyleSheet.create({
  title: { fontFamily: fonts.title, fontSize: 30, lineHeight: 34, color: colors.bosque },
  h2: { fontFamily: fonts.title, fontSize: 18, lineHeight: 23, color: colors.ink },
  body: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 22, color: colors.inkSoft },
  bodyStrong: { fontFamily: fonts.title, fontSize: 15, lineHeight: 21, color: colors.ink },
  small: { fontFamily: fonts.bold, fontSize: 13, lineHeight: 18, color: colors.muted },
  phrase: { fontFamily: fonts.phrase, fontSize: 22, lineHeight: 29, color: colors.ink },
});

const styles = StyleSheet.create({
  footer: { borderTopWidth: 2, borderTopColor: colors.divider, paddingTop: 14 },
  back: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  bubble: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: colors.border,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
});
