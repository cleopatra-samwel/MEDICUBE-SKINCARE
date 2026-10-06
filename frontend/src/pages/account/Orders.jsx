import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pagination } from 'antd';
import { Package } from 'lucide-react';
import { accountService } from '@/services/accountService';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import StatusTag from '@/components/ui/StatusTag';
import SmartImage from '@/components/ui/SmartImage';
import { formatDate, formatPrice } from '@/utils/format';

export default function Orders() {
  useDocumentTitle('My orders');
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useAsync(() => accountService.orders(page), [page]);
  const orders = data?.data || [];

  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (!loading && !orders.length) return <EmptyState icon={Package} title="No orders yet" text="When you place an order while signed in, it will appear here." action="Shop products" to="/products" />;

  return (
    <div>
      <h2 className="mb-6 font-display text-[2.125rem]">My orders</h2>
      <ul className="space-y-4">
        {loading ? [0, 1, 2].map((i) => <li key={i} className="skeleton h-28" />) : orders.map((o) => (
          <li key={o.order_number}>
            <Link to={`/orders/${o.order_number}`} className="card flex flex-col gap-4 p-5 transition hover:shadow-soft sm:flex-row sm:items-center">
              <div className="flex -space-x-3">
                {(o.items || []).slice(0, 3).map((it) => <SmartImage key={it.product_id ?? it.name} src={it.image} alt="" className="h-16 w-14 rounded-lg ring-2 ring-white" />)}
              </div>
              <div className="flex-1">
                <p className="font-bold text-mauve">{o.order_number}</p>
                <p className="text-sm text-stone">{formatDate(o.created_at)} · {o.items_count} {o.items_count === 1 ? 'item' : 'items'}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2"><StatusTag status={o.status} /><StatusTag status={o.payment_status} /></div>
              <p className="font-bold tabular-nums sm:w-32 sm:text-right">{formatPrice(o.total)}</p>
            </Link>
          </li>
        ))}
      </ul>
      {data?.meta?.last_page > 1 && <div className="mt-8 flex justify-center"><Pagination current={page} total={data.meta.total} pageSize={data.meta.per_page} onChange={setPage} showSizeChanger={false} /></div>}
    </div>
  );
}
