import { useState } from 'react';
import { mediaUrl } from '@/utils/media';

/** Image that fades in on load, never distorts (object-cover) and falls back to a placeholder. */
export default function SmartImage({ src, alt = '', className = '', imgClassName = '', fit = 'cover', eager = false }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <div className={`relative overflow-hidden bg-petal ${className}`}>
      <img
        src={failed ? '/images/products/placeholder.svg' : mediaUrl(src)}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`h-full w-full ${fit === 'contain' ? 'object-contain' : 'object-cover'} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
      />
    </div>
  );
}
