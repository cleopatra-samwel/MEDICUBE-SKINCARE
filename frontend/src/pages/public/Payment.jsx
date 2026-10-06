import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Alert, App } from 'antd';
import { CreditCard, Landmark, Loader2, Lock, Smartphone } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import PageLoader from '@/components/ui/PageLoader';
import ErrorState from '@/components/ui/ErrorState';
import OrderSummaryLines from '@/components/order/OrderSummaryLines';
import { orderService } from '@/services/orderService';
import { selectUser } from '@/features/auth/authSlice';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { orderAccess } from '@/utils/orderAccess';
import { cleanPhone, formatPrice, TZ_PHONE } from '@/utils/format';

const METHOD_ICONS = { mobile_money: Smartphone, card: CreditCard, bank: Landmark };
const POLL_MS = 5000;
const SETTLED = ['PAID', 'FAILED', 'CANCELLED', 'REFUNDED'];

/**
 * The page never decides that a payment succeeded. It starts a payment through
 * the backend, then polls the order until the backend (after a verified
 * provider callback) reports PAID, FAILED or CANCELLED.
 */
export default function Payment() {
  useDocumentTitle('Payment');
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const user = useSelector(selectUser);
  const methods = useSelector((s) => s.ui.shopConfig?.payment_methods) || [];
  const [phone, setPhone] = useState(() => orderAccess.get(orderNumber));
  const [phoneInput, setPhoneInput] = useState('');
  const [state, setState] = useState({ order: null, payment: null, loading: true, error: null });
  const [method, setMethod] = useState('mobile_money');
  const [payerPhone, setPayerPhone] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [busy, setBusy] = useState(false);
  const timer = useRef(null);
  const needsPhone = !user && !phone;

  const load = useCallback(async (silent = false) => {
    if (!silent) setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await orderService.paymentStatus(orderNumber, phone || undefined);
      setState({ order: res.order, payment: res.payment, loading: false, error: null });
      return res;
    } catch (error) {
      setState((s) => ({ ...s, loading: false, error }));
      return null;
    }
  }, [orderNumber, phone]);

  useEffect(() => {
    if (!needsPhone) load();
    else setState((s) => ({ ...s, loading: false }));
  }, [load, needsPhone]);

  useEffect(() => {
    if (state.order && !payerPhone) setPayerPhone(state.order.customer.phone || '');
  }, [state.order, payerPhone]);

  // Poll while a payment is in flight.
  const inFlight = state.payment && ['PENDING', 'PROCESSING'].includes(state.payment.status);
  useEffect(() => {
    if (!inFlight) return undefined;
    timer.current = setInterval(async () => {
      const res = await load(true);
      if (res?.payment?.status === 'PAID') {
        message.success('Payment confirmed. Thank you!');
        navigate(`/order-confirmation/${orderNumber}`, { replace: true });
      }
    }, POLL_MS);
    return () => clearInterval(timer.current);
  }, [inFlight, load, navigate, orderNumber, message]);

  useEffect(() => {
    if (state.order?.payment_status === 'PAID') navigate(`/order-confirmation/${orderNumber}`, { replace: true });
  }, [state.order, navigate, orderNumber]);

  const pay = async () => {
    setFieldError('');
    if (method === 'mobile_money' && !TZ_PHONE.test(cleanPhone(payerPhone))) {
      setFieldError('Enter the mobile money number that will pay, e.g. 0712 345 678.');
      return;
    }
    setBusy(true);
    try {
      const res = await orderService.initiatePayment(orderNumber, {
        method, order_phone: phone || undefined, payer_phone: method === 'mobile_money' ? cleanPhone(payerPhone) : undefined,
      });
      setState((s) => ({ ...s, payment: res.payment }));
      if (res.payment.checkout_url) window.location.assign(res.payment.checkout_url);
    } catch (e) {
      setFieldError(e.errors?.payer_phone?.[0] || e.errors?.method?.[0] || e.message);
    } finally {
      setBusy(false);
    }
  };

  if (needsPhone) {
    return (
      <>
        <PageHeader title="Complete your payment" crumbs={[[null, 'Payment']]} />
        <div className="shell max-w-md py-14">
          <p className="text-stone">For your security, enter the phone number used for order <span className="font-bold text-mauve">{orderNumber}</span>.</p>
          <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); orderAccess.save(orderNumber, cleanPhone(phoneInput)); setPhone(cleanPhone(phoneInput)); }}>
            <input className="field" value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} placeholder="07XX XXX XXX" inputMode="tel" aria-label="Phone number" />
            <button type="submit" className="btn-primary w-full" disabled={!phoneInput}>Continue</button>
          </form>
        </div>
      </>
    );
  }
  if (state.loading) return <PageLoader />;
  if (state.error) {
    return (
      <div className="shell">
        <ErrorState error={state.error} title={state.error.status === 404 ? 'Order not found' : undefined}
          onRetry={state.error.status === 404 ? () => { setPhone(''); } : () => load()} />
      </div>
    );
  }

  const { order, payment } = state;
  const cancelled = order.status === 'CANCELLED';

  return (
    <>
      <PageHeader title="Payment" crumbs={[[null, 'Checkout'], [null, 'Payment']]} lede={`Order ${order.order_number} · ${formatPrice(order.total)}`} />
      <div className="shell grid gap-10 py-10 lg:grid-cols-[1fr_400px] lg:gap-14 lg:py-14">
        <section>
          {cancelled ? (
            <Alert type="error" showIcon message="This order was cancelled" description={<>If you think this is a mistake, <Link to="/contact">contact us</Link>.</>} />
          ) : inFlight ? (
            <div className="card p-8 text-center">
              <Loader2 size={36} className="mx-auto animate-spin text-rosewood" />
              <h2 className="mt-5 font-display text-[1.75rem]">Waiting for payment confirmation</h2>
              <p className="mx-auto mt-3 max-w-md text-stone">
                {method === 'mobile_money' || payment.method === 'mobile_money'
                  ? 'Check your phone and approve the payment prompt with your PIN. This page updates automatically.'
                  : 'Complete the payment with your provider. This page updates automatically.'}
              </p>
              {payment.customer_message && <Alert type="info" className="mx-auto mt-6 max-w-lg text-left" message={payment.customer_message} />}
              {payment.checkout_url && <a href={payment.checkout_url} className="btn-primary mt-6">Open payment page</a>}
              <p className="mt-6 text-xs text-stone">Reference {payment.reference}</p>
            </div>
          ) : (
            <>
              {payment && ['FAILED', 'CANCELLED'].includes(payment.status) && (
                <Alert type="error" showIcon className="mb-6" message={payment.status === 'FAILED' ? 'Your payment did not go through' : 'The payment was cancelled'}
                  description={payment.failure_reason || 'No money was taken. You can try again below.'} />
              )}
              <h2 className="font-display text-[1.75rem]">Choose how to pay</h2>
              <div className="mt-5 grid gap-3" role="radiogroup" aria-label="Payment method">
                {methods.map((m) => {
                  const Icon = METHOD_ICONS[m.key] || CreditCard;
                  const on = method === m.key;
                  return (
                    <button key={m.key} type="button" role="radio" aria-checked={on} onClick={() => setMethod(m.key)}
                      className={`flex items-center gap-4 rounded-2xl border bg-white p-5 text-left transition ${on ? 'border-rosewood ring-4 ring-blush/60' : 'border-line hover:border-rose'}`}>
                      <span className={`grid h-11 w-11 place-items-center rounded-full ${on ? 'bg-rosewood text-white' : 'bg-petal text-rosewood'}`}><Icon size={20} strokeWidth={1.6} /></span>
                      <span className="flex-1">
                        <span className="block font-semibold text-mauve">{m.label}</span>
                        <span className="block text-sm text-stone">{m.description}</span>
                      </span>
                      <span className={`h-5 w-5 rounded-full border-2 ${on ? 'border-rosewood bg-rosewood shadow-[inset_0_0_0_3px_white]' : 'border-line'}`} />
                    </button>
                  );
                })}
              </div>

              {method === 'mobile_money' && (
                <div className="mt-6 max-w-sm">
                  <label htmlFor="payer" className="field-label">Mobile money number</label>
                  <input id="payer" className="field" value={payerPhone} onChange={(e) => setPayerPhone(e.target.value)} inputMode="tel" placeholder="07XX XXX XXX" />
                  <p className="mt-1.5 text-xs text-stone">You will receive a prompt on this phone to approve {formatPrice(order.total)}.</p>
                </div>
              )}
              {fieldError && <p className="field-error">{fieldError}</p>}

              <button type="button" onClick={pay} disabled={busy || !methods.length} className="btn-primary mt-8 w-full sm:w-auto sm:min-w-[260px]">
                {busy ? 'Starting payment…' : `Pay ${formatPrice(order.total)}`}
              </button>
              <p className="mt-4 flex items-center gap-2 text-xs text-stone"><Lock size={13} /> Payments are processed by a licensed provider. We never see your PIN or card details.</p>
            </>
          )}
          <p className="mt-10 text-sm text-stone">
            Your order number is <span className="font-bold text-mauve">{order.order_number}</span>. You can <Link to="/track-order" className="link-underline">track it anytime</Link> with your phone number.
          </p>
        </section>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6 sm:p-8">
            <h2 className="font-display text-[1.75rem]">Order summary</h2>
            <div className="mt-4"><OrderSummaryLines compact items={order.items} subtotal={order.subtotal} deliveryFee={order.delivery_fee} total={order.total} /></div>
            <div className="mt-6 border-t border-line pt-5 text-sm text-stone">
              <p className="font-semibold text-mauve">Delivering to</p>
              <p className="mt-1">{order.customer.name} · {order.customer.phone}</p>
              <p>{order.delivery_address.street}, {order.delivery_address.district}, {order.delivery_address.region}</p>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
