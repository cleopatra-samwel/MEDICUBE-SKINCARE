import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, App, Checkbox, Form, Input, Radio, Select } from 'antd';
import { Lock, ShoppingBag } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import OrderSummaryLines from '@/components/order/OrderSummaryLines';
import { clearCart, selectCartItems, selectCartSubtotal } from '@/features/cart/cartSlice';
import { selectUser } from '@/features/auth/authSlice';
import { orderService } from '@/services/orderService';
import { accountService } from '@/services/accountService';
import { toFormErrors } from '@/services/api';
import { useCartQuote } from '@/hooks/useCartQuote';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { orderAccess } from '@/utils/orderAccess';
import { cleanPhone, TZ_PHONE } from '@/utils/format';

const ADDRESS_FIELDS = ['full_name', 'phone', 'region', 'district', 'street', 'address_line', 'notes'];

export default function Checkout() {
  useDocumentTitle('Checkout');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const user = useSelector(selectUser);
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const regions = useSelector((s) => s.ui.shopConfig?.regions) || [];
  const region = Form.useWatch('region', form);
  const { quote, loading: pricing, issues } = useCartQuote(region);
  const [addresses, setAddresses] = useState([]);
  const [addressId, setAddressId] = useState('new');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const isCustomer = user?.role === 'customer';

  useEffect(() => {
    if (!user) return;
    form.setFieldsValue({ full_name: user.name, email: user.email, phone: user.phone || undefined });
    if (!isCustomer) return;
    accountService.addresses().then((r) => {
      const list = Array.isArray(r) ? r : r.data || [];
      setAddresses(list);
      const def = list.find((a) => a.is_default) || list[0];
      if (def) { setAddressId(def.id); form.setFieldsValue(pick(def)); }
    }).catch(() => {});
  }, [user, isCustomer, form]);

  const pick = (a) => Object.fromEntries(ADDRESS_FIELDS.map((k) => [k, a[k] ?? undefined]));
  const chooseAddress = (id) => {
    setAddressId(id);
    if (id === 'new') form.setFieldsValue({ district: '', street: '', address_line: '', notes: '' });
    else form.setFieldsValue(pick(addresses.find((a) => a.id === id)));
  };

  const regionOptions = useMemo(() => regions.map((r) => ({ value: r, label: r })), [regions]);

  if (!items.length) {
    return (
      <>
        <PageHeader title="Checkout" crumbs={[['/cart', 'Cart'], [null, 'Checkout']]} />
        <div className="shell"><EmptyState icon={ShoppingBag} title="Nothing to check out yet" text="Your cart is empty." action="Shop products" to="/products" /></div>
      </>
    );
  }

  const submit = async (values) => {
    setBusy(true);
    setError(null);
    try {
      const payload = { ...values, phone: cleanPhone(values.phone), save_address: isCustomer && addressId === 'new' ? !!values.save_address : false };
      const order = await orderService.checkout(payload, items);
      orderAccess.save(order.order_number, payload.phone);
      dispatch(clearCart());
      message.success('Your order has been placed successfully.');
      navigate(`/checkout/payment/${order.order_number}`, { replace: true });
    } catch (e) {
      form.setFields(toFormErrors(e.errors).filter((f) => !String(f.name[0]).startsWith('items')));
      setError(e.errors?.items?.[0] || Object.entries(e.errors || {}).find(([k]) => k.startsWith('items'))?.[1]?.[0] || e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Checkout" crumbs={[['/cart', 'Cart'], [null, 'Checkout']]} />
      <div className="shell py-10 lg:py-14">
        {!user && (
          <p className="mb-8 rounded-2xl bg-petal/70 px-5 py-4 text-sm text-mauve">
            Checking out as a guest. Have an account? <Link to="/login?next=/checkout" className="link-underline">Sign in</Link> to use saved addresses. It is completely optional.
          </p>
        )}
        <Form form={form} layout="vertical" requiredMark={false} onFinish={submit} scrollToFirstError size="large"
          className="grid gap-10 lg:grid-cols-[1fr_400px] lg:gap-14" initialValues={{ region: 'Dar es Salaam', save_address: true }}>
          <div>
            <section>
              <h2 className="font-display text-[1.75rem]">Contact details</h2>
              <div className="mt-5 grid gap-x-5 sm:grid-cols-2">
                <Form.Item name="full_name" label="Full name" rules={[{ required: true, message: 'Enter your full name.' }]} className="sm:col-span-2">
                  <Input autoComplete="name" maxLength={120} />
                </Form.Item>
                <Form.Item name="phone" label="Phone number" extra="We use this to confirm delivery and to track your order."
                  rules={[{ required: true, message: 'Enter your phone number.' }, { validator: (_, v) => (!v || TZ_PHONE.test(cleanPhone(v)) ? Promise.resolve() : Promise.reject(new Error('Enter a Tanzanian number, e.g. 0712 345 678.'))) }]}>
                  <Input autoComplete="tel" inputMode="tel" placeholder="07XX XXX XXX" />
                </Form.Item>
                <Form.Item name="email" label="Email (optional)" rules={[{ type: 'email', message: 'Enter a valid email address.' }]} extra="For your receipt and order updates.">
                  <Input autoComplete="email" inputMode="email" />
                </Form.Item>
              </div>
            </section>

            <section className="mt-8 border-t border-line pt-8">
              <h2 className="font-display text-[1.75rem]">Delivery address</h2>
              {addresses.length > 0 && (
                <Radio.Group value={addressId} onChange={(e) => chooseAddress(e.target.value)} className="mt-5 !grid w-full gap-3 sm:grid-cols-2">
                  {addresses.map((a) => (
                    <Radio key={a.id} value={a.id} className="!m-0 rounded-xl border border-line bg-white p-4 [&.ant-radio-wrapper-checked]:border-rosewood">
                      <span className="block font-semibold text-mauve">{a.label || a.full_name}</span>
                      <span className="block text-sm text-stone">{a.street}, {a.district}, {a.region}</span>
                    </Radio>
                  ))}
                  <Radio value="new" className="!m-0 rounded-xl border border-dashed border-line bg-white p-4 [&.ant-radio-wrapper-checked]:border-rosewood">
                    <span className="font-semibold text-mauve">Use a new address</span>
                  </Radio>
                </Radio.Group>
              )}
              <div className="mt-5 grid gap-x-5 sm:grid-cols-2">
                <Form.Item name="region" label="Region" rules={[{ required: true, message: 'Choose your region.' }]}>
                  <Select showSearch options={regionOptions} placeholder="Choose region" optionFilterProp="label" />
                </Form.Item>
                <Form.Item name="district" label="District" rules={[{ required: true, message: 'Enter your district.' }]}>
                  <Input placeholder="e.g. Kinondoni" maxLength={100} />
                </Form.Item>
                <Form.Item name="street" label="Street / Area" rules={[{ required: true, message: 'Enter your street or area.' }]} className="sm:col-span-2">
                  <Input placeholder="e.g. Mikocheni B, Old Bagamoyo Road" maxLength={150} />
                </Form.Item>
                <Form.Item name="address_line" label="Detailed delivery address" rules={[{ required: true, message: 'Help our rider find you.' }]} className="sm:col-span-2">
                  <Input.TextArea rows={3} maxLength={500} placeholder="House or building, floor, nearby landmark" />
                </Form.Item>
                <Form.Item name="notes" label="Additional notes (optional)" className="sm:col-span-2">
                  <Input.TextArea rows={2} maxLength={500} placeholder="Best time to deliver, gate code…" />
                </Form.Item>
                {isCustomer && addressId === 'new' && (
                  <Form.Item name="save_address" valuePropName="checked" className="sm:col-span-2">
                    <Checkbox>Save this address to my account</Checkbox>
                  </Form.Item>
                )}
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="card p-6 sm:p-8">
              <h2 className="font-display text-[1.75rem]">Order summary</h2>
              {issues.length > 0 && <Alert type="warning" showIcon className="mt-4" message={issues.join(' ')} />}
              <div className={`mt-4 transition-opacity ${pricing ? 'opacity-60' : ''}`}>
                <OrderSummaryLines compact items={items.map((i) => ({ ...i, product_id: i.productId }))}
                  subtotal={quote?.subtotal ?? subtotal} deliveryFee={quote?.delivery_fee} total={quote?.total} />
              </div>
              {error && <Alert type="error" showIcon className="mt-5" message={error} />}
              <button type="submit" disabled={busy || pricing} className="btn-primary mt-6 w-full">
                {busy ? 'Placing your order…' : 'Continue to payment'}
              </button>
              <p className="mt-4 flex items-center justify-center gap-2 text-xs text-stone"><Lock size={13} /> Your order is confirmed after payment is verified.</p>
            </div>
          </aside>
        </Form>
      </div>
    </>
  );
}
