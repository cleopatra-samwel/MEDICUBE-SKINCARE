import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Dropdown } from 'antd';
import { ChevronDown, Menu, Search, ShoppingBag, User } from 'lucide-react';
import Logo from '@/assets/brand/Logo';
import { selectCartCount } from '@/features/cart/cartSlice';
import { logout, selectIsStaff, selectUser } from '@/features/auth/authSlice';
import { openCart, openSearch } from '@/features/ui/uiSlice';
import { NAV_LINKS } from './navLinks';
import MobileMenu from './MobileMenu';

/**
 * Transparent over the home hero, solid white everywhere else and after scrolling.
 * Admin Login lives in the utility bar above (and in the footer / mobile menu)
 * so this bar stays uncluttered.
 */
export default function Navbar() {
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const count = useSelector(selectCartCount);
  const lastAddedAt = useSelector((s) => s.cart.lastAddedAt);
  const user = useSelector(selectUser);
  const isStaff = useSelector(selectIsStaff);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const overlay = pathname === '/' && !scrolled && !menuOpen;
  const text = overlay ? 'text-white' : 'text-mauve';

  const accountItems = isStaff
    ? [
      { key: 'admin', label: <Link to="/admin/dashboard">Admin dashboard</Link> },
      { type: 'divider' },
      { key: 'logout', label: 'Sign out', onClick: () => dispatch(logout()) },
    ]
    : [
      { key: 'profile', label: <Link to="/profile">My profile</Link> },
      { key: 'orders', label: <Link to="/orders">My orders</Link> },
      { key: 'wishlist', label: <Link to="/wishlist">Wishlist</Link> },
      { type: 'divider' },
      { key: 'logout', label: 'Sign out', onClick: () => dispatch(logout()) },
    ];

  return (
    <>
      <header className={`sticky top-0 z-40 transition-colors duration-500 ${overlay ? 'bg-transparent' : 'border-b border-line/70 bg-white/90 backdrop-blur-md'}`}>
        <nav className="shell flex h-[72px] items-center justify-between gap-4" aria-label="Main">
          <button type="button" className={`-ml-2 grid h-10 w-10 place-items-center lg:hidden ${text}`} onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu size={22} strokeWidth={1.6} />
          </button>

          <Link to="/" aria-label="Home" className="lg:mr-8">
            <Logo tone={overlay ? 'light' : 'dark'} />
          </Link>

          <ul className="hidden flex-1 items-center gap-9 lg:flex">
            {NAV_LINKS.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} end={l.end}
                  className={({ isActive }) => `relative py-2 text-[15px] font-medium tracking-[0.02em] transition ${text} after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:bg-current after:transition-transform ${isActive ? 'after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100'}`}>
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className={`flex items-center gap-1 sm:gap-2 ${text}`}>
            <button type="button" onClick={() => dispatch(openSearch())} className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-black/5" aria-label="Search products">
              <Search size={20} strokeWidth={1.6} />
            </button>
            <button type="button" onClick={() => dispatch(openCart())} className="relative grid h-10 w-10 place-items-center rounded-full transition hover:bg-black/5" aria-label={`Cart, ${count} items`}>
              <ShoppingBag size={20} strokeWidth={1.6} />
              {count > 0 && (
                <span key={lastAddedAt} className="absolute right-0.5 top-0.5 grid h-[18px] min-w-[18px] animate-bump place-items-center rounded-full bg-rosewood px-1 text-[11px] font-semibold text-white">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </button>

            {user ? (
              <Dropdown menu={{ items: accountItems }} placement="bottomRight" trigger={['click']}>
                <button type="button" className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-[15px] font-medium tracking-[0.02em] transition hover:bg-black/5 lg:inline-flex">
                  <User size={18} strokeWidth={1.6} /> {user.name.split(' ')[0]} <ChevronDown size={14} />
                </button>
              </Dropdown>
            ) : (
              <div className="ml-2 hidden items-center gap-2 lg:flex">
                <Link to="/login" className="px-3 py-2 text-[15px] font-medium tracking-[0.02em] transition hover:opacity-70">Sign In</Link>
                <Link to="/register" className={overlay ? 'btn-ghost-light btn-sm' : 'btn-primary btn-sm'}>Create Account</Link>
              </div>
            )}
          </div>
        </nav>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
