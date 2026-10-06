import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { productVideo } from '@/config/brand';
import Reveal from '@/components/ui/Reveal';

/**
 * Muted, looping, inline video (browsers allow muted autoplay). It pauses when
 * scrolled away and falls back to the poster image if the file is missing.
 * Put your video at public/videos/skincare-product.mp4.
 */
export default function ProductVideo() {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [userPaused, setUserPaused] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v || failed) return undefined;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !userPaused) v.play().catch(() => setPlaying(false));
      else v.pause();
    }, { threshold: 0.35 });
    io.observe(v);
    return () => io.disconnect();
  }, [failed, userPaused]);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) { setUserPaused(false); v.play().catch(() => {}); } else { setUserPaused(true); v.pause(); }
  };

  return (
    <section className="section">
      <div className="shell grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-4">
          <h2 className="section-title">Discover our products</h2>
          <p className="section-lede">Experience our skincare collection: silky textures, gentle scents and formulas that melt into the skin.</p>
          <ul className="mt-8 space-y-3 text-[15px] text-mauve">
            <li className="flex gap-3"><span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose" />Lightweight layers made for humid days</li>
            <li className="flex gap-3"><span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose" />Fragrance kept soft, never overpowering</li>
            <li className="flex gap-3"><span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose" />Dermatologist-guided, cruelty free</li>
          </ul>
        </Reveal>

        <Reveal delay={120} className="lg:col-span-8">
          <div className="relative overflow-hidden rounded-[28px] bg-blush shadow-lift ring-1 ring-black/5">
            <div className="aspect-[16/10] sm:aspect-video">
              {failed ? (
                <img src={productVideo.poster} alt="Our skincare collection" className="h-full w-full object-cover" />
              ) : (
                <video ref={ref} className="h-full w-full object-cover" poster={productVideo.poster}
                  muted loop playsInline autoPlay preload="metadata"
                  onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => setFailed(true)}>
                  <source src={productVideo.src} type="video/mp4" onError={() => setFailed(true)} />
                </video>
              )}
            </div>
            {!failed && (
              <button type="button" onClick={toggle} aria-label={playing ? 'Pause video' : 'Play video'}
                className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-white/90 py-2 pl-2.5 pr-4 text-sm font-medium text-mauve shadow-soft backdrop-blur transition hover:bg-white">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-rosewood text-white">
                  {playing ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
                </span>
                {playing ? 'Pause' : 'Play'}
              </button>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
