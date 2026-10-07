import { router } from 'expo-router';
import { createContext, ReactNode, useContext } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextProps,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, IconName } from '@/components/Icon';
import { colors, fonts, maxContentWidth, radius, space } from '@/theme/tokens';

/** Horizontal page padding. */
export function useGutter() {
  const { width } = useWindowDimensions();
  return width < 380 ? 20 : 24;
}

/** True on wide (web/tablet) layouts, where some screens use two columns. */
export function useWide(breakpoint = 860) {
  return useWindowDimensions().width >= breakpoint;
}

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  background?: string;
  /** Sticky bar at the bottom (stays above the keyboard). */
  footer?: ReactNode;
  maxWidth?: number;
  contentStyle?: StyleProp<ViewStyle>;
};

/** Page container. Scrolls the focused input into view when the keyboard opens. */
export function Screen({ children, scroll = true, background = colors.bg, footer, maxWidth = maxContentWidth, contentStyle }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const gutter = useGutter();
  const inner = (
    <View style={[{ width: '100%', maxWidth, alignSelf: 'center', paddingHorizontal: gutter, gap: space.xl }, contentStyle]}>
      {children}
    </View>
  );
  return (
    <View style={{ flex: 1, backgroundColor: background, paddingTop: insets.top }}>
      {scroll ? (
        <KeyboardAwareScrollView
          bottomOffset={24}
          contentContainerStyle={{ paddingTop: space.lg, paddingBottom: space.xxxl }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {inner}
        </KeyboardAwareScrollView>
      ) : (
        <View style={{ flex: 1 }}>{inner}</View>
      )}
      {footer ? (
        <View style={[styles.footer, { backgroundColor: background }]}>
          <View style={{ width: '100%', maxWidth, alignSelf: 'center', paddingHorizontal: gutter, gap: space.sm }}>{footer}</View>
        </View>
      ) : null}
    </View>
  );
}

type Variant = 'display' | 'title' | 'heading' | 'body' | 'bodyStrong' | 'small' | 'label' | 'quote';

export function T({ variant = 'body', style, ...rest }: TextProps & { variant?: Variant }) {
  return <Text {...rest} style={[text[variant], style]} />;
}

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'quiet' | 'quietLight' | 'light' | 'danger';
  icon?: IconName;
  /** Icon before the label (e.g. play) instead of after it (e.g. arrow). */
  leadingIcon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

const BUTTON = {
  primary: { bg: colors.accent, fg: colors.onDark, border: colors.accent },
  secondary: { bg: 'transparent', fg: colors.accent, border: colors.line },
  quiet: { bg: 'transparent', fg: colors.inkSoft, border: 'transparent' },
  quietLight: { bg: 'transparent', fg: colors.onDarkMuted, border: 'transparent' },
  light: { bg: colors.onDark, fg: colors.navy, border: colors.onDark },
  danger: { bg: colors.danger, fg: colors.onDark, border: colors.danger },
};

export function Button({ label, onPress, variant = 'primary', icon, leadingIcon, loading, disabled, compact, style }: ButtonProps) {
  const v = BUTTON[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.button,
        compact && styles.buttonCompact,
        { backgroundColor: v.bg, borderColor: v.border, opacity: disabled ? 0.4 : pressed ? 0.82 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <>
          {leadingIcon ? <Icon name={leadingIcon} size={compact ? 15 : 17} color={v.fg} weight="fill" /> : null}
          <Text style={[styles.buttonLabel, compact && { fontSize: 14 }, { color: v.fg }]} numberOfLines={1}>
            {label}
          </Text>
          {icon ? <Icon name={icon} size={compact ? 16 : 18} color={v.fg} weight="regular" /> : null}
        </>
      )}
    </Pressable>
  );
}

/** A quiet surface. Use only to set one block apart, not for every section. */
export function Surface({ children, style, onPress, tone = 'surface' }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; tone?: 'surface' | 'dark' | 'warm' | 'sunken' }) {
  const bg = { surface: colors.surface, dark: colors.navy, warm: colors.warmSoft, sunken: colors.sunken }[tone];
  const base = [styles.surface, { backgroundColor: bg }, tone === 'surface' && styles.surfaceBorder, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [base, pressed && { opacity: 0.88 }]}>
      {children}
    </Pressable>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: colors.line }, style]} />;
}

/** Thin progress line. */
export function Progress({ value, color = colors.accentBright, track = colors.line, height = 6 }: { value: number; color?: string; track?: string; height?: number }) {
  return (
    <View style={{ height, borderRadius: height, backgroundColor: track, overflow: 'hidden' }}>
      <View style={{ width: `${Math.max(0, Math.min(100, value))}%`, height: '100%', borderRadius: height, backgroundColor: color }} />
    </View>
  );
}

export function Tag({ label, tone = 'neutral', icon }: { label: string; tone?: 'neutral' | 'accent' | 'warm' | 'warn' | 'onDark'; icon?: IconName }) {
  const map = {
    neutral: { bg: colors.sunken, fg: colors.inkSoft },
    accent: { bg: colors.accentSoft, fg: colors.accent },
    warm: { bg: colors.warmSoft, fg: colors.warn },
    warn: { bg: colors.warnSoft, fg: colors.warn },
    onDark: { bg: 'rgba(255,255,255,0.14)', fg: colors.onDark },
  }[tone];
  return (
    <View style={[styles.tag, { backgroundColor: map.bg }]}>
      {icon ? <Icon name={icon} size={13} color={map.fg} weight="regular" /> : null}
      <Text style={[styles.tagText, { color: map.fg }]}>{label}</Text>
    </View>
  );
}

/** Round emblem with a hairline ring. */
export function Emblem({ icon, size = 44, tone = 'default' }: { icon: IconName; size?: number; tone?: 'default' | 'active' | 'done' | 'locked' | 'onDark' }) {
  const map = {
    default: { bg: colors.surface, border: colors.line, fg: colors.accent, weight: 'light' as const },
    active: { bg: colors.surface, border: colors.accentBright, fg: colors.accent, weight: 'regular' as const },
    done: { bg: colors.accentBright, border: colors.accentBright, fg: colors.onDark, weight: 'bold' as const },
    locked: { bg: colors.bg, border: colors.line, fg: colors.muted, weight: 'light' as const },
    onDark: { bg: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.24)', fg: colors.onDark, weight: 'light' as const },
  }[tone];
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 1, borderColor: map.border, backgroundColor: map.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon} size={size * 0.48} color={map.fg} weight={map.weight} />
    </View>
  );
}

export function BackButton({ onPress, kind = 'back', label }: { onPress?: () => void; kind?: 'back' | 'close'; label?: string }) {
  return (
    <Pressable
      onPress={onPress ?? (() => (router.canGoBack() ? router.back() : router.replace('/viaje')))}
      accessibilityLabel={kind === 'back' ? 'Volver' : 'Cerrar'}
      hitSlop={12}
      style={styles.back}
    >
      <Icon name={kind === 'back' ? 'arrowLeft' : 'close'} size={20} color={colors.ink} />
      {label ? <Text style={styles.backLabel}>{label}</Text> : null}
    </Pressable>
  );
}

/** Victor's note: his avatar and his words, in a card. */
export function MentorNote({ children, action, onPress }: { children: ReactNode; action?: string; onPress?: () => void }) {
  const body = (
    <View style={styles.note}>
      <MentorAvatar />
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={styles.noteName}>Victor · tu mentor</Text>
        {typeof children === 'string' ? <T style={{ color: colors.ink }}>{children}</T> : children}
        {action ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 2 }}>
            <Text style={styles.noteAction}>{action}</Text>
            <Icon name="arrowRight" size={14} color={colors.accent} weight="bold" />
          </View>
        ) : null}
      </View>
    </View>
  );
  return onPress ? <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.85 }}>{body}</Pressable> : body;
}

/** Victor's round avatar with an online dot. */
export function MentorAvatar({ size = 40 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.accentBright, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: fonts.display, fontSize: size * 0.42, color: colors.onDark }}>V</Text>
      <View style={[styles.online, { width: size * 0.28, height: size * 0.28, borderRadius: size * 0.14 }]} />
    </View>
  );
}

/** Section heading with an optional trailing action. */
export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
      <T variant="label">{title}</T>
      {action ? (
        <Text onPress={onAction} style={styles.sectionAction}>
          {action}
        </Text>
      ) : null}
    </View>
  );
}

const RowContext = createContext(false);

/** Two columns on wide screens, stacked on phones. */
export function Columns({ children, gap = space.xl }: { children: ReactNode; gap?: number }) {
  const wide = useWide();
  return (
    <RowContext.Provider value={wide}>
      <View style={{ flexDirection: wide ? 'row' : 'column', gap, alignItems: wide ? 'flex-start' : 'stretch' }}>{children}</View>
    </RowContext.Provider>
  );
}

export function Column({ children, gap = space.xl }: { children: ReactNode; gap?: number }) {
  const inRow = useContext(RowContext);
  return <View style={[{ gap, minWidth: 0 }, inRow && { flex: 1 }]}>{children}</View>;
}

export const text = StyleSheet.create({
  display: { fontFamily: fonts.display, fontSize: 28, lineHeight: 34, color: colors.ink, letterSpacing: -0.5 },
  title: { fontFamily: fonts.display, fontSize: 22, lineHeight: 28, color: colors.ink, letterSpacing: -0.3 },
  heading: { fontFamily: fonts.sansSemi, fontSize: 16, lineHeight: 22, color: colors.ink },
  body: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, color: colors.muted },
  bodyStrong: { fontFamily: fonts.sansSemi, fontSize: 15, lineHeight: 21, color: colors.ink },
  small: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 18, color: colors.muted },
  label: { fontFamily: fonts.sansSemi, fontSize: 11, lineHeight: 14, letterSpacing: 1, textTransform: 'uppercase', color: colors.label },
  quote: { fontFamily: fonts.displayMedium, fontSize: 19, lineHeight: 27, color: colors.ink },
});

const styles = StyleSheet.create({
  footer: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line, paddingTop: 12, paddingBottom: 12 },
  button: {
    minHeight: 50,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  buttonCompact: { minHeight: 38, paddingHorizontal: 14, borderRadius: radius.pill },
  buttonLabel: { fontFamily: fonts.display, fontSize: 15, letterSpacing: 0.1 },
  surface: { borderRadius: radius.lg, padding: space.lg },
  surfaceBorder: { borderWidth: 1, borderColor: colors.line },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5 },
  tagText: { fontFamily: fonts.sansSemi, fontSize: 12, letterSpacing: 0.2 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingVertical: 8 },
  backLabel: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink },
  note: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  noteName: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.ink },
  online: { position: 'absolute', right: 0, bottom: 0, backgroundColor: '#3BD671', borderWidth: 2, borderColor: colors.surface },
  noteAction: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.accent },
  sectionAction: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.accent },
});
