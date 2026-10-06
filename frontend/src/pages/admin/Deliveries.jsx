import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { App, Button, DatePicker, Form, Input, Modal, Select, Table } from 'antd';
import dayjs from 'dayjs';
import AdminPage from '@/components/admin/AdminPage';
import StatusTag from '@/components/ui/StatusTag';
import ErrorState from '@/components/ui/ErrorState';
import { adminService } from '@/services/adminService';
import { usePaginated } from '@/hooks/usePaginated';
import { DELIVERY_STATUSES } from '@/utils/constants';
import { formatPrice, humanize } from '@/utils/format';

export default function Deliveries() {
  const { message } = App.useApp();
  const [params] = useSearchParams();
  const list = usePaginated(adminService.deliveries, { q: params.get('q') || '', status: '' });
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [form] = Form.useForm();

  const open = (d) => {
    setEditing(d);
    form.setFieldsValue({ status: d.status, rider_name: d.rider_name, rider_phone: d.rider_phone, notes: d.delivery_notes, scheduled_for: d.scheduled_for ? dayjs(d.scheduled_for) : null });
  };
  const save = async (values) => {
    setBusy(true);
    try {
      const updated = await adminService.updateDelivery(editing.id, { ...values, scheduled_for: values.scheduled_for?.format('YYYY-MM-DD') || null });
      list.patchRow((r) => r.id === editing.id, () => updated);
      message.success('Delivery updated.');
      setEditing(null);
    } catch (e) { message.error(e.message); } finally { setBusy(false); }
  };

  if (list.error) return <ErrorState error={list.error} onRetry={list.reload} />;

  return (
    <AdminPage title="Deliveries" subtitle="Assign riders and move parcels to the customer. Order status updates automatically.">
      <div className="mb-4 flex flex-wrap gap-3">
        <Input.Search allowClear defaultValue={params.get('q') || ''} placeholder="Order no., customer or phone" onSearch={(v) => list.setFilter('q', v)} className="w-full sm:!w-80" />
        <Select allowClear placeholder="Delivery status" className="w-52" onChange={(v) => list.setFilter('status', v)} options={DELIVERY_STATUSES.map((s) => ({ value: s, label: humanize(s) }))} />
      </div>
      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <Table rowKey="id" loading={list.loading} dataSource={list.rows} pagination={list.pagination} scroll={{ x: 1100 }}
          columns={[
            { title: 'Order', dataIndex: 'order_number', render: (n) => <Link to={`/admin/orders/${n}`} className="font-bold">{n}</Link> },
            { title: 'Customer', dataIndex: 'customer' },
            { title: 'Phone', dataIndex: 'phone', render: (p) => <a href={`tel:${p}`}>{p}</a> },
            { title: 'Location', dataIndex: 'location' },
            { title: 'Address', dataIndex: 'address', width: 240, ellipsis: true },
            { title: 'Amount', dataIndex: 'amount', align: 'right', render: formatPrice },
            { title: 'Payment', dataIndex: 'payment_status', render: (s) => <StatusTag status={s} /> },
            { title: 'Delivery', dataIndex: 'status', render: (s, d) => <><StatusTag status={s} />{d.rider_name && <p className="text-xs text-stone">{d.rider_name}</p>}</> },
            { title: '', align: 'right', render: (_, d) => <Button size="small" onClick={() => open(d)}>Update</Button> },
          ]} />
      </div>
      <Modal open={!!editing} title={`Delivery · ${editing?.order_number}`} onCancel={() => setEditing(null)} onOk={() => form.submit()} okText="Save" confirmLoading={busy} destroyOnClose>
        <p className="text-sm text-stone">{editing?.customer} · {editing?.location}<br />{editing?.address}</p>
        {editing && editing.payment_status !== 'PAID' && <p className="mt-2 text-xs text-[#9A6A2A]">Payment not confirmed yet: this order cannot go out for delivery.</p>}
        <Form form={form} layout="vertical" onFinish={save} className="mt-4">
          <Form.Item name="status" label="Delivery status"><Select options={DELIVERY_STATUSES.map((s) => ({ value: s, label: humanize(s) }))} /></Form.Item>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="rider_name" label="Rider name"><Input /></Form.Item>
            <Form.Item name="rider_phone" label="Rider phone"><Input /></Form.Item>
          </div>
          <Form.Item name="scheduled_for" label="Scheduled date"><DatePicker className="!w-full" /></Form.Item>
          <Form.Item name="notes" label="Internal notes"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </AdminPage>
  );
}
