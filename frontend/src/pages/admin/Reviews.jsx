import { Link } from 'react-router-dom';
import { App, Button, Popconfirm, Segmented, Space, Table } from 'antd';
import AdminPage from '@/components/admin/AdminPage';
import StatusTag from '@/components/ui/StatusTag';
import RatingStars from '@/components/ui/RatingStars';
import ErrorState from '@/components/ui/ErrorState';
import { adminService } from '@/services/adminService';
import { usePaginated } from '@/hooks/usePaginated';
import { formatDate } from '@/utils/format';

export default function Reviews() {
  const { message } = App.useApp();
  const list = usePaginated(adminService.reviews, { status: 'PENDING' });

  const setStatus = async (r, status) => {
    try {
      await adminService.setReviewStatus(r.id, status);
      message.success(status === 'APPROVED' ? 'Review published.' : 'Review hidden.');
      list.reload();
    } catch (e) { message.error(e.message); }
  };
  const remove = async (r) => {
    try { await adminService.deleteReview(r.id); message.success('Review deleted.'); list.reload(); } catch (e) { message.error(e.message); }
  };

  if (list.error) return <ErrorState error={list.error} onRetry={list.reload} />;

  return (
    <AdminPage title="Reviews" subtitle="Every review is moderated before it appears on the store.">
      <Segmented className="mb-4" value={list.filters.status} onChange={(v) => list.setFilter('status', v)}
        options={[{ value: 'PENDING', label: 'Pending' }, { value: 'APPROVED', label: 'Approved' }, { value: 'REJECTED', label: 'Rejected' }, { value: '', label: 'All' }]} />
      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <Table rowKey="id" loading={list.loading} dataSource={list.rows} pagination={list.pagination} scroll={{ x: 960 }}
          columns={[
            { title: 'Review', width: 420, render: (_, r) => (
              <div>
                <RatingStars value={r.rating} />
                {r.title && <p className="mt-1 font-semibold text-mauve">{r.title}</p>}
                <p className="text-sm text-charcoal/80">{r.body}</p>
              </div>
            ) },
            { title: 'Product', render: (_, r) => r.product && <Link to={`/products/${r.product.slug}`} target="_blank">{r.product.name}</Link> },
            { title: 'By', render: (_, r) => <>{r.name}{r.is_verified_purchase && <p className="text-xs text-[#4F7A5B]">Verified buyer</p>}</> },
            { title: 'Date', dataIndex: 'created_at', render: formatDate },
            { title: 'Status', dataIndex: 'status', render: (s) => <StatusTag status={s} /> },
            { title: '', align: 'right', render: (_, r) => (
              <Space wrap>
                {r.status !== 'APPROVED' && <Button size="small" type="primary" onClick={() => setStatus(r, 'APPROVED')}>Approve</Button>}
                {r.status !== 'REJECTED' && <Button size="small" onClick={() => setStatus(r, 'REJECTED')}>Reject</Button>}
                <Popconfirm title="Delete permanently?" onConfirm={() => remove(r)}><Button size="small" danger type="text">Delete</Button></Popconfirm>
              </Space>
            ) },
          ]} />
      </div>
    </AdminPage>
  );
}
