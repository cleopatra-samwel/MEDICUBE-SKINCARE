import { LogoMark } from '@/assets/brand/Logo';

export default function PageLoader({ full = true }) {
  return (
    <div className={`grid place-items-center ${full ? 'min-h-[60vh]' : 'py-16'}`} role="status" aria-live="polite">
      <LogoMark size={40} className="animate-pulse text-rose" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
