import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Drawer } from 'antd';
import { ShoppingBag, Trash2 } from 'lucide-react';
import { removeItem, selectCartItems, selectCartSubtotal, setQuantity } from '@/features/cart/cartSlice';
import { closeCart } from '@/features/ui/uiSlice';
import QuantitySelector from '@/components/ui/QuantitySelector';
import SmartImage from '@/components/ui/SmartImage';
import EmptyState from '@/components/ui/EmptyState';
import { formatPrice } from '@/utils/format';

/** Slide-out mini cart. Prices here are the browser snapshot; the Cart page re-prices with the server. */
export default function CartDrawer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const open = useSelector((s) => s.ui.cartOpen);
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const threshold = useSelector((s) => s.ui.shopConfig?.delivery?.free_delivery_threshold);
  const close = () => dispatch(closeCart());
  const go = (to) => { close(); navigate(to); };
  const remaining = threshold ? Math.max(0, threshold - subtotal) : 0;

  return (
    <Drawer open={open} onClose={close} placement="right" width="min(92vw, 440px)" title="Your cart"
      styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column' } }}>
      {items.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="Your cart is empty" text="Find something lovely for your skin." action="Shop products" onAction={() => go('/products')} />
      ) : (
        <>
          {threshold > 0 && (
            <div className="border-b border-line px-6 py-4">
              <p className="text-sm text-stone">
                {remaining > 0 ? <>Add <span className="font-semibold text-mauve">{formatPrice(remaining)}</span> more for free delivery.</> : 'You have unlocked free delivery.'}
              </p>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-petal">
                <div className="h-full rounded-full bg-rosewood transition-all duration-500" style={{ width: `${Math.min(100, (subtotal / threshold) * 100)}%` }} />
              </div>
            </div>
          )}
          <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
            {items.map((item) => (
              <li key={item.productId} className="flex gap-4 py-5">
                <Link to={`/products/${item.slug}`} onClick={close}>
                  <SmartImage src={item.image} alt={item.name} className="h-24 w-20 rounded-xl" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-3">
                    <Link to={`/products/${item.slug}`} onClick={close} className="text-base font-semibold leading-snug text-mauve hover:text-rosewood">{item.name}</Link>
                    <button type="button" onClick={() => dispatch(removeItem(item.productId))} aria-label={`Remove ${item.name}`} className="h-8 text-stone transition hover:text-rose-700">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  {item.size && <p className="text-xs text-stone">{item.size}</p>}
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <QuantitySelector size="sm" value={item.quantity} max={item.maxQuantity}
                      onChange={(quantity) => dispatch(setQuantity({ productId: item.productId, quantity }))} />
                    <span className="font-bold tabular-nums">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="border-t border-line bg-porcelain px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5">
            <div className="flex justify-between text-mauve"><span>Subtotal</span><span className="font-bold tabular-nums">{formatPrice(subtotal)}</span></div>
            <p className="mt-1 text-xs text-stone">Delivery fee is calculated from your region at checkout.</p>
            <div className="mt-5 grid gap-2">
              <button type="button" onClick={() => go('/checkout')} className="btn-primary w-full">Proceed to checkout</button>
              <button type="button" onClick={() => go('/cart')} className="btn-outline w-full">View cart</button>
            </div>
          </div>
        </>
      )}
    </Drawer>
  );
}
