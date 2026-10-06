import { Check, X } from 'lucide-react';

/**
 * Renders the server's timeline: ✓ done, ● current, ○ upcoming.
 * Vertical on phones, horizontal from `sm` up.
 */
export default function OrderTimeline({ steps = [] }) {
  return (
    <ol className="flex flex-col gap-0 sm:flex-row sm:items-start">
      {steps.map((step, i) => {
        const last = i === steps.length - 1;
        const done = step.state === 'done';
        const current = step.state === 'current';
        const cancelled = step.state === 'cancelled';
        return (
          <li key={step.key} className="relative flex gap-4 pb-7 sm:flex-1 sm:flex-col sm:items-center sm:gap-3 sm:pb-0 sm:text-center">
            {!last && (
              <span aria-hidden className={`absolute left-[15px] top-8 h-[calc(100%-2rem)] w-px sm:left-[calc(50%+18px)] sm:top-[15px] sm:h-px sm:w-[calc(100%-36px)] ${done ? 'bg-rosewood' : 'bg-line'}`} />
            )}
            <span className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border transition ${
              cancelled ? 'border-rose-700 bg-rose-700 text-white'
                : done ? 'border-rosewood bg-rosewood text-white'
                  : current ? 'border-rosewood bg-white text-rosewood ring-4 ring-blush'
                    : 'border-line bg-white text-line'}`}>
              {cancelled ? <X size={15} /> : done ? <Check size={15} strokeWidth={2.5} /> : <span className={`h-2.5 w-2.5 rounded-full ${current ? 'bg-rosewood animate-pulse' : 'border border-line'}`} />}
            </span>
            <div className="pt-1 sm:pt-0">
              <p className={`text-sm font-medium ${done || current || cancelled ? 'text-mauve' : 'text-stone'}`}>{step.label}</p>
              <p className="text-xs text-stone">{done ? 'Complete' : current ? 'In progress' : cancelled ? 'Order cancelled' : 'Upcoming'}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
