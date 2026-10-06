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
  loading?: boolean;
  disabled?: boolean;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

const BUTTON = {
  primary: { bg: colors.forest, fg: colors.onDark, border: colors.forest },
  secondary: { bg: 'transparent', fg: colors.forest, border: colors.line },
  quiet: { bg: 'transparent', fg: colors.inkSoft, border: 'transparent' },
  quietLight: { bg: 'transparent', fg: colors.onDarkMuted, border: 'transparent' },
  light: { bg: colors.onDark, fg: colors.forestDeep, border: colors.onDark },
  danger: { bg: colors.umber, fg: colors.onDark, border: colors.umber },
};

export function Button({ label, onPress, variant = 'primary', icon, loading, disabled, compact, style }: ButtonProps) {
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
export function Surface({ children, style, onPress, tone = 'surface' }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; tone?: 'surface' | 'forest' | 'brass' | 'sunken' }) {
  const bg = { surface: colors.surface, forest: colors.forest, brass: colors.brassSoft, sunken: colors.sunken }[tone];
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
export function Progress({ value, color = colors.forest, track = colors.lineSoft, height = 4 }: { value: number; color?: string; track?: string; height?: number }) {
  return (
    <View style={{ height, borderRadius: height, backgroundColor: track, overflow: 'hidden' }}>
      <View style={{ width: `${Math.max(0, Math.min(100, value))}%`, height: '100%', borderRadius: height, backgroundColor: color }} />
    </View>
  );
}

export function Tag({ label, tone = 'neutral', icon }: { label: string; tone?: 'neutral' | 'forest' | 'brass' | 'umber' | 'onDark'; icon?: IconName }) {
  const map = {
    neutral: { bg: colors.sunken, fg: colors.inkSoft },
    forest: { bg: colors.forestSoft, fg: colors.forest },
    brass: { bg: colors.brassSoft, fg: '#7A6035' },
    umber: { bg: colors.umberSoft, fg: colors.umber },
    onDark: { bg: 'rgba(244,241,233,0.12)', fg: colors.onDark },
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
    default: { bg: colors.surface, border: colors.line, fg: colors.forest, weight: 'light' as const },
    active: { bg: colors.forest, border: colors.forest, fg: colors.onDark, weight: 'light' as const },
    done: { bg: colors.forestSoft, border: colors.forestSoft, fg: colors.forest, weight: 'regular' as const },
    locked: { bg: colors.bg, border: colors.line, fg: colors.muted, weight: 'light' as const },
    onDark: { bg: 'rgba(244,241,233,0.08)', border: 'rgba(244,241,233,0.24)', fg: colors.onDark, weight: 'light' as const },
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

/** Victor's note: a serif monogram and his words, set like a quoted aside. */
export function MentorNote({ children, action, onPress }: { children: ReactNode; action?: string; onPress?: () => void }) {
  const body = (
    <View style={styles.note}>
      <View style={styles.monogram}>
        <Text style={styles.monogramText}>V</Text>
      </View>
      <View style={{ flex: 1, gap: 6 }}>
        <T variant="label">Victor · tu mentor</T>
        {typeof children === 'string' ? <T style={{ color: colors.ink }}>{children}</T> : children}
        {action ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 2 }}>
            <Text style={styles.noteAction}>{action}</Text>
            <Icon name="arrowRight" size={14} color={colors.forest} weight="regular" />
          </View>
        ) : null}
      </View>
    </View>
  );
  return onPress ? <Pressable onPress={onPress}>{body}</Pressable> : body;
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
  display: { fontFamily: fonts.display, fontSize: 34, lineHeight: 40, color: colors.ink, letterSpacing: -0.4 },
  title: { fontFamily: fonts.display, fontSize: 26, lineHeight: 32, color: colors.ink, letterSpacing: -0.2 },
  heading: { fontFamily: fonts.sansSemi, fontSize: 17, lineHeight: 23, color: colors.ink },
  body: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 23, color: colors.inkSoft },
  bodyStrong: { fontFamily: fonts.sansSemi, fontSize: 15, lineHeight: 22, color: colors.ink },
  small: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 19, color: colors.muted },
  label: { fontFamily: fonts.sansSemi, fontSize: 11, lineHeight: 14, letterSpacing: 1.3, textTransform: 'uppercase', color: colors.moss },
  quote: { fontFamily: fonts.displayItalic, fontSize: 22, lineHeight: 30, color: colors.ink },
});

const styles = StyleSheet.create({
  footer: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line, paddingTop: 12, paddingBottom: 12 },
  button: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  buttonCompact: { minHeight: 40, paddingHorizontal: 14, borderRadius: 10 },
  buttonLabel: { fontFamily: fonts.sansSemi, fontSize: 15, letterSpacing: 0.1 },
  surface: { borderRadius: radius.lg, padding: space.xl },
  surfaceBorder: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  tagText: { fontFamily: fonts.sansSemi, fontSize: 12, letterSpacing: 0.2 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingVertical: 8 },
  backLabel: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink },
  note: { flexDirection: 'row', gap: 14, paddingVertical: 4 },
  monogram: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' },
  monogramText: { fontFamily: fonts.display, fontSize: 19, lineHeight: 22, color: colors.onDark },
  noteAction: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.forest },
  sectionAction: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.forest },
});
