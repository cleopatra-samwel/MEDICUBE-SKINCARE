import { Link } from 'react-router-dom';
import { DatePicker, Input, Select, Table } from 'antd';
import AdminPage from '@/components/admin/AdminPage';
import StatusTag from '@/components/ui/StatusTag';
import ErrorState from '@/components/ui/ErrorState';
import { adminService } from '@/services/adminService';
import { usePaginated } from '@/hooks/usePaginated';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '@/utils/constants';
import { formatDateTime, formatPrice, humanize } from '@/utils/format';

export default function Orders() {
  const list = usePaginated(adminService.orders, { q: '', status: '', payment_status: '', customer_type: '', from: '', to: '' });
  if (list.error) return <ErrorState error={list.error} onRetry={list.reload} />;

  return (
    <AdminPage title="Orders" subtitle="Search, filter and open any order to update its status.">
      <div className="mb-4 flex flex-wrap gap-3">
        <Input.Search allowClear placeholder="Order no., name, phone or email" onSearch={(v) => list.setFilter('q', v)} className="w-full sm:!w-80" />
        <Select allowClear placeholder="Order status" className="w-48" onChange={(v) => list.setFilter('status', v)} options={ORDER_STATUSES.map((s) => ({ value: s, label: humanize(s) }))} />
        <Select allowClear placeholder="Payment" className="w-40" onChange={(v) => list.setFilter('payment_status', v)} options={PAYMENT_STATUSES.map((s) => ({ value: s, label: humanize(s) }))} />
        <Select allowClear placeholder="Customer type" className="w-40" onChange={(v) => list.setFilter('customer_type', v)} options={[{ value: 'guest', label: 'Guest' }, { value: 'registered', label: 'Registered' }]} />
        <DatePicker.RangePicker onChange={(r) => { list.setFilter('from', r?.[0]?.format('YYYY-MM-DD') || ''); list.setFilter('to', r?.[1]?.format('YYYY-MM-DD') || ''); }} />
      </div>
      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <Table rowKey="order_number" loading={list.loading} dataSource={list.rows} pagination={list.pagination} scroll={{ x: 1000 }}
          columns={[
            { title: 'Order', dataIndex: 'order_number', render: (n) => <Link to={`/admin/orders/${n}`} className="font-bold">{n}</Link> },
            { title: 'Date', dataIndex: 'created_at', render: formatDateTime },
            { title: 'Customer', render: (_, o) => (
              <div><p>{o.customer.name} {o.is_guest && <span className="ml-1 rounded bg-petal px-1.5 text-[13px] text-rosewood">Guest</span>}</p><p className="text-xs text-stone">{o.customer.phone}</p></div>
            ) },
            { title: 'Region', render: (_, o) => o.delivery_address.region },
            { title: 'Items', dataIndex: 'items_count', align: 'right' },
            { title: 'Total', dataIndex: 'total', align: 'right', render: formatPrice },
            { title: 'Payment', dataIndex: 'payment_status', render: (s) => <StatusTag status={s} /> },
            { title: 'Status', dataIndex: 'status', render: (s) => <StatusTag status={s} /> },
          ]} />
      </div>
    </AdminPage>
  );
}
