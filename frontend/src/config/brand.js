/**
 * Everything brand-specific lives here. Change VITE_BRAND_NAME in .env
 * (or edit these defaults) to rename the store everywhere at once.
 */
export const brand = {
  name: import.meta.env.VITE_BRAND_NAME || 'Medicube',
  tagline: import.meta.env.VITE_BRAND_TAGLINE || 'Skincare for your natural glow',
  description:
    'Gentle, effective skincare made for warm climates and every skin tone. Formulated to nourish, hydrate and bring out your natural glow.',
  email: 'cleopatrasamwel058@gmail.com',
  phone: '+255 617654955',
  whatsapp: '255617654955',
  location: 'Mwenge, Dar es Salaam, Tanzania',
  social: {
    instagram: 'https://instagram.com/',
    facebook: 'https://facebook.com/',
    tiktok: 'https://tiktok.com/',
    whatsapp: 'https://wa.me/255617654955',
  },
};

export const heroSlides = [
  { src: '/images/hero/hero-1.jpeg', alt: 'Woman with glowing skin and a white towel wrap, cream smoothed on her cheek', position: 'center 55%' },
  { src: '/images/hero/hero-2.jpeg', alt: 'Medicube skincare range of jars, toner, serums and a mask on a marble shelf', position: 'center' },
  { src: '/images/hero/hero-3.jpeg', alt: 'Freckled woman with dewy skin holding a pink neck cream tube to her face', position: 'center 30%' },
  { src: '/images/hero/hero-4.jpeg', alt: 'Medicube PDRN Pink Peptide Serum bottle surrounded by pink liquid splashes', position: 'center' },
];

// Replace with your own file: public/videos/skincare-product.mp4
export const productVideo = { src: '/videos/skincare-product.mp4', poster: '/images/about/video-poster.svg' };
