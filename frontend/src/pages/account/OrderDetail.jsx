import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { accountService } from '@/services/accountService';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import PageLoader from '@/components/ui/PageLoader';
import ErrorState from '@/components/ui/ErrorState';
import StatusTag from '@/components/ui/StatusTag';
import OrderTimeline from '@/components/order/OrderTimeline';
import OrderSummaryLines from '@/components/order/OrderSummaryLines';
import { formatDateTime, humanize } from '@/utils/format';

export default function OrderDetail() {
  const { orderNumber } = useParams();
  useDocumentTitle(`Order ${orderNumber}`);
  const { data: order, loading, error, reload } = useAsync(() => accountService.order(orderNumber), [orderNumber]);

  if (loading) return <PageLoader full={false} />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  const unpaid = !['PAID', 'REFUNDED'].includes(order.payment_status) && order.status !== 'CANCELLED';

  return (
    <div className="space-y-6">
      <Link to="/orders" className="inline-flex items-center gap-2 text-sm text-rosewood"><ArrowLeft size={15} /> All orders</Link>
      <div className="card p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-[2.125rem]">{order.order_number}</h2>
            <p className="text-sm text-stone">Placed {formatDateTime(order.created_at)}</p>
          </div>
          <div className="flex gap-2"><StatusTag status={order.status} /><StatusTag status={order.payment_status} /></div>
        </div>
        <div className="mt-10"><OrderTimeline steps={order.timeline} /></div>
        {unpaid && <Link to={`/checkout/payment/${order.order_number}`} className="btn-primary mt-8">Complete payment</Link>}
      </div>
      <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
        <div className="card p-6 sm:p-8">
          <h3 className="font-display text-[1.5rem]">Items</h3>
          <div className="mt-3"><OrderSummaryLines items={order.items} subtotal={order.subtotal} deliveryFee={order.delivery_fee} total={order.total} /></div>
        </div>
        <div className="card space-y-6 p-6 text-sm sm:p-8">
          <div>
            <h3 className="font-display text-[1.5rem]">Delivery</h3>
            <p className="mt-2 text-stone">{order.customer.name} · {order.customer.phone}<br />{order.delivery_address.street}, {order.delivery_address.district}, {order.delivery_address.region}<br />{order.delivery_address.address_line}</p>
          </div>
          {order.payments?.length > 0 && (
            <div>
              <h3 className="font-display text-[1.5rem]">Payments</h3>
              <ul className="mt-2 space-y-2">
                {order.payments.map((p) => <li key={p.id} className="flex justify-between gap-3 text-stone"><span>{humanize(p.method)} · {p.reference}</span><StatusTag status={p.status} /></li>)}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
