import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Drawer, Pagination, Select } from 'antd';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import ProductGrid from '@/components/product/ProductGrid';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import { catalogService } from '@/services/catalogService';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { PRODUCT_SORTS } from '@/utils/constants';
import { formatPrice } from '@/utils/format';

const PRICE_RANGES = [
  { key: 'u30', label: `Under ${formatPrice(30000)}`, max: 29999 },
  { key: '30-50', label: `${formatPrice(30000)} – ${formatPrice(50000)}`, min: 30000, max: 50000 },
  { key: 'o50', label: `Over ${formatPrice(50000)}`, min: 50001 },
];
const FILTER_KEYS = ['q', 'category', 'min_price', 'max_price', 'availability', 'sort'];
const asList = (r) => (Array.isArray(r) ? r : r?.data || []);

/** All filters live in the URL, so results are shareable and survive refresh/back. */
export default function Products() {
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [term, setTerm] = useState(params.get('q') || '');
  const query = useMemo(() => {
    const q = Object.fromEntries(FILTER_KEYS.filter((k) => params.get(k)).map((k) => [k, params.get(k)]));
    return { ...q, page: params.get('page') || 1, per_page: 12 };
  }, [params]);

  const categories = useAsync(() => catalogService.categories().then(asList), []);
  const { data, loading, error, reload } = useAsync(() => catalogService.products(query), [JSON.stringify(query)]);
  const active = categories.data?.find((c) => c.slug === query.category);
  useDocumentTitle(active ? active.name : 'Our products');

  useEffect(() => setTerm(params.get('q') || ''), [params]);

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v === undefined || v === null || v === '' ? next.delete(k) : next.set(k, v)));
    if (!('page' in changes)) next.delete('page');
    setParams(next);
  };
  const clearAll = () => { setParams(new URLSearchParams()); setFiltersOpen(false); };
  const activeCount = ['category', 'min_price', 'max_price', 'availability', 'q'].filter((k) => params.get(k)).length;
  const priceKey = PRICE_RANGES.find((r) => String(r.min ?? '') === (params.get('min_price') || '') && String(r.max ?? '') === (params.get('max_price') || ''))?.key;

  const filters = (
    <div className="space-y-9">
      <fieldset>
        <legend className="mb-3 font-sans text-base font-semibold text-mauve">Category</legend>
        <ul className="space-y-1">
          {[{ slug: '', name: 'All products' }, ...(categories.data || [])].map((c) => (
            <li key={c.slug || 'all'}>
              <button type="button" onClick={() => update({ category: c.slug })}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[15px] transition ${(query.category || '') === c.slug ? 'bg-petal text-rosewood' : 'text-charcoal hover:bg-petal/60'}`}>
                {c.name}
                {c.products_count !== undefined && <span className="text-xs text-stone">{c.products_count}</span>}
              </button>
            </li>
          ))}
        </ul>
      </fieldset>

      <fieldset>
        <legend className="mb-3 font-sans text-base font-semibold text-mauve">Price</legend>
        <div className="space-y-2">
          {PRICE_RANGES.map((r) => (
            <label key={r.key} className="flex cursor-pointer items-center gap-3 text-[15px]">
              <input type="radio" name="price" checked={priceKey === r.key} onChange={() => update({ min_price: r.min, max_price: r.max })} className="h-4 w-4 accent-rosewood" />
              {r.label}
            </label>
          ))}
        </div>
        <form className="mt-4 flex items-center gap-2" onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          update({ min_price: f.get('min') || undefined, max_price: f.get('max') || undefined });
        }}>
          <input name="min" type="number" min="0" step="1000" placeholder="Min" defaultValue={params.get('min_price') || ''} key={`min-${params.get('min_price')}`} className="field !px-3 !py-2 text-sm" aria-label="Minimum price" />
          <span className="text-stone">–</span>
          <input name="max" type="number" min="0" step="1000" placeholder="Max" defaultValue={params.get('max_price') || ''} key={`max-${params.get('max_price')}`} className="field !px-3 !py-2 text-sm" aria-label="Maximum price" />
          <button type="submit" className="btn-outline btn-sm !px-4">Go</button>
        </form>
      </fieldset>

      <fieldset>
        <legend className="mb-3 font-sans text-base font-semibold text-mauve">Availability</legend>
        <div className="space-y-2">
          {[['', 'All'], ['in_stock', 'In stock'], ['out_of_stock', 'Out of stock']].map(([v, label]) => (
            <label key={v || 'all'} className="flex cursor-pointer items-center gap-3 text-[15px]">
              <input type="radio" name="availability" checked={(query.availability || '') === v} onChange={() => update({ availability: v })} className="h-4 w-4 accent-rosewood" />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      {activeCount > 0 && <button type="button" onClick={clearAll} className="text-sm text-rosewood link-underline">Clear all filters</button>}
    </div>
  );

  const products = data?.data || [];
  const meta = data?.meta;

  return (
    <>
      <PageHeader title={active ? active.name : 'Our products'} crumbs={active ? [['/products', 'Our products'], [null, active.name]] : [[null, 'Our products']]}
        lede={active?.description || 'Gentle, effective formulas for every step of your ritual.'} />

      <div className="shell py-10 sm:py-14">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <form className="relative flex-1" onSubmit={(e) => { e.preventDefault(); update({ q: term.trim() }); }} role="search">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone" />
            <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search products or ingredients" aria-label="Search products" className="field !rounded-full !pl-11 !pr-10" />
            {term && (
              <button type="button" onClick={() => { setTerm(''); update({ q: '' }); }} aria-label="Clear search" className="absolute right-4 top-1/2 -translate-y-1/2 text-stone hover:text-mauve"><X size={16} /></button>
            )}
          </form>
          <div className="flex gap-3">
            <button type="button" onClick={() => setFiltersOpen(true)} className="btn-outline btn-sm flex-1 lg:hidden">
              <SlidersHorizontal size={16} /> Filters {activeCount > 0 && <span className="rounded-full bg-rosewood px-1.5 text-xs text-white">{activeCount}</span>}
            </button>
            <Select value={query.sort || 'newest'} onChange={(v) => update({ sort: v === 'newest' ? '' : v })} options={PRODUCT_SORTS}
              size="large" className="min-w-[200px] flex-1" aria-label="Sort products" />
          </div>
        </div>

        <div className="grid gap-12 lg:grid-cols-[230px_1fr]">
          <aside className="hidden lg:block"><div className="sticky top-28">{filters}</div></aside>

          <div>
            {!loading && !error && (
              <p className="mb-6 text-sm text-stone" aria-live="polite">
                {meta?.total ?? products.length} {meta?.total === 1 ? 'product' : 'products'}{query.q ? ` for “${query.q}”` : ''}
              </p>
            )}
            {error ? (
              <ErrorState error={error} onRetry={reload} />
            ) : !loading && products.length === 0 ? (
              <EmptyState icon={Search} title="No products found" text="Try a different search or remove a filter." action="Clear filters" onAction={clearAll} />
            ) : (
              <ProductGrid products={products} loading={loading} skeletons={6} cols="xl:grid-cols-3" />
            )}
            {meta && meta.last_page > 1 && (
              <div className="mt-14 flex justify-center">
                <Pagination current={meta.current_page} total={meta.total} pageSize={meta.per_page} showSizeChanger={false}
                  onChange={(page) => { update({ page }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
              </div>
            )}
          </div>
        </div>
      </div>

      <Drawer open={filtersOpen} onClose={() => setFiltersOpen(false)} placement="bottom" height="85vh" title="Filters"
        styles={{ content: { borderRadius: '24px 24px 0 0' } }}
        footer={<button type="button" onClick={() => setFiltersOpen(false)} className="btn-primary w-full">Show {meta?.total ?? ''} results</button>}>
        {filters}
      </Drawer>
    </>
  );
}
