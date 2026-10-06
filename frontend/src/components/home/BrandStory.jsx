import { Link } from 'react-router-dom';
import SmartImage from '@/components/ui/SmartImage';
import Reveal from '@/components/ui/Reveal';
import { brand } from '@/config/brand';

export default function BrandStory() {
  return (
    <section className="section bg-cream/60">
      <div className="shell grid items-center gap-12 md:grid-cols-2 lg:gap-24">
        {/* Mobile: stacked, no overlap. Desktop: main arch (80%) with a smaller photo layered over its bottom-right corner. */}
        <div className="mx-auto w-full max-w-lg md:pb-8">
          <div className="relative">
            <Reveal className="md:w-[80%]">
              <SmartImage src="/images/about/brand-story-1.jpg" alt="Glowing skin close-up" className="aspect-[4/5] rounded-arch shadow-lift" imgClassName="object-top" />
            </Reveal>
            <Reveal delay={150} className="mx-auto mt-4 w-[70%] md:absolute md:-bottom-8 md:right-0 md:mx-0 md:mt-0 md:w-[45%]">
              <SmartImage src="/images/about/brand-story-2.jpg" alt="Our skincare products" className="aspect-[4/5] rounded-2xl shadow-lift ring-[6px] ring-white" imgClassName="object-top" />
            </Reveal>
            <div className="absolute -left-6 top-[12%] z-10 hidden w-40 rounded-2xl bg-white p-4 shadow-soft md:block">
              <p className="font-display text-[2.125rem] text-rosewood">2019</p>
              <p className="text-xs text-stone">First batch mixed by hand in Dar es Salaam</p>
            </div>
          </div>
        </div>
        <Reveal delay={120}>
          <h2 className="section-title">Skincare made for the skin you live in</h2>
          <p className="prose-copy mt-6 text-lg leading-[1.7] text-stone">
            {brand.name} began with a simple frustration: beautiful products that felt heavy in coastal heat and were never made with deeper skin tones in mind.
            So we started small, testing textures in Dar es Salaam’s humidity until each formula felt light, calm and quietly effective.
          </p>
          <p className="prose-copy mt-4 leading-[1.7] text-stone">
            Today every product is still built around that idea: gentle actives, honest ingredient lists, and a glow that looks like your own skin, only happier.
          </p>
          <Link to="/about" className="btn-outline mt-9">Read our story</Link>
        </Reveal>
      </div>
    </section>
  );
}
