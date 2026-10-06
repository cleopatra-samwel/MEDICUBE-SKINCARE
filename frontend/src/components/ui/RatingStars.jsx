import { Star } from 'lucide-react';

export default function RatingStars({ value = 0, count, size = 14, className = '' }) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`} aria-label={`Rated ${value} out of 5`}>
      <span className="inline-flex">
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = rounded >= i ? 1 : rounded >= i - 0.5 ? 0.5 : 0;
          return (
            <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
              <Star size={size} className="absolute inset-0 text-blush" fill="currentColor" strokeWidth={0} />
              {fill > 0 && (
                <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                  <Star size={size} className="text-rose-700" fill="currentColor" strokeWidth={0} />
                </span>
              )}
            </span>
          );
        })}
      </span>
      {count !== undefined && <span className="text-xs text-stone">({count})</span>}
    </span>
  );
}
