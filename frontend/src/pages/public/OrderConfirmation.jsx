import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CheckCircle2, Copy } from 'lucide-react';
import { App } from 'antd';
import PageLoader from '@/components/ui/PageLoader';
import ErrorState from '@/components/ui/ErrorState';
import OrderTimeline from '@/components/order/OrderTimeline';
import OrderSummaryLines from '@/components/order/OrderSummaryLines';
import { orderService } from '@/services/orderService';
import { selectUser } from '@/features/auth/authSlice';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { orderAccess } from '@/utils/orderAccess';

export default function OrderConfirmation() {
  useDocumentTitle('Order confirmed');
  const { orderNumber } = useParams();
  const { message } = App.useApp();
  const user = useSelector(selectUser);
  const phone = orderAccess.get(orderNumber);
  const { data, loading, error, reload } = useAsync(() => orderService.paymentStatus(orderNumber, phone || undefined), [orderNumber]);

  if (loading) return <PageLoader />;
  if (error) {
    return (
      <div className="shell">
        <ErrorState error={error} onRetry={reload} />
        <p className="-mt-6 pb-10 text-center text-sm"><Link to="/track-order" className="link-underline">Track your order instead</Link></p>
      </div>
    );
  }
  const { order } = data;
  const paid = order.payment_status === 'PAID';

  return (
    <div className="shell max-w-3xl py-14 sm:py-20">
      <div className="text-center">
        <CheckCircle2 size={56} strokeWidth={1.2} className="mx-auto text-rosewood" />
        <h1 className="mt-6 font-display text-[2.5rem] sm:text-[3.25rem]">{paid ? 'Thank you for your order' : 'Your order has been placed'}</h1>
        <p className="mx-auto mt-4 max-w-md text-stone">
          {paid ? 'Payment confirmed. We are preparing your parcel and will let you know when it is on the way.' : 'We will start preparing it as soon as your payment is confirmed.'}
        </p>
        <button type="button" onClick={() => navigator.clipboard?.writeText(order.order_number).then(() => message.success('Order number copied.'))}
          className="mt-8 inline-flex items-center gap-3 rounded-full bg-petal px-6 py-3 font-sans text-xl font-bold tabular-nums tracking-[0.01em] text-mauve transition hover:bg-blush">
          {order.order_number} <Copy size={16} className="text-rosewood" />
        </button>
        <p className="mt-2 text-sm text-stone">Keep this number with your phone ({order.customer.phone}) to track your order.</p>
      </div>

      <div className="card mt-12 p-6 sm:p-10"><OrderTimeline steps={order.timeline} /></div>
      <div className="card mt-6 p-6 sm:p-10">
        <h2 className="font-display text-[1.75rem]">Order details</h2>
        <div className="mt-4"><OrderSummaryLines items={order.items} subtotal={order.subtotal} deliveryFee={order.delivery_fee} total={order.total} /></div>
      </div>

      <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
        {!paid && order.status !== 'CANCELLED' && <Link to={`/checkout/payment/${order.order_number}`} className="btn-primary">Complete payment</Link>}
        <Link to="/track-order" className="btn-outline">Track order</Link>
        <Link to="/products" className="btn-outline">Continue shopping</Link>
      </div>
      {!user && (
        <p className="mt-10 text-center text-sm text-stone">
          Want your orders in one place next time? <Link to="/register" className="link-underline">Create an account</Link> (optional).
        </p>
      )}
    </div>
  );
}
