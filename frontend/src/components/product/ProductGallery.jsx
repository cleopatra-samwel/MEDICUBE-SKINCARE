import { useState } from 'react';
import SmartImage from '@/components/ui/SmartImage';

export default function ProductGallery({ images = [], name }) {
  const list = images.length ? images : [{ id: 0, url: null, alt: name }];
  const [active, setActive] = useState(0);
  const current = list[Math.min(active, list.length - 1)];

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      {list.length > 1 && (
        <div className="flex gap-3 md:flex-col" role="tablist" aria-label="Product images">
          {list.map((img, i) => (
            <button key={img.id ?? i} type="button" role="tab" aria-selected={i === active} onClick={() => setActive(i)}
              className={`overflow-hidden rounded-xl ring-offset-2 ring-offset-porcelain transition ${i === active ? 'ring-2 ring-rosewood' : 'opacity-70 hover:opacity-100'}`}>
              <SmartImage src={img.url} alt="" className="h-20 w-16 md:h-24 md:w-20" />
            </button>
          ))}
        </div>
      )}
      <div className="group relative flex-1 overflow-hidden rounded-[28px] bg-petal">
        <SmartImage key={current.url} src={current.url} alt={current.alt || name} className="aspect-[4/5]" eager
          imgClassName="transition duration-700 group-hover:scale-105" />
      </div>
    </div>
  );
}
