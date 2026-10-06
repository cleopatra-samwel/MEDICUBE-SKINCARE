import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function SectionHeading({ title, lede, link, linkLabel = 'View all', center = false }) {
  return (
    <div className={`mb-10 flex flex-col gap-4 sm:mb-14 ${center ? 'items-center text-center' : 'sm:flex-row sm:items-end sm:justify-between'}`}>
      <div className={center ? 'flex flex-col items-center' : ''}>
        <h2 className="section-title">{title}</h2>
        {lede && <p className="section-lede">{lede}</p>}
      </div>
      {link && (
        <Link to={link} className="group inline-flex shrink-0 items-center gap-2 text-sm font-medium text-rosewood">
          <span className="link-underline">{linkLabel}</span>
          <ArrowRight size={16} className="transition group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
