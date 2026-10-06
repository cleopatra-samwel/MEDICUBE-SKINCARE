import SmartImage from '@/components/ui/SmartImage';
import { formatPrice } from '@/utils/format';

/** Items + totals block reused by checkout, confirmation, tracking and account pages. */
export default function OrderSummaryLines({ items = [], subtotal, deliveryFee, total, compact = false }) {
  return (
    <div>
      <ul className="divide-y divide-line">
        {items.map((it) => (
          <li key={it.product_id ?? it.productId} className="flex items-center gap-4 py-3.5">
            <div className="relative">
              <SmartImage src={it.image} alt={it.name} className={`${compact ? 'h-14 w-12' : 'h-16 w-14'} rounded-lg`} />
              <span className="absolute -right-2 -top-2 grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-mauve px-1 text-[11px] font-semibold text-white">{it.quantity}</span>
            </div>
            <p className="flex-1 text-sm font-semibold leading-snug text-mauve">{it.name}</p>
            <p className="text-sm font-bold tabular-nums">{formatPrice(it.line_total ?? (it.unit_price ?? it.price) * it.quantity)}</p>
          </li>
        ))}
      </ul>
      <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
        <div className="flex justify-between"><dt className="text-stone">Subtotal</dt><dd className="tabular-nums">{formatPrice(subtotal)}</dd></div>
        <div className="flex justify-between">
          <dt className="text-stone">Delivery</dt>
          <dd className="tabular-nums">{deliveryFee === null || deliveryFee === undefined ? 'Calculated at checkout' : deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-3 text-base font-bold text-mauve">
          <dt>Total</dt><dd className="tabular-nums">{formatPrice(total ?? subtotal + (deliveryFee || 0))}</dd>
        </div>
      </dl>
    </div>
  );
}
