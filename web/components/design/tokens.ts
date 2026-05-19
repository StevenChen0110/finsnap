// Design token system — ported from dashboard.jsx STYLES
// Three styles: soft (default), minimal, glass

export type Style = 'soft' | 'minimal' | 'glass';

export interface Tokens {
  style: Style;
  bg: string;
  card: string;
  cardAlt: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  divider: string;
  cardShadow: string;
  cardBorder: string;
  blur: boolean;
  titleSize: number;
  outer: string;
  aiGradient: string;
  accent: string;
  accentSoft: string;
  systemGreen: string;
  systemRed: string;
  systemBlue: string;
  serif: boolean;
}

const STYLES = {
  soft: {
    accent: 'oklch(0.42 0.08 245)',
    bg:        (d: boolean) => d ? 'oklch(0.16 0.012 60)'  : 'oklch(0.965 0.010 80)',
    card:      (d: boolean) => d ? 'oklch(0.20 0.012 60)'  : 'oklch(0.985 0.008 80)',
    cardAlt:   (d: boolean) => d ? 'oklch(0.24 0.010 60)'  : 'oklch(0.93 0.012 75)',
    divider:   (d: boolean) => d ? 'oklch(0.32 0.010 60)'  : 'oklch(0.88 0.014 75)',
    cardShadow: () => 'none',
    cardBorder: () => 'none',
    blur: false,
    titleSize: 36,
    outer: (d: boolean) => d ? 'oklch(0.12 0.01 55)' : 'oklch(0.93 0.014 75)',
    aiGradient: 'oklch(0.42 0.08 245)',
    serif: true,
  },
  minimal: {
    accent: 'oklch(0.42 0.13 245)',
    bg:        (d: boolean) => d ? '#0A0A0B' : '#FAFAFA',
    card:      (d: boolean) => d ? '#141416' : '#FFFFFF',
    cardAlt:   (d: boolean) => d ? '#1E1E20' : '#F4F4F5',
    divider:   (d: boolean) => d ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    cardShadow: () => 'none',
    cardBorder: (d: boolean) => d ? '0.5px solid rgba(255,255,255,0.06)' : '0.5px solid rgba(0,0,0,0.06)',
    blur: false,
    titleSize: 40,
    outer: (d: boolean) => d ? '#050505' : '#f0f0f2',
    aiGradient: 'oklch(0.42 0.13 245)',
    serif: false,
  },
  glass: {
    accent: '#0A84FF',
    bg: (d: boolean) => d
      ? 'radial-gradient(120% 80% at 10% 0%, #4A1A6B 0%, #1A1240 40%, #0A1530 80%)'
      : 'radial-gradient(120% 80% at 10% 0%, #FFD9E8 0%, #D6E0FF 45%, #CFEEDF 100%)',
    card:      (d: boolean) => d ? 'rgba(40,42,55,0.50)' : 'rgba(255,255,255,0.55)',
    cardAlt:   (d: boolean) => d ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.45)',
    divider:   (d: boolean) => d ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.55)',
    cardShadow: (d: boolean) => d
      ? '0 10px 30px rgba(0,0,0,0.40), inset 0 0.5px 0 rgba(255,255,255,0.10)'
      : '0 10px 30px rgba(31,38,135,0.10), inset 0 0.5px 0 rgba(255,255,255,0.80)',
    cardBorder: (d: boolean) => d
      ? '0.5px solid rgba(255,255,255,0.10)'
      : '0.5px solid rgba(255,255,255,0.55)',
    blur: true,
    titleSize: 34,
    outer: (d: boolean) => d ? '#08081a' : '#f7e9ee',
    aiGradient: 'linear-gradient(135deg,rgba(94,92,230,0.85),rgba(191,90,242,0.85))',
    serif: false,
  },
};

export function T(dark: boolean, style: Style = 'soft'): Tokens {
  const s = STYLES[style] || STYLES.soft;
  return {
    style,
    bg: s.bg(dark),
    card: s.card(dark),
    cardAlt: s.cardAlt(dark),
    text: dark ? '#FFFFFF' : '#0a0a0c',
    textSecondary: dark ? 'rgba(235,235,245,0.65)' : 'rgba(60,60,67,0.65)',
    textTertiary: dark ? 'rgba(235,235,245,0.35)' : 'rgba(60,60,67,0.35)',
    divider: s.divider(dark),
    cardShadow: s.cardShadow(dark),
    cardBorder: s.cardBorder(dark),
    blur: s.blur,
    titleSize: s.titleSize,
    outer: s.outer(dark),
    aiGradient: s.aiGradient,
    serif: s.serif,
    accent: s.accent,
    accentSoft: dark
      ? `color-mix(in oklch, ${s.accent} 22%, transparent)`
      : `color-mix(in oklch, ${s.accent} 12%, transparent)`,
    systemGreen: '#34C759',
    systemRed: '#FF453A',
    systemBlue: '#0A84FF',
  };
}

export function cardStyle(t: Tokens): React.CSSProperties {
  return {
    background: t.card,
    boxShadow: t.cardShadow,
    border: t.cardBorder || undefined,
    backdropFilter: t.blur ? 'blur(28px) saturate(180%)' : undefined,
    WebkitBackdropFilter: t.blur ? 'blur(28px) saturate(180%)' : undefined,
  };
}

export const CAT_META: Record<string, { icon: string; color: string }> = {
  '飲食': { icon: 'fork-knife', color: '#FF9F0A' },
  '交通': { icon: 'car',        color: '#5E5CE6' },
  '購物': { icon: 'cart',       color: '#FF375F' },
  '娛樂': { icon: 'film',       color: '#BF5AF2' },
  '居家': { icon: 'building',   color: '#64D2FF' },
  '帳單': { icon: 'doc-text',   color: '#FFD60A' },
  '收入': { icon: 'arrow-down-right', color: '#34C759' },
};
