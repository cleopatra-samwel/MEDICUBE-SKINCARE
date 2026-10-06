import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { App, Button, Input, Popconfirm, Select, Space, Switch, Table } from 'antd';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import AdminPage from '@/components/admin/AdminPage';
import SmartImage from '@/components/ui/SmartImage';
import ErrorState from '@/components/ui/ErrorState';
import { adminService } from '@/services/adminService';
import { useAsync } from '@/hooks/useAsync';
import { usePaginated } from '@/hooks/usePaginated';
import { PRODUCT_STATUSES } from '@/utils/constants';
import { formatPrice, humanize } from '@/utils/format';

const asList = (r) => (Array.isArray(r) ? r : r?.data || []);

export default function Products() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const categories = useAsync(() => adminService.categories().then(asList), []);
  const list = usePaginated(adminService.products, { q: '', status: '', category_id: '', low_stock: params.get('low_stock') ? 1 : '' });

  const setStatus = async (p, status) => {
    try {
      const updated = await adminService.setProductStatus(p.id, status);
      list.patchRow((r) => r.id === p.id, () => ({ ...p, ...updated }));
      message.success(`${p.name} is now ${humanize(status).toLowerCase()}.`);
    } catch (e) { message.error(e.message); }
  };
  const remove = async (p) => {
    try { await adminService.deleteProduct(p.id); message.success('Product deleted.'); list.reload(); } catch (e) { message.error(e.message); }
  };

  if (list.error) return <ErrorState error={list.error} onRetry={list.reload} />;

  return (
    <AdminPage title="Products" subtitle="Create, edit and manage stock and visibility."
      extra={<Button type="primary" icon={<Plus size={16} />} onClick={() => navigate('/admin/products/new')}>New product</Button>}>
      <div className="mb-4 flex flex-wrap gap-3">
        <Input.Search allowClear placeholder="Search name or SKU" onSearch={(v) => list.setFilter('q', v)} className="w-full sm:!w-72" />
        <Select allowClear placeholder="Status" className="w-40" value={list.filters.status || undefined} onChange={(v) => list.setFilter('status', v)}
          options={PRODUCT_STATUSES.map((s) => ({ value: s, label: humanize(s) }))} />
        <Select allowClear placeholder="Category" className="w-48" value={list.filters.category_id || undefined} onChange={(v) => list.setFilter('category_id', v)}
          options={(categories.data || []).map((c) => ({ value: c.id, label: c.name }))} />
        <label className="flex items-center gap-2 text-sm text-stone">
          <Switch size="small" checked={!!list.filters.low_stock} onChange={(on) => list.setFilter('low_stock', on ? 1 : '')} /> Low stock only
        </label>
      </div>
      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <Table rowKey="id" loading={list.loading} dataSource={list.rows} pagination={list.pagination} scroll={{ x: 960 }}
          columns={[
            { title: 'Product', render: (_, p) => (
              <div className="flex items-center gap-3">
                <SmartImage src={p.image} alt="" className="h-12 w-10 shrink-0 rounded-lg" />
                <div className="min-w-0">
                  <Link to={`/admin/products/${p.id}/edit`} className="font-semibold">{p.name}</Link>
                  <p className="text-xs text-stone">{p.sku}</p>
                </div>
              </div>
            ) },
            { title: 'Category', render: (_, p) => p.category?.name || '—' },
            { title: 'Price', dataIndex: 'price', align: 'right', render: formatPrice },
            { title: 'Stock', dataIndex: 'stock', align: 'right', render: (s, p) => <span className={s === 0 ? 'text-[#A8434F]' : s <= p.low_stock_threshold ? 'text-[#9A6A2A]' : ''}>{s}</span> },
            { title: 'Sold', dataIndex: 'sold_count', align: 'right' },
            { title: 'Status', render: (_, p) => (
              <Select size="small" value={p.status} onChange={(v) => setStatus(p, v)} className="w-36" variant="filled"
                options={PRODUCT_STATUSES.map((s) => ({ value: s, label: humanize(s) }))} />
            ) },
            { title: '', align: 'right', width: 100, render: (_, p) => (
              <Space>
                <Button type="text" icon={<Pencil size={15} />} onClick={() => navigate(`/admin/products/${p.id}/edit`)} aria-label="Edit" />
                <Popconfirm title="Delete this product?" description="Products that appear in orders can only be deactivated." onConfirm={() => remove(p)} okText="Delete" okButtonProps={{ danger: true }}>
                  <Button type="text" danger icon={<Trash2 size={15} />} aria-label="Delete" />
                </Popconfirm>
              </Space>
            ) },
          ]} />
      </div>
    </AdminPage>
  );
}
