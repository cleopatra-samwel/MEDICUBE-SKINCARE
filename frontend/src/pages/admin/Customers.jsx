import { useState } from 'react';
import { Link } from 'react-router-dom';
import { App, Button, Drawer, Input, Popconfirm, Select, Table, Tag } from 'antd';
import AdminPage from '@/components/admin/AdminPage';
import StatusTag from '@/components/ui/StatusTag';
import ErrorState from '@/components/ui/ErrorState';
import { adminService } from '@/services/adminService';
import { usePaginated } from '@/hooks/usePaginated';
import { formatDate, formatPrice } from '@/utils/format';

/** Registered customers only (guests have no account). Passwords and tokens are never sent to the admin UI. */
export default function Customers() {
  const { message } = App.useApp();
  const list = usePaginated(adminService.customers, { q: '', status: '' });
  const [detail, setDetail] = useState(null);

  const toggle = async (c) => {
    const status = c.status === 'active' ? 'suspended' : 'active';
    try {
      const res = await adminService.setCustomerStatus(c.id, status);
      list.patchRow((r) => r.id === c.id, (r) => ({ ...r, status }));
      message.success(res.message);
    } catch (e) { message.error(e.message); }
  };
  const open = async (c) => {
    setDetail({ loading: true, customer: c });
    try { setDetail({ loading: false, ...(await adminService.customer(c.id)) }); } catch (e) { message.error(e.message); setDetail(null); }
  };

  if (list.error) return <ErrorState error={list.error} onRetry={list.reload} />;

  return (
    <AdminPage title="Customers" subtitle="Registered customer accounts. Guest buyers appear on their orders.">
      <div className="mb-4 flex flex-wrap gap-3">
        <Input.Search allowClear placeholder="Name, email or phone" onSearch={(v) => list.setFilter('q', v)} className="w-full sm:!w-80" />
        <Select allowClear placeholder="Status" className="w-40" onChange={(v) => list.setFilter('status', v)} options={[{ value: 'active', label: 'Active' }, { value: 'suspended', label: 'Suspended' }]} />
      </div>
      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <Table rowKey="id" loading={list.loading} dataSource={list.rows} pagination={list.pagination} scroll={{ x: 900 }}
          columns={[
            { title: 'Name', dataIndex: 'name', render: (n, c) => <button type="button" className="font-semibold text-rosewood" onClick={() => open(c)}>{n}</button> },
            { title: 'Email', dataIndex: 'email' },
            { title: 'Phone', dataIndex: 'phone', render: (p) => p || '—' },
            { title: 'Orders', dataIndex: 'orders_count', align: 'right' },
            { title: 'Total spent', dataIndex: 'total_spent', align: 'right', render: formatPrice },
            { title: 'Registered', dataIndex: 'registered_at', render: formatDate },
            { title: 'Status', dataIndex: 'status', render: (s) => <StatusTag status={s} /> },
            { title: '', align: 'right', render: (_, c) => (
              <Popconfirm title={c.status === 'active' ? 'Suspend this customer? They will be signed out.' : 'Reactivate this customer?'} onConfirm={() => toggle(c)}>
                <Button size="small" danger={c.status === 'active'}>{c.status === 'active' ? 'Suspend' : 'Reactivate'}</Button>
              </Popconfirm>
            ) },
          ]} />
      </div>
      <Drawer open={!!detail} onClose={() => setDetail(null)} title={detail?.customer?.name} width="min(92vw, 520px)" loading={detail?.loading}>
        {detail?.customer && (
          <>
            <p className="text-stone">{detail.customer.email} · {detail.customer.phone || 'no phone'}</p>
            <p className="mt-1 text-sm text-stone">Customer since {formatDate(detail.customer.registered_at)} <Tag className="ml-2">{detail.customer.status}</Tag></p>
            <h3 className="mb-3 mt-8 font-display text-[1.5rem]">Recent orders</h3>
            <ul className="divide-y divide-line">
              {(Array.isArray(detail.orders) ? detail.orders : detail.orders?.data || []).map((o) => (
                <li key={o.order_number} className="flex items-center justify-between gap-3 py-3">
                  <Link to={`/admin/orders/${o.order_number}`}>{o.order_number}</Link>
                  <StatusTag status={o.status} />
                  <span className="tabular-nums">{formatPrice(o.total)}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </Drawer>
    </AdminPage>
  );
}
