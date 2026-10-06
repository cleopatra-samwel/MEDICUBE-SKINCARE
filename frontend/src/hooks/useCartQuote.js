import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { reconcile, selectCartItems } from '@/features/cart/cartSlice';
import { orderService } from '@/services/orderService';

/**
 * Asks the server to price the browser cart (prices, stock, delivery fee).
 * If anything changed since the product was added, the cart is corrected and
 * the reasons are returned as `issues` so the page can explain them.
 */
export function useCartQuote(region) {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const [state, setState] = useState({ quote: null, loading: true, error: null, issues: [] });
  const key = JSON.stringify(items.map((i) => [i.productId, i.quantity])) + (region || '');

  useEffect(() => {
    if (!items.length) {
      setState({ quote: null, loading: false, error: null, issues: [] });
      return undefined;
    }
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    const t = setTimeout(() => {
      orderService.quote(items, region)
        .then((quote) => {
          if (cancelled) return;
          const byId = new Map(quote.lines.map((l) => [l.product_id, l]));
          const stale = items.some((i) => {
            const l = byId.get(i.productId);
            return !l?.available || l.unit_price !== i.price || l.quantity !== i.quantity || Math.min(l.stock, 99) !== i.maxQuantity;
          });
          if (stale) dispatch(reconcile(quote.lines));
          setState({ quote, loading: false, error: null, issues: quote.issues || [] });
        })
        .catch((error) => !cancelled && setState((s) => ({ ...s, loading: false, error })));
    }, 250);
    return () => { cancelled = true; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state;
}
