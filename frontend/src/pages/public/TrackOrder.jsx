import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert } from 'antd';
import { PackageSearch } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import OrderTimeline from '@/components/order/OrderTimeline';
import OrderSummaryLines from '@/components/order/OrderSummaryLines';
import StatusTag from '@/components/ui/StatusTag';
import { orderService } from '@/services/orderService';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cleanPhone, formatDateTime } from '@/utils/format';

export default function TrackOrder() {
  useDocumentTitle('Track order');
  const [params] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(params.get('order') || '');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!orderNumber.trim() || !phone.trim()) return setError('Enter both your order number and phone number.');
    setBusy(true);
    try {
      setOrder(await orderService.track(orderNumber.trim().toUpperCase(), cleanPhone(phone)));
    } catch (err) {
      setOrder(null);
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Track your order" crumbs={[[null, 'Track order']]} lede="No account needed. Use the order number from your confirmation and the phone number you checked out with." />
      <div className="shell grid gap-10 py-10 lg:grid-cols-[380px_1fr] lg:gap-14 lg:py-14">
        <form onSubmit={submit} className="card h-fit space-y-5 p-6 sm:p-8" noValidate>
          <div>
            <label htmlFor="on" className="field-label">Order number</label>
            <input id="on" className="field uppercase" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="SKN-10245" autoComplete="off" />
          </div>
          <div>
            <label htmlFor="ph" className="field-label">Phone number</label>
            <input id="ph" className="field" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XXXXXXXX" inputMode="tel" autoComplete="tel" />
          </div>
          {error && <Alert type="error" showIcon message={error} />}
          <button type="submit" disabled={busy} className="btn-primary w-full">{busy ? 'Checking…' : 'Track order'}</button>
        </form>

        <div aria-live="polite">
          {order ? (
            <div className="space-y-6">
              <div className="card p-6 sm:p-10">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-stone">Order</p>
                    <h2 className="font-display text-[2.125rem]">{order.order_number}</h2>
                    <p className="mt-1 text-sm text-stone">Placed {formatDateTime(order.created_at)}</p>
                  </div>
                  <div className="flex gap-2"><StatusTag status={order.status} /><StatusTag status={order.payment_status} /></div>
                </div>
                <div className="mt-10"><OrderTimeline steps={order.timeline} /></div>
                {order.delivery?.rider_name && ['OUT_FOR_DELIVERY'].includes(order.status) && (
                  <p className="mt-8 rounded-xl bg-petal/70 px-4 py-3 text-sm text-mauve">Your rider is {order.delivery.rider_name}{order.delivery.rider_phone ? ` (${order.delivery.rider_phone})` : ''}.</p>
                )}
              </div>
              <div className="card p-6 sm:p-10">
                <h3 className="font-display text-[1.5rem]">Items</h3>
                <div className="mt-3"><OrderSummaryLines items={order.items} subtotal={order.subtotal} deliveryFee={order.delivery_fee} total={order.total} /></div>
                <p className="mt-6 text-sm text-stone">Delivering to {order.delivery_address.street}, {order.delivery_address.district}, {order.delivery_address.region}</p>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-line p-10 text-center">
              <PackageSearch size={36} strokeWidth={1.3} className="text-rose" />
              <p className="mt-4 font-display text-[1.5rem] text-mauve">Your order progress will appear here</p>
              <p className="mt-1 max-w-sm text-sm text-stone">Order placed → Payment confirmed → Processing → Out for delivery → Delivered</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
