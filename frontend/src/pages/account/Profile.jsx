import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { App, Checkbox, Form, Input, Modal, Popconfirm, Select } from 'antd';
import { MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { selectUser, userUpdated } from '@/features/auth/authSlice';
import { accountService } from '@/services/accountService';
import { toFormErrors } from '@/services/api';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import StatusTag from '@/components/ui/StatusTag';
import { cleanPhone, formatDate, formatPrice, TZ_PHONE } from '@/utils/format';

const phoneRule = { validator: (_, v) => (!v || TZ_PHONE.test(cleanPhone(v)) ? Promise.resolve() : Promise.reject(new Error('Enter a Tanzanian number, e.g. 0712 345 678.'))) };
const asList = (r) => (Array.isArray(r) ? r : r?.data || []);

function Panel({ title, action, children }) {
  return (
    <section className="card p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="font-display text-[1.75rem]">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function PersonalInfo() {
  const dispatch = useDispatch();
  const { message } = App.useApp();
  const user = useSelector(selectUser);
  const [form] = Form.useForm();
  const [busy, setBusy] = useState(false);

  const save = async (values) => {
    setBusy(true);
    try {
      const updated = await accountService.updateProfile({ ...values, phone: values.phone ? cleanPhone(values.phone) : null });
      dispatch(userUpdated(updated));
      message.success('Profile updated.');
    } catch (e) {
      form.setFields(toFormErrors(e.errors));
      message.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel title="Personal information">
      <Form form={form} layout="vertical" requiredMark={false} initialValues={{ name: user.name, email: user.email, phone: user.phone }} onFinish={save}>
        <div className="grid gap-x-5 sm:grid-cols-2">
          <Form.Item name="name" label="Full name" rules={[{ required: true, message: 'Enter your name.' }]}><Input autoComplete="name" /></Form.Item>
          <Form.Item name="phone" label="Phone" rules={[phoneRule]}><Input inputMode="tel" autoComplete="tel" /></Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Enter a valid email.' }]} className="sm:col-span-2"><Input autoComplete="email" /></Form.Item>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-stone">Member since {formatDate(user.created_at)}</p>
          <button type="submit" disabled={busy} className="btn-primary btn-sm">{busy ? 'Saving…' : 'Save changes'}</button>
        </div>
      </Form>
    </Panel>
  );
}

function RecentOrders() {
  const { data, loading } = useAsync(() => accountService.orders(1), []);
  const orders = (data?.data || []).slice(0, 3);
  return (
    <Panel title="My orders" action={<Link to="/orders" className="text-sm text-rosewood link-underline">View all</Link>}>
      {loading ? <div className="skeleton h-20" /> : orders.length === 0 ? (
        <p className="text-stone">No orders yet. <Link to="/products" className="link-underline">Start shopping</Link></p>
      ) : (
        <ul className="divide-y divide-line">
          {orders.map((o) => (
            <li key={o.order_number}>
              <Link to={`/orders/${o.order_number}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3.5 hover:opacity-80">
                <span className="font-bold text-mauve">{o.order_number}</span>
                <span className="text-sm text-stone">{formatDate(o.created_at)}</span>
                <StatusTag status={o.status} />
                <span className="ml-auto tabular-nums">{formatPrice(o.total)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function Addresses() {
  const { message } = App.useApp();
  const regions = useSelector((s) => s.ui.shopConfig?.regions) || [];
  const { data, loading, reload } = useAsync(() => accountService.addresses().then(asList), []);
  const [editing, setEditing] = useState(null); // null | 'new' | address
  const [form] = Form.useForm();
  const [busy, setBusy] = useState(false);

  const open = (addr) => {
    setEditing(addr);
    form.resetFields();
    if (addr !== 'new') form.setFieldsValue(addr);
  };
  const save = async (values) => {
    setBusy(true);
    try {
      const payload = { ...values, phone: cleanPhone(values.phone) };
      if (editing === 'new') await accountService.createAddress(payload);
      else await accountService.updateAddress(editing.id, payload);
      message.success('Address saved.');
      setEditing(null);
      reload();
    } catch (e) {
      form.setFields(toFormErrors(e.errors));
    } finally {
      setBusy(false);
    }
  };
  const remove = async (id) => {
    try { await accountService.deleteAddress(id); message.success('Address removed.'); reload(); } catch (e) { message.error(e.message); }
  };

  return (
    <Panel title="Saved addresses" action={<button type="button" onClick={() => open('new')} className="btn-outline btn-sm"><Plus size={15} /> Add address</button>}>
      {loading ? <div className="skeleton h-24" /> : !data?.length ? (
        <p className="text-stone">No saved addresses yet. Add one here, or tick “Save this address” at checkout.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {data.map((a) => (
            <li key={a.id} className="rounded-xl border border-line p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="flex items-center gap-2 font-semibold text-mauve"><MapPin size={15} className="text-rosewood" /> {a.label || 'Address'}</p>
                {a.is_default && <span className="rounded-full bg-petal px-2.5 py-0.5 text-xs text-rosewood">Default</span>}
              </div>
              <p className="mt-2 text-sm text-stone">{a.full_name} · {a.phone}<br />{a.street}, {a.district}, {a.region}<br />{a.address_line}</p>
              <div className="mt-4 flex gap-4 text-sm">
                <button type="button" onClick={() => open(a)} className="inline-flex items-center gap-1.5 text-mauve hover:text-rosewood"><Pencil size={14} /> Edit</button>
                <Popconfirm title="Remove this address?" onConfirm={() => remove(a.id)} okText="Remove">
                  <button type="button" className="inline-flex items-center gap-1.5 text-stone hover:text-rose-700"><Trash2 size={14} /> Remove</button>
                </Popconfirm>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Modal open={!!editing} onCancel={() => setEditing(null)} title={editing === 'new' ? 'Add address' : 'Edit address'} onOk={() => form.submit()} okText="Save" confirmLoading={busy} destroyOnClose>
        <Form form={form} layout="vertical" requiredMark={false} onFinish={save} className="mt-4">
          <div className="grid gap-x-4 sm:grid-cols-2">
            <Form.Item name="label" label="Label (optional)"><Input placeholder="Home, Office…" /></Form.Item>
            <Form.Item name="full_name" label="Full name" rules={[{ required: true, message: 'Required.' }]}><Input /></Form.Item>
            <Form.Item name="phone" label="Phone" rules={[{ required: true, message: 'Required.' }, phoneRule]}><Input inputMode="tel" /></Form.Item>
            <Form.Item name="region" label="Region" rules={[{ required: true, message: 'Required.' }]}><Select showSearch options={regions.map((r) => ({ value: r, label: r }))} /></Form.Item>
            <Form.Item name="district" label="District" rules={[{ required: true, message: 'Required.' }]}><Input /></Form.Item>
            <Form.Item name="street" label="Street / Area" rules={[{ required: true, message: 'Required.' }]}><Input /></Form.Item>
          </div>
          <Form.Item name="address_line" label="Detailed address" rules={[{ required: true, message: 'Required.' }]}><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="notes" label="Notes (optional)"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="is_default" valuePropName="checked"><Checkbox>Use as my default address</Checkbox></Form.Item>
        </Form>
      </Modal>
    </Panel>
  );
}

function ChangePassword() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [busy, setBusy] = useState(false);
  const save = async (values) => {
    setBusy(true);
    try {
      await accountService.changePassword(values);
      message.success('Password updated.');
      form.resetFields();
    } catch (e) {
      form.setFields(toFormErrors(e.errors));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Panel title="Change password">
      <Form form={form} layout="vertical" requiredMark={false} onFinish={save} className="max-w-md">
        <Form.Item name="current_password" label="Current password" rules={[{ required: true, message: 'Required.' }]}><Input.Password autoComplete="current-password" /></Form.Item>
        <Form.Item name="password" label="New password" rules={[{ required: true, min: 8, message: 'At least 8 characters with letters and numbers.' }]}><Input.Password autoComplete="new-password" /></Form.Item>
        <Form.Item name="password_confirmation" label="Confirm new password" dependencies={['password']}
          rules={[{ required: true, message: 'Required.' }, ({ getFieldValue }) => ({ validator: (_, v) => (!v || v === getFieldValue('password') ? Promise.resolve() : Promise.reject(new Error('Passwords do not match.'))) })]}>
          <Input.Password autoComplete="new-password" />
        </Form.Item>
        <button type="submit" disabled={busy} className="btn-primary btn-sm">{busy ? 'Updating…' : 'Update password'}</button>
      </Form>
    </Panel>
  );
}

export default function Profile() {
  useDocumentTitle('My profile');
  return (
    <div className="space-y-6">
      <PersonalInfo />
      <RecentOrders />
      <Addresses />
      <Panel title="Wishlist" action={<Link to="/wishlist" className="text-sm text-rosewood link-underline">Open wishlist</Link>}>
        <p className="text-stone">Tap the heart on any product to save it for later.</p>
      </Panel>
      <ChangePassword />
    </div>
  );
}
