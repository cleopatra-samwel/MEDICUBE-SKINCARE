import { Link } from 'react-router-dom';
import Logo from '@/assets/brand/Logo';

/** Split layout used by customer sign-in / sign-up. */
export default function AuthShell({ title, lede, children, footer }) {
  return (
    <div className="shell grid min-h-[70vh] items-center gap-12 py-12 lg:grid-cols-2 lg:py-16">
      <div className="relative hidden overflow-hidden rounded-arch lg:block">
        <img src="/images/hero/hero-2.svg" alt="" className="aspect-[4/5] w-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-mauve/60 to-transparent p-10 text-white">
          <p className="font-display text-[2.125rem] leading-snug text-white">Your orders, addresses and favourites, saved.</p>
          <p className="mt-2 text-white/80">An account is optional. You can always check out as a guest.</p>
        </div>
      </div>
      <div className="mx-auto w-full max-w-md">
        <Link to="/" className="mb-8 inline-block lg:hidden"><Logo /></Link>
        <h1 className="font-display text-[2.5rem] sm:text-[3.25rem]">{title}</h1>
        {lede && <p className="mt-3 text-stone">{lede}</p>}
        <div className="mt-8">{children}</div>
        {footer && <div className="mt-8 border-t border-line pt-6 text-sm text-stone">{footer}</div>}
      </div>
    </div>
  );
}
