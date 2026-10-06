import { Minus, Plus } from 'lucide-react';

export default function QuantitySelector({ value, onChange, min = 1, max = 99, size = 'md' }) {
  const h = size === 'sm' ? 'h-9' : 'h-12';
  const w = size === 'sm' ? 'w-9' : 'w-11';
  return (
    <div className={`inline-flex ${h} items-center rounded-full border border-line bg-white`}>
      <button type="button" aria-label="Decrease quantity" disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className={`grid ${w} h-full place-items-center rounded-l-full text-mauve transition hover:text-rosewood disabled:opacity-30`}>
        <Minus size={15} />
      </button>
      <span className="min-w-[2rem] text-center text-[15px] font-semibold tabular-nums" aria-live="polite">{value}</span>
      <button type="button" aria-label="Increase quantity" disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className={`grid ${w} h-full place-items-center rounded-r-full text-mauve transition hover:text-rosewood disabled:opacity-30`}>
        <Plus size={15} />
      </button>
    </div>
  );
}
