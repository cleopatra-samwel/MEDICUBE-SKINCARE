import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { heroSlides } from '@/config/brand';

const INTERVAL = 5000;

/**
 * Full-bleed editorial slideshow. Slides cross-fade while the active one slowly
 * zooms (Ken Burns). It slides under the transparent navbar (-mt-[72px]).
 * Swap images in config/brand.js → heroSlides.
 */
export default function HeroSlideshow() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const next = useCallback(() => setIndex((i) => (i + 1) % heroSlides.length), []);

  useEffect(() => {
    if (paused) return undefined;
    const t = setInterval(next, INTERVAL);
    const onVis = () => document.hidden && setPaused(true);
    document.addEventListener('visibilitychange', onVis);
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', onVis); };
  }, [paused, next]);

  useEffect(() => {
    const onVis = () => !document.hidden && setPaused(false);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  return (
    <section className="relative -mt-[72px] h-[max(560px,calc(100svh-36px))] max-h-[920px] overflow-hidden bg-blush" aria-roledescription="carousel" aria-label="Featured">
      {heroSlides.map((slide, i) => (
        <div key={slide.src} aria-hidden={i !== index}
          className={`absolute inset-0 transition-opacity duration-[1400ms] ease-in-out ${i === index ? 'opacity-100' : 'opacity-0'}`}>
          <img src={slide.src} alt={slide.alt} loading={i === 0 ? 'eager' : 'lazy'} fetchpriority={i === 0 ? 'high' : 'low'}
            style={{ objectPosition: slide.position || 'center' }}
            className={`h-full w-full object-cover ${i === index ? 'animate-kenburns' : ''}`} />
        </div>
      ))}

      {/* Soft overlay: darker on the text side only, so products stay bright. */}
      <div className="absolute inset-0 bg-gradient-to-r from-mauve/55 via-mauve/20 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-mauve/35 to-transparent" />

      <div className="shell relative flex h-full flex-col justify-center pt-16">
        <div key={index} className="max-w-xl text-white">
          <p className="animate-rise text-[13px] font-medium tracking-[0.12em] text-white/85 sm:text-sm">New season ritual</p>
          <h1 className="mt-4 animate-rise font-display text-[clamp(2.75rem,1.6rem+5vw,5.5rem)] font-semibold leading-[1.02] text-white" style={{ animationDelay: '120ms' }}>
            YOUR SKIN, YOUR GLOW
          </h1>
          <p className="mt-5 max-w-md animate-rise text-[clamp(1rem,0.95rem+0.3vw,1.2rem)] font-normal leading-[1.7] text-white/90" style={{ animationDelay: '240ms' }}>
            Discover skincare designed to nourish, hydrate and enhance your natural glow.
          </p>
          <div className="mt-8 flex animate-rise flex-wrap gap-3" style={{ animationDelay: '360ms' }}>
            <Link to="/products" className="btn-light">Shop Now</Link>
            <Link to="/products?sort=popular" className="btn-ghost-light">Explore Products</Link>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-8">
        <div className="shell flex items-center gap-3" role="tablist" aria-label="Choose slide">
          {heroSlides.map((s, i) => (
            <button key={s.src} type="button" role="tab" aria-selected={i === index} aria-label={`Slide ${i + 1}`}
              onClick={() => { setIndex(i); setPaused(false); }}
              className={`h-2.5 rounded-full border border-white transition-all duration-500 ${i === index ? 'w-8 bg-white' : 'w-2.5 bg-transparent hover:bg-white/50'}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
