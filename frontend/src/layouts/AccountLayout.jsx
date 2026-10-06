import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, LogOut, Package, User } from 'lucide-react';
import { logout, selectIsStaff, selectUser } from '@/features/auth/authSlice';
import { Link } from 'react-router-dom';

const LINKS = [
  { to: '/profile', label: 'My profile', Icon: User },
  { to: '/orders', label: 'My orders', Icon: Package },
  { to: '/wishlist', label: 'Wishlist', Icon: Heart },
];

export default function AccountLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const isStaff = useSelector(selectIsStaff);

  const signOut = async () => {
    await dispatch(logout());
    navigate('/');
  };

  return (
    <div className="shell py-10 sm:py-14">
      <header className="mb-8 sm:mb-12">
        <h1 className="font-display text-[2.5rem] sm:text-[3.25rem]">Hello, {user?.name?.split(' ')[0]}</h1>
        <p className="mt-2 text-stone">Your orders, addresses and saved favourites in one place.</p>
        {isStaff && <p className="mt-3 text-sm">You are signed in as staff. <Link to="/admin/dashboard" className="link-underline">Open the admin dashboard</Link></p>}
      </header>
      <div className="grid gap-8 lg:grid-cols-[240px_1fr] lg:gap-12">
        <aside>
          <nav className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:flex-col lg:px-0" aria-label="Account">
            {LINKS.map(({ to, label, Icon }) => (
              <NavLink key={to} to={to} end={to !== '/orders'}
                className={({ isActive }) => `flex shrink-0 items-center gap-3 rounded-full px-5 py-2.5 text-[15px] transition lg:rounded-xl ${isActive ? 'bg-petal text-rosewood' : 'text-mauve hover:bg-white'}`}>
                <Icon size={17} strokeWidth={1.6} /> {label}
              </NavLink>
            ))}
            <button type="button" onClick={signOut} className="flex shrink-0 items-center gap-3 rounded-full px-5 py-2.5 text-[15px] text-stone transition hover:bg-white hover:text-mauve lg:rounded-xl">
              <LogOut size={17} strokeWidth={1.6} /> Logout
            </button>
          </nav>
        </aside>
        <section className="min-w-0"><Outlet /></section>
      </div>
    </div>
  );
}
