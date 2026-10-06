import { Link } from 'react-router-dom';
import { Card, Table } from 'antd';
import { AlertTriangle, CheckCircle2, Clock, Coins, Package, ShoppingCart, Users } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import AdminPage from '@/components/admin/AdminPage';
import StatCard from '@/components/admin/StatCard';
import StatusTag from '@/components/ui/StatusTag';
import ErrorState from '@/components/ui/ErrorState';
import { adminService } from '@/services/adminService';
import { useAsync } from '@/hooks/useAsync';
import { formatDate, formatPrice } from '@/utils/format';

export const compactTsh = (v) => (v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `${Math.round(v / 1e3)}k` : v);

export default function Dashboard() {
  const { data, loading, error, reload } = useAsync(() => adminService.dashboard(), []);
  if (error) return <ErrorState error={error} onRetry={reload} />;
  const s = data?.stats || {};
  const v = (x) => (loading ? '…' : x);

  return (
    <AdminPage title="Dashboard" subtitle="An overview of your store today.">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
        <StatCard label="Total products" value={v(s.total_products)} icon={Package} />
        <StatCard label="Total orders" value={v(s.total_orders)} icon={ShoppingCart} tone="mauve" />
        <StatCard label="Pending orders" value={v(s.pending_orders)} icon={Clock} tone="amber" />
        <StatCard label="Completed orders" value={v(s.completed_orders)} icon={CheckCircle2} tone="green" />
        <StatCard label="Total customers" value={v(s.total_customers)} icon={Users} tone="mauve" />
        <StatCard label="Total revenue" value={v(formatPrice(s.total_revenue))} icon={Coins} tone="green" hint="Paid orders only" />
        <StatCard label="Low stock" value={v(s.low_stock_products)} icon={AlertTriangle} tone="amber" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card title="Sales, last 14 days" className="xl:col-span-2" loading={loading}>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={data?.sales_chart || []} margin={{ left: 0, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#C98B91" stopOpacity={0.45} /><stop offset="100%" stopColor="#C98B91" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid stroke="#F1E6E3" vertical={false} />
                <XAxis dataKey="period" tickFormatter={(d) => formatDate(d, { day: 'numeric', month: 'short' })} tick={{ fontSize: 12, fill: '#7A6D70' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={compactTsh} tick={{ fontSize: 12, fill: '#7A6D70' }} axisLine={false} tickLine={false} width={48} />
                <Tooltip formatter={(val, name) => (name === 'revenue' ? [formatPrice(val), 'Revenue'] : [val, 'Orders'])} labelFormatter={(d) => formatDate(d)} />
                <Area type="monotone" dataKey="revenue" stroke="#8F4A55" strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Best-selling products" loading={loading}>
          <ol className="space-y-3">
            {(data?.best_sellers || []).map((p, i) => (
              <li key={p.product_id} className="flex items-center gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-petal text-xs font-medium text-rosewood">{i + 1}</span>
                <span className="flex-1 truncate text-mauve">{p.name}</span>
                <span className="text-sm text-stone">{p.quantity} sold</span>
              </li>
            ))}
            {!data?.best_sellers?.length && <p className="text-stone">No sales yet.</p>}
          </ol>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card title="Recent orders" className="xl:col-span-2" extra={<Link to="/admin/orders">View all</Link>} styles={{ body: { padding: 0 } }}>
          <Table rowKey="order_number" loading={loading} dataSource={data?.recent_orders || []} pagination={false} scroll={{ x: 640 }}
            columns={[
              { title: 'Order', dataIndex: 'order_number', render: (n) => <Link to={`/admin/orders/${n}`}>{n}</Link> },
              { title: 'Customer', render: (_, o) => <>{o.customer.name}{o.is_guest && <span className="ml-2 text-xs text-stone">Guest</span>}</> },
              { title: 'Total', dataIndex: 'total', align: 'right', render: formatPrice },
              { title: 'Payment', dataIndex: 'payment_status', render: (x) => <StatusTag status={x} /> },
              { title: 'Status', dataIndex: 'status', render: (x) => <StatusTag status={x} /> },
            ]} />
        </Card>
        <Card title="Low-stock products" extra={<Link to="/admin/products?low_stock=1">Manage</Link>} loading={loading}>
          <ul className="divide-y divide-line">
            {(data?.low_stock || []).map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                <Link to={`/admin/products/${p.id}/edit`} className="truncate text-mauve">{p.name}</Link>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs ${p.stock === 0 ? 'bg-[#F6E1E3] text-[#A8434F]' : 'bg-[#F8EEDF] text-[#9A6A2A]'}`}>{p.stock} left</span>
              </li>
            ))}
            {!data?.low_stock?.length && <p className="text-stone">Stock levels look healthy.</p>}
          </ul>
        </Card>
      </div>
    </AdminPage>
  );
}
