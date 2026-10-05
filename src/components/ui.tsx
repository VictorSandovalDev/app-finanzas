import { router } from 'expo-router';
import { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextProps,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, IconName } from '@/components/Icon';
import { colors, fonts, maxContentWidth, radius, shadow, space } from '@/theme/tokens';

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  background?: string;
  footer?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
};

export function Screen({ children, scroll = true, background = colors.ivory, footer, contentStyle }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const inner = <View style={[styles.column, contentStyle]}>{children}</View>;
  return (
    <View style={{ flex: 1, backgroundColor: background, paddingTop: insets.top }}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={{ paddingBottom: footer ? space.xl : insets.bottom + space.xxxl }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {inner}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>{inner}</View>
      )}
      {footer ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom + space.lg, backgroundColor: background }]}>
          <View style={styles.footerInner}>{footer}</View>
        </View>
      ) : null}
    </View>
  );
}

type Variant = 'display' | 'title' | 'heading' | 'body' | 'bodyStrong' | 'small' | 'label' | 'quote';

export function T({ variant = 'body', style, ...rest }: TextProps & { variant?: Variant }) {
  return <Text {...rest} style={[textStyles[variant], style]} />;
}

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'gold';
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, onPress, variant = 'primary', icon, loading, disabled, style }: ButtonProps) {
  const palette = {
    primary: { bg: colors.forest, fg: colors.ivory, border: colors.forest },
    gold: { bg: colors.champagne, fg: colors.forestDeep, border: colors.champagne },
    secondary: { bg: 'transparent', fg: colors.forest, border: colors.forest },
    ghost: { bg: 'transparent', fg: colors.inkSoft, border: 'transparent' },
  }[variant];
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: palette.bg, borderColor: palette.border, opacity: disabled ? 0.45 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <>
          <Text style={[styles.buttonLabel, { color: palette.fg }]}>{label}</Text>
          {icon ? <Icon name={icon} size={18} color={palette.fg} /> : null}
        </>
      )}
    </Pressable>
  );
}

export function Card({
  children,
  style,
  tone = 'surface',
  onPress,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: 'surface' | 'paper' | 'forest' | 'sage' | 'champagne';
  onPress?: () => void;
}) {
  const bg = {
    surface: colors.surface,
    paper: colors.paper,
    forest: colors.forest,
    sage: colors.sageSoft,
    champagne: colors.champagneSoft,
  }[tone];
  const content = [styles.card, { backgroundColor: bg }, tone === 'surface' && shadow, style];
  if (!onPress) return <View style={content}>{children}</View>;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [content, pressed && { opacity: 0.9 }]}>
      {children}
    </Pressable>
  );
}

export function Pill({ label, tone = 'sage', icon }: { label: string; tone?: 'sage' | 'champagne' | 'terracotta' | 'ink'; icon?: IconName }) {
  const map = {
    sage: { bg: colors.sageSoft, fg: colors.forest },
    champagne: { bg: colors.champagneSoft, fg: '#7A6438' },
    terracotta: { bg: colors.terracottaSoft, fg: colors.terracotta },
    ink: { bg: 'rgba(246,241,231,0.14)', fg: colors.ivory },
  }[tone];
  return (
    <View style={[styles.pill, { backgroundColor: map.bg }]}>
      {icon ? <Icon name={icon} size={13} color={map.fg} strokeWidth={2} /> : null}
      <Text style={[styles.pillText, { color: map.fg }]}>{label}</Text>
    </View>
  );
}

export function ProgressBar({ value, color = colors.forest, track = colors.line }: { value: number; color?: string; track?: string }) {
  return (
    <View style={[styles.track, { backgroundColor: track }]}>
      <View style={[styles.bar, { width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color }]} />
    </View>
  );
}

export function TopBar({ title, onBack, right }: { title?: string; onBack?: () => void; right?: ReactNode }) {
  return (
    <View style={styles.topBar}>
      <Pressable
        onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/viaje')))}
        hitSlop={12}
        style={styles.backButton}
        accessibilityLabel="Volver"
      >
        <Icon name="arrowLeft" size={20} color={colors.ink} />
      </Pressable>
      {title ? <T variant="label" style={{ flex: 1, textAlign: 'center' }}>{title}</T> : <View style={{ flex: 1 }} />}
      <View style={{ width: 40, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: colors.line }, style]} />;
}

export function IconBadge({ name, tone = 'sage', size = 44 }: { name: IconName; tone?: 'sage' | 'champagne' | 'forest' | 'muted'; size?: number }) {
  const map = {
    sage: { bg: colors.sageSoft, fg: colors.forest },
    champagne: { bg: colors.champagneSoft, fg: '#8A6F3E' },
    forest: { bg: colors.forest, fg: colors.ivory },
    muted: { bg: colors.paper, fg: colors.warmGray },
  }[tone];
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: map.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={name} size={size * 0.48} color={map.fg} />
    </View>
  );
}

const textStyles = StyleSheet.create({
  display: { fontFamily: fonts.serif, fontSize: 40, lineHeight: 44, color: colors.ink, letterSpacing: -0.4 },
  title: { fontFamily: fonts.serif, fontSize: 30, lineHeight: 34, color: colors.ink, letterSpacing: -0.2 },
  heading: { fontFamily: fonts.serif, fontSize: 22, lineHeight: 27, color: colors.ink },
  body: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 23, color: colors.inkSoft },
  bodyStrong: { fontFamily: fonts.sansSemi, fontSize: 15, lineHeight: 22, color: colors.ink },
  small: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 19, color: colors.warmGray },
  label: { fontFamily: fonts.sansSemi, fontSize: 11, lineHeight: 14, color: colors.warmGray, letterSpacing: 1.6, textTransform: 'uppercase' },
  quote: { fontFamily: fonts.serifItalic, fontSize: 22, lineHeight: 30, color: colors.ink },
});

const styles = StyleSheet.create({
  column: { width: '100%', maxWidth: maxContentWidth, alignSelf: 'center', paddingHorizontal: space.xl },
  footer: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line, paddingTop: space.lg },
  footerInner: { width: '100%', maxWidth: maxContentWidth, alignSelf: 'center', paddingHorizontal: space.xl, gap: space.sm },
  button: {
    minHeight: 54,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: space.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  buttonLabel: { fontFamily: fonts.sansSemi, fontSize: 15, letterSpacing: 0.2 },
  card: { borderRadius: radius.lg, padding: space.xl },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pillText: { fontFamily: fonts.sansSemi, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase' },
  track: { height: 6, borderRadius: 3, overflow: 'hidden', width: '100%' },
  bar: { height: '100%', borderRadius: 3 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingVertical: space.md, marginBottom: space.sm },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
});
