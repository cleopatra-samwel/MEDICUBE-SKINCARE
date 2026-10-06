import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/** Title band for inner pages with breadcrumbs. */
export default function PageHeader({ title, lede, crumbs = [] }) {
  return (
    <div className="border-b border-line bg-petal/60">
      <div className="shell py-10 sm:py-14">
        {crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-stone">
            <Link to="/" className="hover:text-rosewood">Home</Link>
            {crumbs.map(([to, label]) => (
              <span key={label} className="flex items-center gap-1.5">
                <ChevronRight size={13} />
                {to ? <Link to={to} className="hover:text-rosewood">{label}</Link> : <span className="text-mauve">{label}</span>}
              </span>
            ))}
          </nav>
        )}
        <h1 className="font-display text-[2.5rem] sm:text-[3.25rem]">{title}</h1>
        {lede && <p className="mt-3 max-w-2xl text-stone">{lede}</p>}
      </div>
    </div>
  );
}
