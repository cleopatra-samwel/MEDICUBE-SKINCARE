export default function StatCard({ label, value, icon: Icon, tone = 'rose', hint }) {
  const tones = { rose: 'bg-petal text-rosewood', green: 'bg-[#EAF2EC] text-[#4F7A5B]', amber: 'bg-[#F8EEDF] text-[#9A6A2A]', mauve: 'bg-[#EFE7EA] text-mauve' };
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-stone">{label}</p>
        {Icon && <span className={`grid h-9 w-9 place-items-center rounded-full ${tones[tone]}`}><Icon size={17} strokeWidth={1.7} /></span>}
      </div>
      <p className="mt-3 font-sans text-2xl font-bold leading-tight break-words text-mauve tabular-nums">{value}</p>
      {hint && <p className="mt-2 text-xs text-stone">{hint}</p>}
    </div>
  );
}
