import { useState } from 'react';
import { Card, Segmented, Table } from 'antd';
import { Coins, Receipt, ShoppingCart, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import AdminPage from '@/components/admin/AdminPage';
import StatCard from '@/components/admin/StatCard';
import ErrorState from '@/components/ui/ErrorState';
import StatusTag from '@/components/ui/StatusTag';
import { adminService } from '@/services/adminService';
import { useAsync } from '@/hooks/useAsync';
import { formatDate, formatPrice } from '@/utils/format';
import { compactTsh } from './Dashboard';

const axis = { tick: { fontSize: 12, fill: '#7A6D70' }, axisLine: false, tickLine: false };
const LABELS = {
  daily: (d) => formatDate(d, { day: 'numeric', month: 'short' }),
  weekly: (d) => `Wk ${formatDate(d, { day: 'numeric', month: 'short' })}`,
  monthly: (d) => formatDate(d, { month: 'short', year: '2-digit' }),
};

export default function Analytics() {
  const { data, loading, error, reload } = useAsync(() => adminService.analytics(), []);
  const [range, setRange] = useState('daily');
  if (error) return <ErrorState error={error} onRetry={reload} />;
  const t = data?.totals || {};
  const series = data?.[range] || [];
  const v = (x) => (loading ? '…' : x);

  return (
    <AdminPage title="Analytics" subtitle="Revenue counts paid orders only.">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total revenue" value={v(formatPrice(t.revenue))} icon={Coins} tone="green" />
        <StatCard label="Revenue this month" value={v(formatPrice(t.revenue_this_month))} icon={TrendingUp} />
        <StatCard label="Total orders" value={v(t.orders)} icon={ShoppingCart} tone="mauve" />
        <StatCard label="Average order value" value={v(formatPrice(t.average_order_value))} icon={Receipt} tone="amber" />
      </div>

      <Card className="mt-6" loading={loading} title="Sales"
        extra={<Segmented size="small" value={range} onChange={setRange} options={[{ value: 'daily', label: 'Daily' }, { value: 'weekly', label: 'Weekly' }, { value: 'monthly', label: 'Monthly' }]} />}>
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-sm text-stone">Revenue</p>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={series}>
                  <CartesianGrid stroke="#F1E6E3" vertical={false} />
                  <XAxis dataKey="period" tickFormatter={LABELS[range]} {...axis} />
                  <YAxis tickFormatter={compactTsh} width={48} {...axis} />
                  <Tooltip formatter={(val) => [formatPrice(val), 'Revenue']} labelFormatter={(d) => formatDate(d)} cursor={{ fill: '#FBF6F4' }} />
                  <Bar dataKey="revenue" fill="#C98B91" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm text-stone">Orders</p>
            <div className="h-64">
              <ResponsiveContainer>
                <LineChart data={series}>
                  <CartesianGrid stroke="#F1E6E3" vertical={false} />
                  <XAxis dataKey="period" tickFormatter={LABELS[range]} {...axis} />
                  <YAxis allowDecimals={false} width={32} {...axis} />
                  <Tooltip formatter={(val) => [val, 'Orders']} labelFormatter={(d) => formatDate(d)} />
                  <Line type="monotone" dataKey="orders" stroke="#8F4A55" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card title="Best-selling products" loading={loading} styles={{ body: { padding: 0 } }}>
          <Table rowKey="product_id" dataSource={data?.best_sellers || []} pagination={false} size="middle"
            columns={[
              { title: '#', render: (_, __, i) => i + 1, width: 48 },
              { title: 'Product', dataIndex: 'name' },
              { title: 'Units', dataIndex: 'quantity', align: 'right' },
              { title: 'Revenue', dataIndex: 'revenue', align: 'right', render: formatPrice },
            ]} />
        </Card>
        <Card title="Customer growth (new accounts per month)" loading={loading}>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={data?.customer_growth || []}>
                <CartesianGrid stroke="#F1E6E3" vertical={false} />
                <XAxis dataKey="period" {...axis} />
                <YAxis allowDecimals={false} width={32} {...axis} />
                <Tooltip formatter={(val) => [val, 'New customers']} cursor={{ fill: '#FBF6F4' }} />
                <Bar dataKey="customers" fill="#8F4A55" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Low-stock products" loading={loading} styles={{ body: { padding: 0 } }}>
          <Table rowKey="id" dataSource={Array.isArray(data?.low_stock) ? data.low_stock : data?.low_stock?.data || []} pagination={false} size="middle"
            locale={{ emptyText: 'Stock levels look healthy.' }}
            columns={[
              { title: 'Product', dataIndex: 'name' },
              { title: 'SKU', dataIndex: 'sku' },
              { title: 'Stock', dataIndex: 'stock', align: 'right' },
              { title: 'Status', dataIndex: 'status', render: (s) => <StatusTag status={s} /> },
            ]} />
        </Card>
        <Card title="Orders by status" loading={loading}>
          <ul className="divide-y divide-line">
            {Object.entries(data?.orders_by_status || {}).map(([s, n]) => (
              <li key={s} className="flex items-center justify-between py-2.5"><StatusTag status={s} /><span className="tabular-nums">{n}</span></li>
            ))}
          </ul>
        </Card>
      </div>
    </AdminPage>
  );
}
