import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { formatPrice } from '@/utils/format';

/** Thin top strip: free-delivery note, order tracking, and the Admin Login link. */
export default function UtilityBar() {
  const threshold = useSelector((s) => s.ui.shopConfig?.delivery?.free_delivery_threshold);
  return (
    <div className="bg-mauve text-[13px] text-white/85">
      <div className="shell flex h-9 items-center justify-center gap-6 sm:justify-between">
        <p className="truncate">
          {threshold ? `Free delivery on orders over ${formatPrice(threshold)}` : 'Delivery across Tanzania'} · Pay with mobile money or card
        </p>
        <div className="hidden items-center gap-5 sm:flex">
          <Link to="/track-order" className="transition hover:text-white">Track order</Link>
          <span className="h-3 w-px bg-white/25" />
          <Link to="/admin/login" className="transition hover:text-white">Admin Login</Link>
        </div>
      </div>
    </div>
  );
}
