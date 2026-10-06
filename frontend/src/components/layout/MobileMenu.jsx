import { Drawer } from 'antd';
import { Link, NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LayoutDashboard, LogOut, PackageSearch, ShieldCheck, User } from 'lucide-react';
import Logo from '@/assets/brand/Logo';
import { logout, selectIsStaff, selectUser } from '@/features/auth/authSlice';
import { NAV_LINKS } from './navLinks';
import SocialLinks from './SocialLinks';

export default function MobileMenu({ open, onClose }) {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isStaff = useSelector(selectIsStaff);

  return (
    <Drawer open={open} onClose={onClose} placement="left" width="min(86vw, 360px)" title={<Logo compact />}
      styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column' } }}>
      <nav className="flex-1 px-6 py-4" aria-label="Mobile">
        <ul>
          {NAV_LINKS.map((l) => (
            <li key={l.to} className="border-b border-line/70">
              <NavLink to={l.to} end={l.end} onClick={onClose}
                className={({ isActive }) => `block py-4 font-display text-[1.625rem] font-semibold ${isActive ? 'text-rosewood' : 'text-mauve'}`}>
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <Link to="/track-order" onClick={onClose} className="mt-6 flex items-center gap-3 text-mauve">
          <PackageSearch size={18} strokeWidth={1.6} /> Track an order
        </Link>
      </nav>

      <div className="space-y-3 border-t border-line bg-porcelain px-6 py-6">
        {user ? (
          <>
            <p className="text-sm text-stone">Signed in as <span className="text-mauve">{user.name}</span></p>
            {isStaff ? (
              <Link to="/admin/dashboard" onClick={onClose} className="btn-primary w-full"><LayoutDashboard size={17} /> Admin dashboard</Link>
            ) : (
              <Link to="/profile" onClick={onClose} className="btn-primary w-full"><User size={17} /> My account</Link>
            )}
            <button type="button" onClick={() => { dispatch(logout()); onClose(); }} className="btn-outline w-full"><LogOut size={17} /> Sign out</button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={onClose} className="btn-outline w-full">Sign In</Link>
            <Link to="/register" onClick={onClose} className="btn-primary w-full">Create Account</Link>
          </>
        )}
        <Link to="/admin/login" onClick={onClose} className="flex items-center justify-center gap-2 pt-2 text-sm text-stone">
          <ShieldCheck size={15} /> Admin Login
        </Link>
        <div className="flex justify-center pt-2"><SocialLinks /></div>
      </div>
    </Drawer>
  );
}
