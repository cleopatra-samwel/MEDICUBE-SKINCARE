import { Droplets, FlaskConical, Leaf, Sun } from 'lucide-react';
import Reveal from '@/components/ui/Reveal';

const POINTS = [
  { Icon: Droplets, title: 'Hydration first', text: 'Every formula starts with moisture: hyaluronic acid, glycerin and botanical humectants.' },
  { Icon: Sun, title: 'Made for our climate', text: 'Lightweight textures that stay comfortable in heat and humidity, with no white cast.' },
  { Icon: FlaskConical, title: 'Gentle, proven actives', text: 'Vitamin C, niacinamide and ceramides at levels that work without irritation.' },
  { Icon: Leaf, title: 'Clean and kind', text: 'Cruelty free, no harsh sulphates, and recyclable packaging wherever we can.' },
];

export default function WhyChooseUs() {
  return (
    <section className="section">
      <div className="shell">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="section-title">Why choose us</h2>
          <p className="section-lede mx-auto">Thoughtful formulas, honest ingredients and care you can feel from the first use.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {POINTS.map(({ Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 80} className="group card p-8 transition duration-300 hover:-translate-y-1 hover:shadow-soft">
              <div className="arch grid h-16 w-14 place-items-center bg-petal text-rosewood transition group-hover:bg-blush">
                <Icon size={22} strokeWidth={1.5} />
              </div>
              <h3 className="mt-6 font-display text-[1.5rem]">{title}</h3>
              <p className="mt-2 text-[15px] leading-[1.7] text-stone">{text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
