import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { App } from 'antd';
import { Heart } from 'lucide-react';
import { selectUser } from '@/features/auth/authSlice';
import { toggleWishlist } from '@/features/wishlist/wishlistSlice';

/** Wishlists belong to accounts; guests are invited (not forced) to sign in. */
export default function WishlistButton({ product, className = '', withLabel = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const user = useSelector(selectUser);
  const saved = useSelector((s) => s.wishlist.ids.includes(product.id));

  const onClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      message.info('Sign in to save products to your wishlist.');
      navigate(`/login?next=${encodeURIComponent(`/products/${product.slug}`)}`);
      return;
    }
    if (user.role !== 'customer') return message.info('Wishlists are available on customer accounts.');
    try {
      const { saved: nowSaved } = await dispatch(toggleWishlist(product)).unwrap();
      message.success(nowSaved ? 'Saved to your wishlist.' : 'Removed from your wishlist.');
    } catch {
      message.error('Could not update your wishlist. Please try again.');
    }
  };

  return (
    <button type="button" onClick={onClick} aria-pressed={saved} aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
      className={`inline-flex items-center justify-center gap-2 transition ${className}`}>
      <Heart size={18} strokeWidth={1.6} className={saved ? 'fill-rosewood text-rosewood' : 'text-mauve'} />
      {withLabel && <span className="text-sm">{saved ? 'Saved' : 'Save'}</span>}
    </button>
  );
}
