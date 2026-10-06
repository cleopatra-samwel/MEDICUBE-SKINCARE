import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Heart } from 'lucide-react';
import { fetchWishlist } from '@/features/wishlist/wishlistSlice';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import ProductGrid from '@/components/product/ProductGrid';
import EmptyState from '@/components/ui/EmptyState';

export default function Wishlist() {
  useDocumentTitle('Wishlist');
  const dispatch = useDispatch();
  const { products, loaded } = useSelector((s) => s.wishlist);
  const role = useSelector((s) => s.auth.user?.role);
  useEffect(() => { if (role === 'customer') dispatch(fetchWishlist()); }, [dispatch, role]);

  if (role !== 'customer') return <EmptyState icon={Heart} title="Wishlists are for customer accounts" text="Sign in with a customer account to save products." />;
  if (loaded && !products.length) return <EmptyState icon={Heart} title="Your wishlist is empty" text="Tap the heart on any product to save it here." action="Browse products" to="/products" />;
  return (
    <div>
      <h2 className="mb-6 font-display text-[2.125rem]">Wishlist</h2>
      <ProductGrid products={products} loading={!loaded} skeletons={3} cols="xl:grid-cols-3" />
    </div>
  );
}
