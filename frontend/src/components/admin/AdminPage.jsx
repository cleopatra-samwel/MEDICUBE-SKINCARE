/** Consistent header for admin screens. */
export default function AdminPage({ title, subtitle, extra, children }) {
  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-[2.125rem]">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-stone">{subtitle}</p>}
        </div>
        {extra && <div className="flex flex-wrap gap-2">{extra}</div>}
      </div>
      {children}
    </div>
  );
}
