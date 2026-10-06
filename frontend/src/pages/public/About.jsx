import { Link } from 'react-router-dom';
import { Compass, Eye, HeartHandshake, Leaf, Scale, Sparkles } from 'lucide-react';
import SmartImage from '@/components/ui/SmartImage';
import Reveal from '@/components/ui/Reveal';
import { brand } from '@/config/brand';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const VALUES = [
  { Icon: Leaf, title: 'Gentle by design', text: 'We choose ingredients skin recognises and leave out what it does not need.' },
  { Icon: Scale, title: 'Honest labels', text: 'Full ingredient lists, real percentages where they matter, and no miracle claims.' },
  { Icon: HeartHandshake, title: 'Every skin tone', text: 'Formulas tested on melanin-rich skin, with sunscreens that never leave a cast.' },
  { Icon: Sparkles, title: 'Small-batch care', text: 'Made in small runs so every jar reaches you fresh.' },
];

export default function About() {
  useDocumentTitle('About us');
  return (
    <>
      <section className="relative overflow-hidden bg-petal">
        <div className="shell grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="text-sm font-medium text-rosewood">About us</p>
            <h1 className="mt-4 font-display text-[3.25rem] leading-[1.02] sm:text-[3.75rem]">A softer kind of skincare</h1>
            <p className="mt-6 max-w-md text-lg leading-[1.7] text-stone">{brand.description}</p>
          </div>
          {/* Mobile: tall arch on top, two squares below. Desktop: arch spans two rows beside two stacked images. */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-[1.4fr_1fr] md:gap-4">
            <SmartImage src="/images/about/softer-1.jpg" alt="Woman with glowing skin holding a pink cream jar beneath her chin"
              className="col-span-2 aspect-[4/5] rounded-arch shadow-lift md:col-span-1 md:row-span-2 md:aspect-auto" imgClassName="absolute inset-0" eager />
            <SmartImage src="/images/about/softer-2.jpg" alt="Hand holding a serum dropper over an open bottle beside a white towel"
              className="aspect-square rounded-2xl" imgClassName="object-bottom" />
            <SmartImage src="/images/about/softer-3.jpg" alt="Before and after close-ups of a face with a serum bottle in front"
              className="aspect-square rounded-2xl" />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell grid gap-12 md:grid-cols-12">
          <Reveal className="md:col-span-5">
            <div className="relative">
              <SmartImage src="/images/about/our-story-1.jpg" alt="Blue cleansing oil, face brush, serum, foam cleanser and mud mask on a marble counter" className="aspect-[4/5] rounded-arch" />
              <SmartImage src="/images/about/our-story-2.jpg" alt="Pink skincare range of jars, toner and serums on a marble shelf"
                className="mt-4 aspect-[4/3] rounded-2xl shadow-lift ring-4 ring-white md:absolute md:-bottom-8 md:-right-8 md:mt-0 md:aspect-square md:w-[46%]" />
            </div>
          </Reveal>
          <Reveal delay={100} className="md:col-span-6 md:col-start-7 md:self-center">
            <h2 className="section-title">Our story</h2>
            <div className="mt-6 space-y-4 text-lg leading-[1.7] text-stone">
              <p>It started at a kitchen table in Dar es Salaam, with a notebook of recipes and a drawer full of products that never quite worked in our heat.</p>
              <p>We wanted skincare that felt weightless at noon, calmed skin after a long day in the sun, and treated deeper skin tones as the starting point rather than an afterthought.</p>
              <p>Years of testing later, {brand.name} is a small team of formulators, makers and skin lovers, still mixing in small batches and still reading every message our customers send.</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section bg-white">
        <div className="shell grid gap-5 md:grid-cols-2">
          {[
            { Icon: Compass, title: 'Our mission', text: 'To make effective, gentle skincare that feels good to use every day, and to make it easy to buy anywhere in Tanzania.' },
            { Icon: Eye, title: 'Our vision', text: 'A future where every person in East Africa can find skincare made for their skin, their climate and their budget.' },
          ].map(({ Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 100} className="rounded-[28px] bg-cream/70 p-10 sm:p-12">
              <Icon size={28} strokeWidth={1.4} className="text-rosewood" />
              <h2 className="mt-6 font-display text-[2.125rem]">{title}</h2>
              <p className="prose-copy mt-4 text-lg leading-[1.7] text-stone">{text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="mb-12 max-w-xl">
            <h2 className="section-title">Our values</h2>
            <p className="section-lede">The promises behind every bottle.</p>
          </div>
          <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 80}>
                <Icon size={24} strokeWidth={1.4} className="text-rosewood" />
                <h3 className="mt-4 font-display text-[1.5rem]">{title}</h3>
                <p className="mt-2 text-[15px] leading-[1.7] text-stone">{text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-mauve text-white">
        <div className="shell max-w-3xl text-center">
          <h2 className="font-display text-[2.5rem] text-white sm:text-[3.25rem]">Why we exist</h2>
          <p className="mt-6 text-lg leading-[1.7] text-white/80">
            Because caring for your skin should feel like a small daily kindness, not a chore or a gamble.
            We exist to take the guesswork out, so you can spend less time worrying about your skin and more time enjoying it.
          </p>
          <Link to="/products" className="btn-light mt-10">Explore the collection</Link>
        </div>
      </section>
    </>
  );
}
