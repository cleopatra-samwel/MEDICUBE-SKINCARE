import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert, App, Button, Card, Descriptions, Input, Modal, Steps, Table, Timeline } from 'antd';
import { ArrowLeft } from 'lucide-react';
import AdminPage from '@/components/admin/AdminPage';
import PageLoader from '@/components/ui/PageLoader';
import ErrorState from '@/components/ui/ErrorState';
import StatusTag from '@/components/ui/StatusTag';
import SmartImage from '@/components/ui/SmartImage';
import { adminService } from '@/services/adminService';
import { useAsync } from '@/hooks/useAsync';
import { formatDateTime, formatPrice, humanize } from '@/utils/format';

const PIPELINE = ['PENDING', 'CONFIRMED', 'PROCESSING', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED'];
const ACTION_LABELS = {
  CONFIRMED: 'Confirm order', PROCESSING: 'Start processing', READY_FOR_DELIVERY: 'Mark ready for delivery',
  OUT_FOR_DELIVERY: 'Send out for delivery', DELIVERED: 'Mark delivered', CANCELLED: 'Cancel order',
};

export default function OrderDetail() {
  const { orderNumber } = useParams();
  const { message } = App.useApp();
  const { data: order, loading, error, reload } = useAsync(() => adminService.order(orderNumber), [orderNumber]);
  const [pending, setPending] = useState(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading) return <PageLoader full={false} />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const apply = async () => {
    setBusy(true);
    try {
      await adminService.updateOrderStatus(order.order_number, pending, note || undefined);
      message.success(`Order moved to ${humanize(pending).toLowerCase()}.`);
      setPending(null);
      setNote('');
      reload();
    } catch (e) { message.error(e.message); } finally { setBusy(false); }
  };
  const verify = async (p) => {
    try { await adminService.verifyPayment(p.id); message.success('Checked with the provider.'); reload(); } catch (e) { message.error(e.message); }
  };

  const unpaid = !['PAID', 'REFUNDED'].includes(order.payment_status);
  const current = order.status === 'CANCELLED' ? -1 : PIPELINE.indexOf(order.status);
  const transitions = order.allowed_transitions || [];

  return (
    <AdminPage title={`Order ${order.order_number}`} subtitle={`Placed ${formatDateTime(order.created_at)}`}
      extra={<Link to="/admin/orders"><Button icon={<ArrowLeft size={15} />}>All orders</Button></Link>}>
      <Card>
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <StatusTag status={order.status} /><StatusTag status={order.payment_status} />
          {order.is_guest && <span className="rounded-full bg-petal px-2.5 py-0.5 text-xs text-rosewood">Guest checkout</span>}
        </div>
        {order.status === 'CANCELLED' ? <Alert type="error" message="This order was cancelled. Reserved stock has been returned." /> : (
          <Steps size="small" current={current} responsive items={PIPELINE.map((s) => ({ title: humanize(s) }))} />
        )}
        {transitions.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-6">
            {transitions.map((s) => {
              const blocked = unpaid && ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(s);
              return (
                <Button key={s} type={s === 'CANCELLED' ? 'default' : 'primary'} danger={s === 'CANCELLED'} disabled={blocked}
                  title={blocked ? 'Payment must be confirmed first' : undefined} onClick={() => setPending(s)}>
                  {ACTION_LABELS[s] || humanize(s)}
                </Button>
              );
            })}
            {unpaid && transitions.some((s) => ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(s)) && <p className="w-full text-xs text-stone">Unpaid orders cannot be dispatched or delivered.</p>}
          </div>
        )}
      </Card>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card title="Items" styles={{ body: { padding: 0 } }}>
            <Table rowKey={(r) => `${r.product_id}-${r.sku}`} dataSource={order.items} pagination={false} scroll={{ x: 560 }}
              columns={[
                { title: 'Product', render: (_, i) => <div className="flex items-center gap-3"><SmartImage src={i.image} alt="" className="h-12 w-10 rounded-lg" /><div><p>{i.name}</p><p className="text-xs text-stone">{i.sku}</p></div></div> },
                { title: 'Price', dataIndex: 'unit_price', align: 'right', render: formatPrice },
                { title: 'Qty', dataIndex: 'quantity', align: 'right' },
                { title: 'Total', dataIndex: 'line_total', align: 'right', render: formatPrice },
              ]}
              summary={() => (
                <>
                  <Table.Summary.Row><Table.Summary.Cell index={0} colSpan={3} align="right">Subtotal</Table.Summary.Cell><Table.Summary.Cell index={1} align="right">{formatPrice(order.subtotal)}</Table.Summary.Cell></Table.Summary.Row>
                  <Table.Summary.Row><Table.Summary.Cell index={0} colSpan={3} align="right">Delivery</Table.Summary.Cell><Table.Summary.Cell index={1} align="right">{formatPrice(order.delivery_fee)}</Table.Summary.Cell></Table.Summary.Row>
                  <Table.Summary.Row><Table.Summary.Cell index={0} colSpan={3} align="right"><strong>Total</strong></Table.Summary.Cell><Table.Summary.Cell index={1} align="right"><strong>{formatPrice(order.total)}</strong></Table.Summary.Cell></Table.Summary.Row>
                </>
              )} />
          </Card>

          <Card title="Payments" styles={{ body: { padding: 0 } }}>
            <Table rowKey="id" dataSource={order.payments || []} pagination={false} locale={{ emptyText: 'No payment attempts yet.' }} scroll={{ x: 640 }}
              columns={[
                { title: 'Reference', dataIndex: 'reference' },
                { title: 'Method', dataIndex: 'method', render: humanize },
                { title: 'Amount', dataIndex: 'amount', align: 'right', render: formatPrice },
                { title: 'Status', dataIndex: 'status', render: (s) => <StatusTag status={s} /> },
                { title: 'Date', dataIndex: 'created_at', render: formatDateTime },
                { title: '', render: (_, p) => ['PENDING', 'PROCESSING'].includes(p.status) && <Button size="small" onClick={() => verify(p)}>Check status</Button> },
              ]} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card title={order.is_guest ? 'Guest customer' : 'Customer'}>
            <Descriptions column={1} size="small" items={[
              { key: 'n', label: 'Name', children: order.customer.name },
              { key: 'p', label: 'Phone', children: <a href={`tel:${order.customer.phone}`}>{order.customer.phone}</a> },
              { key: 'e', label: 'Email', children: order.customer.email || '—' },
              { key: 't', label: 'Account', children: order.is_guest ? 'Guest (no account)' : `Registered · #${order.customer.user_id}` },
            ]} />
          </Card>
          <Card title="Delivery">
            <Descriptions column={1} size="small" items={[
              { key: 'r', label: 'Region', children: order.delivery_address.region },
              { key: 'd', label: 'District', children: order.delivery_address.district },
              { key: 's', label: 'Street / area', children: order.delivery_address.street },
              { key: 'a', label: 'Address', children: order.delivery_address.address_line },
              { key: 'no', label: 'Notes', children: order.delivery_address.notes || '—' },
              { key: 'st', label: 'Delivery status', children: <StatusTag status={order.delivery?.status} /> },
              { key: 'ri', label: 'Rider', children: order.delivery?.rider_name ? `${order.delivery.rider_name} ${order.delivery.rider_phone || ''}` : '—' },
            ]} />
            <Link to={`/admin/deliveries?q=${order.order_number}`} className="mt-3 inline-block text-sm">Manage delivery</Link>
          </Card>
          <Card title="History">
            <Timeline items={(order.history || []).map((h) => ({
              color: h.to === 'CANCELLED' ? 'red' : '#8F4A55',
              children: <><p className="text-mauve">{h.from ? `${humanize(h.from)} → ` : ''}{humanize(h.to)}</p>{h.note && <p className="text-xs text-stone">{h.note}</p>}<p className="text-xs text-stone">{formatDateTime(h.at)}</p></>,
            }))} />
          </Card>
        </div>
      </div>

      <Modal open={!!pending} title={pending && (ACTION_LABELS[pending] || humanize(pending))} onCancel={() => setPending(null)} onOk={apply} confirmLoading={busy}
        okText="Update status" okButtonProps={{ danger: pending === 'CANCELLED' }}>
        <p className="text-stone">{pending === 'CANCELLED' ? 'Cancelling returns reserved stock to inventory. This cannot be undone.' : `Move ${order.order_number} to “${humanize(pending || '')}”.`}</p>
        <Input.TextArea className="mt-4" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Internal note (optional)" maxLength={255} />
      </Modal>
    </AdminPage>
  );
}
