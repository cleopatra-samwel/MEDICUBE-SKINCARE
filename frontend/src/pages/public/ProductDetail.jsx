import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Tabs } from 'antd';
import { Check, ChevronRight, PackageCheck, ShieldCheck, Truck } from 'lucide-react';
import ProductGallery from '@/components/product/ProductGallery';
import ReviewsSection from '@/components/product/ReviewsSection';
import WishlistButton from '@/components/product/WishlistButton';
import ProductGrid from '@/components/product/ProductGrid';
import QuantitySelector from '@/components/ui/QuantitySelector';
import RatingStars from '@/components/ui/RatingStars';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
import { catalogService } from '@/services/catalogService';
import { useAsync } from '@/hooks/useAsync';
import { useAddToCart } from '@/hooks/useCartActions';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { closeCart } from '@/features/ui/uiSlice';
import { formatPrice } from '@/utils/format';

function DetailSkeleton() {
  return (
    <div className="shell grid gap-10 py-10 md:grid-cols-2 md:py-14">
      <div className="skeleton aspect-[4/5] !rounded-[28px]" />
      <div className="space-y-4 pt-4">
        <div className="skeleton h-4 w-24" /><div className="skeleton h-12 w-3/4" /><div className="skeleton h-6 w-32" />
        <div className="skeleton h-24" /><div className="skeleton h-12 w-full !rounded-full" />
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const addToCart = useAddToCart();
  const [qty, setQty] = useState(1);
  const { data: product, loading, error, reload } = useAsync(() => catalogService.product(id), [id]);
  const related = useAsync(() => catalogService.related(id).then((r) => (Array.isArray(r) ? r : r.data)), [id]);
  useDocumentTitle(product?.name);
  useEffect(() => setQty(1), [id]);

  if (loading) return <DetailSkeleton />;
  if (error?.status === 404) {
    return <div className="shell"><EmptyState title="Product not found" text="It may have been removed or is no longer available." action="Browse products" to="/products" /></div>;
  }
  if (error) return <div className="shell"><ErrorState error={error} onRetry={reload} /></div>;

  const soldOut = !product.in_stock;
  const buyNow = () => {
    if (addToCart(product, qty, { open: false })) {
      dispatch(closeCart());
      navigate('/checkout');
    }
  };

  const tabs = [
    { key: 'description', label: 'Description', children: <p className="prose-copy whitespace-pre-line text-base font-normal leading-[1.75] text-charcoal/90">{product.description || product.short_description}</p> },
    product.ingredients && { key: 'ingredients', label: 'Ingredients', children: <p className="prose-copy text-base font-normal leading-[1.75] text-charcoal/90">{product.ingredients}</p> },
    product.how_to_use && { key: 'how', label: 'How to use', children: <p className="prose-copy whitespace-pre-line text-base font-normal leading-[1.75] text-charcoal/90">{product.how_to_use}</p> },
  ].filter(Boolean);

  return (
    <>
      <div className="shell pt-6">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-stone">
          <Link to="/" className="hover:text-rosewood">Home</Link><ChevronRight size={13} />
          <Link to="/products" className="hover:text-rosewood">Our products</Link>
          {product.category && (<><ChevronRight size={13} /><Link to={`/products?category=${product.category.slug}`} className="hover:text-rosewood">{product.category.name}</Link></>)}
        </nav>
      </div>

      <section className="shell grid gap-10 py-8 md:grid-cols-2 md:gap-14 md:py-12 lg:gap-20">
        <div className="md:sticky md:top-24 md:self-start">
          <ProductGallery images={product.images} name={product.name} />
        </div>

        <div>
          <p className="text-sm font-medium text-rosewood">{product.category?.name}{product.size ? ` · ${product.size}` : ''}</p>
          <h1 className="mt-3 font-display text-[clamp(2.25rem,1.7rem+2.4vw,3.25rem)] font-semibold leading-[1.1]">{product.name}</h1>
          <a href="#reviews" className="mt-4 inline-flex items-center gap-2 text-sm text-stone hover:text-rosewood">
            <RatingStars value={product.rating} size={15} />
            {product.rating_count ? `${product.rating.toFixed(1)} · ${product.rating_count} reviews` : 'No reviews yet'}
          </a>
          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-2xl font-bold tabular-nums text-mauve">{formatPrice(product.price)}</span>
            {product.compare_at_price && <s className="tabular-nums text-stone">{formatPrice(product.compare_at_price)}</s>}
          </div>
          <p className="prose-copy mt-5 text-lg font-normal leading-[1.7] text-stone">{product.short_description}</p>

          {product.benefits?.length > 0 && (
            <ul className="mt-7 grid gap-2.5 sm:grid-cols-2">
              {product.benefits.map((b) => (
                <li key={b} className="flex gap-2.5 text-[15px]"><Check size={17} className="mt-0.5 shrink-0 text-rosewood" />{b}</li>
              ))}
            </ul>
          )}

          {product.skin_types?.length > 0 && (
            <div className="mt-7">
              <p className="text-sm font-medium text-mauve">Skin type</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.skin_types.map((s) => <span key={s} className="rounded-full bg-petal px-3.5 py-1 text-sm text-mauve">{s}</span>)}
              </div>
            </div>
          )}

          <div className="mt-8 border-t border-line pt-8">
            <p className={`flex items-center gap-2 text-sm ${soldOut ? 'text-stone' : 'text-[#5E8C6A]'}`}>
              <span className={`h-2 w-2 rounded-full ${soldOut ? 'bg-stone' : 'bg-[#5E8C6A]'}`} />
              {soldOut ? 'Out of stock. Check back soon.' : product.low_stock ? 'In stock, only a few left' : 'In stock, ready to ship'}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {!soldOut && <QuantitySelector value={qty} onChange={setQty} max={product.max_quantity} />}
              <button type="button" disabled={soldOut} onClick={() => addToCart(product, qty)} className="btn-primary flex-1 sm:flex-none sm:min-w-[180px]">
                {soldOut ? 'Sold out' : 'Add to cart'}
              </button>
              <WishlistButton product={product} className="h-12 w-12 rounded-full border border-line bg-white hover:border-rosewood" />
            </div>
            {!soldOut && <button type="button" onClick={buyNow} className="btn-outline mt-3 w-full">Buy now</button>}
          </div>

          <ul className="mt-8 grid gap-3 rounded-2xl bg-white p-5 text-sm text-stone sm:grid-cols-3">
            <li className="flex items-center gap-2.5"><Truck size={17} className="text-rosewood" /> Fast local delivery</li>
            <li className="flex items-center gap-2.5"><ShieldCheck size={17} className="text-rosewood" /> Secure payment</li>
            <li className="flex items-center gap-2.5"><PackageCheck size={17} className="text-rosewood" /> Track your order</li>
          </ul>

          <Tabs className="mt-10" items={tabs} />
        </div>
      </section>

      <ReviewsSection product={product} />

      {related.data?.length > 0 && (
        <section className="section border-t border-line bg-white">
          <div className="shell">
            <h2 className="section-title mb-10">You may also like</h2>
            <ProductGrid products={related.data} />
          </div>
        </section>
      )}
    </>
  );
}
