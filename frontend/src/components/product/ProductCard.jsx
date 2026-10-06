import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import SmartImage from '@/components/ui/SmartImage';
import RatingStars from '@/components/ui/RatingStars';
import WishlistButton from './WishlistButton';
import { useAddToCart } from '@/hooks/useCartActions';
import { formatPrice } from '@/utils/format';

export default function ProductCard({ product }) {
  const addToCart = useAddToCart();
  const url = `/products/${product.slug}`;
  const soldOut = !product.in_stock;

  return (
    <article className="group flex flex-col">
      <div className="relative">
        <Link to={url} className="block overflow-hidden rounded-arch bg-petal" aria-label={product.name}>
          <SmartImage src={product.image} alt={product.name} className="aspect-[4/5]" imgClassName="transition duration-700 ease-out group-hover:scale-[1.04]" />
        </Link>
        <WishlistButton product={product} className="absolute right-3 top-5 h-10 w-10 rounded-full bg-white/85 backdrop-blur hover:bg-white" />
        {soldOut ? (
          <span className="absolute left-3 top-5 rounded-full bg-white/90 px-3 py-1 text-xs text-stone">Sold out</span>
        ) : product.low_stock ? (
          <span className="absolute left-3 top-5 rounded-full bg-white/90 px-3 py-1 text-xs text-rosewood">Only a few left</span>
        ) : product.compare_at_price ? (
          <span className="absolute left-3 top-5 rounded-full bg-rosewood px-3 py-1 text-xs text-white">Offer</span>
        ) : null}

        {/* Quick add slides up on hover (desktop); always-visible button below covers touch. */}
        {!soldOut && (
          <button type="button" onClick={() => addToCart(product)}
            className="absolute inset-x-3 bottom-3 hidden translate-y-3 items-center justify-center gap-2 rounded-full bg-white/95 py-2.5 text-sm font-semibold text-mauve opacity-0 shadow-soft backdrop-blur transition duration-300 hover:bg-rosewood hover:text-white group-hover:translate-y-0 group-hover:opacity-100 lg:flex">
            <ShoppingBag size={16} /> Quick add
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col pt-4">
        <div className="flex items-center justify-between gap-2 text-xs text-stone">
          <span>{product.category?.name}</span>
          {product.rating_count > 0 && <RatingStars value={product.rating} count={product.rating_count} size={12} />}
        </div>
        <h3 className="mt-1.5 line-clamp-2 font-sans text-base font-semibold leading-[1.35] tracking-normal text-mauve sm:text-[17px]">
          <Link to={url} className="transition hover:text-rosewood">{product.name}</Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm font-normal leading-normal text-stone">{product.short_description}</p>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-base font-bold tabular-nums text-mauve">{formatPrice(product.price)}</span>
          {product.compare_at_price && <s className="text-sm text-stone/70 tabular-nums">{formatPrice(product.compare_at_price)}</s>}
          <span className={`ml-auto text-[13px] font-medium ${soldOut ? 'text-stone' : 'text-[#5E8C6A]'}`}>{soldOut ? 'Out of stock' : 'In stock'}</span>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button type="button" disabled={soldOut} onClick={() => addToCart(product)} className="btn-primary btn-sm !px-3">
            {soldOut ? 'Sold out' : 'Add to cart'}
          </button>
          <Link to={url} className="btn-outline btn-sm !px-3">View details</Link>
        </div>
      </div>
    </article>
  );
}
