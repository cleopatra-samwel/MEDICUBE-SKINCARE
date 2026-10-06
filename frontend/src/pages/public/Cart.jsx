import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Alert } from 'antd';
import { ArrowLeft, ShoppingBag, Trash2 } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import QuantitySelector from '@/components/ui/QuantitySelector';
import SmartImage from '@/components/ui/SmartImage';
import { removeItem, selectCartItems, selectCartSubtotal, setQuantity } from '@/features/cart/cartSlice';
import { useCartQuote } from '@/hooks/useCartQuote';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatPrice } from '@/utils/format';

export default function Cart() {
  useDocumentTitle('Your cart');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const defaultFee = useSelector((s) => s.ui.shopConfig?.delivery?.fees_by_region?.['Dar es Salaam']);
  const { quote, loading, issues } = useCartQuote('Dar es Salaam');

  if (!items.length) {
    return (
      <>
        <PageHeader title="Your cart" crumbs={[[null, 'Cart']]} />
        <div className="shell"><EmptyState icon={ShoppingBag} title="Your cart is empty" text="Browse the collection and add your favourites. No account needed." action="Shop products" to="/products" /></div>
      </>
    );
  }

  const deliveryFee = quote?.delivery_fee ?? defaultFee ?? null;
  const total = quote?.total ?? subtotal + (deliveryFee || 0);

  return (
    <>
      <PageHeader title="Your cart" crumbs={[[null, 'Cart']]} />
      <div className="shell grid gap-10 py-10 lg:grid-cols-[1fr_380px] lg:gap-14 lg:py-14">
        <div>
          {issues.length > 0 && (
            <Alert type="warning" showIcon className="mb-6" message="We updated your cart" description={<ul className="list-disc pl-4">{issues.map((m) => <li key={m}>{m}</li>)}</ul>} />
          )}
          <div className="hidden grid-cols-[1fr_140px_120px_40px] gap-4 border-b border-line pb-3 text-sm font-semibold text-stone md:grid">
            <span>Product</span><span>Quantity</span><span className="text-right">Total</span><span />
          </div>
          <ul className="divide-y divide-line">
            {items.map((item) => (
              <li key={item.productId} className="grid grid-cols-[88px_1fr] gap-4 py-6 md:grid-cols-[1fr_140px_120px_40px] md:items-center">
                <div className="contents md:flex md:items-center md:gap-5">
                  <Link to={`/products/${item.slug}`}><SmartImage src={item.image} alt={item.name} className="h-28 w-[88px] rounded-xl" /></Link>
                  <div>
                    <Link to={`/products/${item.slug}`} className="text-base font-semibold leading-snug text-mauve hover:text-rosewood">{item.name}</Link>
                    <p className="mt-1 text-sm tabular-nums text-stone">{formatPrice(item.price)}{item.size ? ` · ${item.size}` : ''}</p>
                    <div className="mt-4 flex items-center justify-between md:hidden">
                      <QuantitySelector size="sm" value={item.quantity} max={item.maxQuantity} onChange={(quantity) => dispatch(setQuantity({ productId: item.productId, quantity }))} />
                      <span className="font-bold tabular-nums">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                    <button type="button" onClick={() => dispatch(removeItem(item.productId))} className="mt-3 inline-flex items-center gap-1.5 text-sm text-stone hover:text-rose-700 md:hidden">
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
                <div className="hidden md:block">
                  <QuantitySelector size="sm" value={item.quantity} max={item.maxQuantity} onChange={(quantity) => dispatch(setQuantity({ productId: item.productId, quantity }))} />
                </div>
                <span className="hidden text-right font-bold tabular-nums md:block">{formatPrice(item.price * item.quantity)}</span>
                <button type="button" onClick={() => dispatch(removeItem(item.productId))} aria-label={`Remove ${item.name}`} className="hidden h-9 w-9 place-items-center rounded-full text-stone hover:bg-petal hover:text-rose-700 md:grid">
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
          <Link to="/products" className="mt-6 inline-flex items-center gap-2 text-sm text-rosewood"><ArrowLeft size={15} /> Continue shopping</Link>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6 sm:p-8">
            <h2 className="font-display text-[1.75rem]">Order summary</h2>
            <dl className={`mt-6 space-y-3 text-[15px] transition-opacity ${loading ? 'opacity-60' : ''}`}>
              <div className="flex justify-between"><dt className="text-stone">Subtotal</dt><dd className="tabular-nums">{formatPrice(quote?.subtotal ?? subtotal)}</dd></div>
              <div className="flex justify-between">
                <dt className="text-stone">Delivery <span className="text-xs">(Dar es Salaam)</span></dt>
                <dd className="tabular-nums">{deliveryFee === null ? '—' : deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-4 text-lg font-bold text-mauve"><dt>Total</dt><dd className="tabular-nums">{formatPrice(total)}</dd></div>
            </dl>
            <p className="mt-3 text-xs text-stone">Delivery to other regions is calculated at checkout.</p>
            <button type="button" onClick={() => navigate('/checkout')} className="btn-primary mt-6 w-full">Proceed to checkout</button>
            <p className="mt-4 text-center text-xs text-stone">No account needed. Check out as a guest.</p>
          </div>
        </aside>
      </div>
    </>
  );
}
