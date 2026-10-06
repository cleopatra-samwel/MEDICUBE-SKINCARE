import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { App, Button, Input, Modal, Select, Space, Table } from 'antd';
import AdminPage from '@/components/admin/AdminPage';
import StatusTag from '@/components/ui/StatusTag';
import ErrorState from '@/components/ui/ErrorState';
import { adminService } from '@/services/adminService';
import { usePaginated } from '@/hooks/usePaginated';
import { PAYMENT_STATUSES } from '@/utils/constants';
import { formatDateTime, formatPrice, humanize } from '@/utils/format';

export default function Payments() {
  const { message } = App.useApp();
  const isSuper = useSelector((s) => s.auth.user?.role === 'super_admin');
  const list = usePaginated(adminService.payments, { q: '', status: '', method: '' });
  const [refunding, setRefunding] = useState(null);
  const [reason, setReason] = useState('');

  const verify = async (p) => {
    try {
      const updated = await adminService.verifyPayment(p.id);
      list.patchRow((r) => r.id === p.id, () => updated);
      message.info(`Provider status: ${humanize(updated.status)}.`);
    } catch (e) { message.error(e.message); }
  };
  const refund = async () => {
    try {
      const updated = await adminService.refundPayment(refunding.id, reason);
      list.patchRow((r) => r.id === refunding.id, () => updated);
      message.success('Refund recorded.');
      setRefunding(null); setReason('');
    } catch (e) { message.error(e.errors?.reason?.[0] || e.message); }
  };

  if (list.error) return <ErrorState error={list.error} onRetry={list.reload} />;

  return (
    <AdminPage title="Payments" subtitle="Payments become PAID only through a verified provider callback. Nothing here can mark a payment as paid by hand.">
      <div className="mb-4 flex flex-wrap gap-3">
        <Input.Search allowClear placeholder="Reference or order number" onSearch={(v) => list.setFilter('q', v)} className="w-full sm:!w-80" />
        <Select allowClear placeholder="Status" className="w-40" onChange={(v) => list.setFilter('status', v)} options={PAYMENT_STATUSES.map((s) => ({ value: s, label: humanize(s) }))} />
        <Select allowClear placeholder="Method" className="w-44" onChange={(v) => list.setFilter('method', v)} options={['mobile_money', 'card', 'bank'].map((m) => ({ value: m, label: humanize(m) }))} />
      </div>
      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <Table rowKey="id" loading={list.loading} dataSource={list.rows} pagination={list.pagination} scroll={{ x: 1000 }}
          columns={[
            { title: 'Reference', dataIndex: 'reference', render: (r, p) => <><p className="font-semibold">{r}</p><p className="text-xs text-stone">{p.gateway} {p.provider_reference ? `· ${p.provider_reference}` : ''}</p></> },
            { title: 'Order', render: (_, p) => p.order && <Link to={`/admin/orders/${p.order.order_number}`}>{p.order.order_number}</Link> },
            { title: 'Customer', render: (_, p) => p.order?.customer_name },
            { title: 'Method', dataIndex: 'method', render: humanize },
            { title: 'Amount', dataIndex: 'amount', align: 'right', render: formatPrice },
            { title: 'Status', dataIndex: 'status', render: (s, p) => <><StatusTag status={s} />{p.failure_reason && <p className="text-xs text-stone">{p.failure_reason}</p>}</> },
            { title: 'Date', dataIndex: 'created_at', render: formatDateTime },
            { title: '', align: 'right', render: (_, p) => (
              <Space>
                {['PENDING', 'PROCESSING'].includes(p.status) && <Button size="small" onClick={() => verify(p)}>Check status</Button>}
                {p.status === 'PAID' && isSuper && <Button size="small" danger onClick={() => setRefunding(p)}>Refund</Button>}
              </Space>
            ) },
          ]} />
      </div>
      <Modal open={!!refunding} title={`Refund ${refunding?.reference}`} onCancel={() => setRefunding(null)} onOk={refund} okText="Record refund" okButtonProps={{ danger: true, disabled: !reason.trim() }}>
        <p className="text-stone">Refund {formatPrice(refunding?.amount)} through the payment provider. Only super admins can do this.</p>
        <Input.TextArea className="mt-4" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (required)" maxLength={255} />
      </Modal>
    </AdminPage>
  );
}
