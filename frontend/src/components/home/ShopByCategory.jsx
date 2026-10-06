import { Link } from 'react-router-dom';
import { catalogService } from '@/services/catalogService';
import { useAsync } from '@/hooks/useAsync';
import SectionHeading from '@/components/ui/SectionHeading';
import SmartImage from '@/components/ui/SmartImage';
import Reveal from '@/components/ui/Reveal';

const asList = (r) => (Array.isArray(r) ? r : r?.data || []);

export default function ShopByCategory() {
  const { data, loading } = useAsync(() => catalogService.categories().then(asList), []);
  const categories = data || [];

  return (
    <section className="section">
      <div className="shell">
        <SectionHeading title="Shop by category" lede="Build a ritual step by step, from a gentle cleanse to everyday protection." link="/products" linkLabel="All products" />
      </div>
      <div className="shell">
        <ul className="-mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-4 sm:-mx-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-7 lg:gap-5 lg:overflow-visible lg:px-0">
          {(loading ? Array.from({ length: 7 }) : categories).map((c, i) => (
            <Reveal as="li" key={c?.id ?? i} delay={i * 60} className="w-[42vw] max-w-[190px] shrink-0 snap-start lg:w-auto lg:max-w-none">
              {c ? (
                <Link to={`/products?category=${c.slug}`} className="group block text-center">
                  <div className="relative overflow-hidden rounded-arch bg-cream">
                    <SmartImage src={c.image} alt="" className="aspect-[3/4]" imgClassName="transition duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 rounded-arch ring-1 ring-inset ring-black/5" />
                  </div>
                  <h3 className="mt-4 font-display text-[1.375rem] text-mauve transition group-hover:text-rosewood">{c.name}</h3>
                  <p className="text-xs text-stone">{c.products_count} {c.products_count === 1 ? 'product' : 'products'}</p>
                </Link>
              ) : (
                <div><div className="skeleton aspect-[3/4] !rounded-arch" /><div className="skeleton mx-auto mt-4 h-4 w-2/3" /></div>
              )}
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
