'use client';
// SF Symbols-inspired icon set — ported from icons.jsx

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  weight?: number;
  fill?: boolean;
}

export default function Icon({ name, size = 20, color = 'currentColor', weight = 1.8, fill = false }: IconProps) {
  const s = size;
  const props = {
    width: s, height: s, viewBox: '0 0 24 24', fill: 'none',
    stroke: color, strokeWidth: weight,
    strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  };
  switch (name) {
    case 'sparkles':
      return <svg {...props}><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z" fill={fill ? color : 'none'}/><path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z" fill={fill ? color : 'none'}/></svg>;
    case 'camera':
      return <svg {...props}><path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z"/><circle cx="12" cy="13" r="3.5"/></svg>;
    case 'plus':
      return <svg {...props}><path d="M12 5v14M5 12h14"/></svg>;
    case 'chevron-right':
      return <svg {...props}><path d="M9 6l6 6-6 6"/></svg>;
    case 'chevron-down':
      return <svg {...props}><path d="M6 9l6 6 6-6"/></svg>;
    case 'check':
      return <svg {...props}><path d="M5 12l5 5L20 7"/></svg>;
    case 'xmark':
      return <svg {...props}><path d="M6 6l12 12M18 6L6 18"/></svg>;
    case 'arrow-up-right':
      return <svg {...props}><path d="M7 17L17 7M9 7h8v8"/></svg>;
    case 'arrow-down-right':
      return <svg {...props}><path d="M7 7l10 10M17 9v8H9"/></svg>;
    case 'creditcard':
      return <svg {...props}><rect x="2.5" y="6" width="19" height="12" rx="2"/><path d="M2.5 10h19"/></svg>;
    case 'bank':
      return <svg {...props}><path d="M3 10l9-6 9 6"/><path d="M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18"/></svg>;
    case 'chart':
      return <svg {...props}><path d="M4 19V5M4 19h16M8 15l3-4 3 3 4-6"/></svg>;
    case 'gear':
      return <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z"/></svg>;
    case 'house':
      return <svg {...props}><path d="M3 11l9-7 9 7v9a2 2 0 01-2 2h-3v-7h-8v7H5a2 2 0 01-2-2v-9z"/></svg>;
    case 'list':
      return <svg {...props}><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1" fill={color} stroke="none"/><circle cx="3.5" cy="12" r="1" fill={color} stroke="none"/><circle cx="3.5" cy="18" r="1" fill={color} stroke="none"/></svg>;
    case 'doc-text':
      return <svg {...props}><path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9l-6-6z"/><path d="M14 3v6h6M8 13h8M8 17h6"/></svg>;
    case 'wand':
      return <svg {...props}><path d="M15 4V2M15 14v-2M8.5 8.5L7 7M22 7l-1.5 1.5M22 14h-2M9.6 16.4L3 23"/><path d="M16.5 9.5l-3-3a1.4 1.4 0 00-2 0L9 9l5 5 2.5-2.5a1.4 1.4 0 000-2z" fill={fill ? color : 'none'}/></svg>;
    case 'bell':
      return <svg {...props}><path d="M18 16H6l1.5-2V11a4.5 4.5 0 119 0v3l1.5 2zM10 19a2 2 0 004 0"/></svg>;
    case 'tag':
      return <svg {...props}><path d="M20 12l-8 8a2 2 0 01-2.8 0L3 13.8a2 2 0 010-2.8L11 3h9v9z"/><circle cx="16" cy="8" r="1.2" fill={color} stroke="none"/></svg>;
    case 'fork-knife':
      return <svg {...props}><path d="M7 3v8a2 2 0 002 2v8M5 3v5a2 2 0 002 2M9 3v5a2 2 0 01-2 2M15 3c-1.5 1-2 2.5-2 5s.5 4 2 5v8"/></svg>;
    case 'car':
      return <svg {...props}><path d="M5 17V11l2-5h10l2 5v6M3 17h18v-3H3v3z"/><circle cx="7.5" cy="17" r="1.5" fill={color} stroke="none"/><circle cx="16.5" cy="17" r="1.5" fill={color} stroke="none"/></svg>;
    case 'film':
      return <svg {...props}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h3M3 15h3M18 9h3M18 15h3M9 4v16M15 4v16"/></svg>;
    case 'building':
      return <svg {...props}><path d="M5 20V4h14v16M9 8h2M13 8h2M9 12h2M13 12h2M9 16h2M13 16h2"/></svg>;
    case 'cart':
      return <svg {...props}><path d="M3 4h2l2.5 12h11l2-8H6"/><circle cx="9" cy="20" r="1.2" fill={color} stroke="none"/><circle cx="18" cy="20" r="1.2" fill={color} stroke="none"/></svg>;
    case 'apple-intelligence':
      return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M12 3c1.5 3 3 4.5 6 6-3 1.5-4.5 3-6 6-1.5-3-3-4.5-6-6 3-1.5 4.5-3 6-6z" fill={color}/></svg>;
    case 'screenshot':
      return <svg {...props}><path d="M5 8V6a2 2 0 012-2h2M5 16v2a2 2 0 002 2h2M19 8V6a2 2 0 00-2-2h-2M19 16v2a2 2 0 01-2 2h-2"/><rect x="8" y="9" width="8" height="6" rx="1"/></svg>;
    case 'photo':
      return <svg {...props}><rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="8.5" cy="9.5" r="1.5" fill={color} stroke="none"/><path d="M21 16l-5-5-9 9"/></svg>;
    case 'trash':
      return <svg {...props}><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>;
    case 'pencil':
      return <svg {...props}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
    case 'upload':
      return <svg {...props}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8" stroke={color} strokeWidth={weight}/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
    case 'plus-circle':
      return <svg {...props}><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>;
    case 'calendar':
      return <svg {...props}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
    case 'wallet':
      return <svg {...props}><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 2H8L4 7h16l-4-5z"/><circle cx="16" cy="14" r="1.5" fill={color} stroke="none"/></svg>;
    case 'arrow-left':
      return <svg {...props}><path d="M19 12H5M12 5l-7 7 7 7"/></svg>;
    case 'shield':
      return <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
    case 'export':
      return <svg {...props}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10" stroke={color} strokeWidth={weight}/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
    default:
      return <svg width={size} height={size}/>;
  }
}
