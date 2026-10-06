import { brand } from '@/config/brand';

/**
 * The logo mark is a single dewdrop inside an arch (a nod to a bottle shoulder
 * and a vanity mirror). The wordmark is live text, so renaming the brand in
 * config/brand.js updates it everywhere. The same mark is used for favicon.svg.
 */
export function LogoMark({ size = 32, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true" className={className}>
      <path d="M8 44V22C8 12.06 15.16 4 24 4s16 8.06 16 18v22" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M24 15c0 0-7.5 8.3-7.5 13.4a7.5 7.5 0 0 0 15 0C31.5 23.3 24 15 24 15Z" fill="currentColor" opacity=".9" />
      <path d="M21.2 28.6a3 3 0 0 0 2.4 3" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity=".8" />
    </svg>
  );
}

export default function Logo({ tone = 'dark', compact = false, className = '' }) {
  const color = tone === 'light' ? 'text-white' : 'text-rosewood';
  const word = tone === 'light' ? 'text-white' : 'text-mauve';
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={compact ? 26 : 32} className={color} />
      <span className={`font-display text-[1.75rem] font-semibold leading-none tracking-[0.02em] ${word}`}>{brand.name}</span>
    </span>
  );
}
