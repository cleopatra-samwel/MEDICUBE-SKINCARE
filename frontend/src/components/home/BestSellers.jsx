import { catalogService } from '@/services/catalogService';
import { useAsync } from '@/hooks/useAsync';
import SectionHeading from '@/components/ui/SectionHeading';
import ProductGrid from '@/components/product/ProductGrid';
import ErrorState from '@/components/ui/ErrorState';

export default function BestSellers() {
  const { data, loading, error, reload } = useAsync(() => catalogService.products({ sort: 'popular', per_page: 8 }), []);
  return (
    <section className="section bg-white">
      <div className="shell">
        <SectionHeading title="Best sellers" lede="The formulas our customers reorder most, loved for how skin feels after a week." link="/products?sort=popular" />
        {error ? <ErrorState error={error} onRetry={reload} /> : <ProductGrid products={data?.data} loading={loading} />}
      </div>
    </section>
  );
}
