import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';

export default function ProductGrid({ products = [], loading = false, skeletons = 8, cols = 'lg:grid-cols-4' }) {
  return (
    <div className={`grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 ${cols}`}>
      {loading
        ? Array.from({ length: skeletons }).map((_, i) => <ProductCardSkeleton key={i} />)
        : products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
