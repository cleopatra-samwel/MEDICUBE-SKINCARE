import { Outlet } from 'react-router-dom';
import UtilityBar from '@/components/layout/UtilityBar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';
import SearchOverlay from '@/components/layout/SearchOverlay';

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2">Skip to content</a>
      <UtilityBar />
      <Navbar />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <SearchOverlay />
    </div>
  );
}
