import { Facebook, Instagram } from 'lucide-react';
import { brand } from '@/config/brand';

const TikTok = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M16.6 3c.3 2.2 1.6 3.7 3.9 3.9v3a7 7 0 0 1-3.9-1.2v6.1a5.8 5.8 0 1 1-5.8-5.8c.3 0 .6 0 .9.1v3.1a2.8 2.8 0 1 0 1.9 2.6V3h2.9Z" />
  </svg>
);

const WhatsApp = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
    <path d="M4 20l1.2-3.6A8 8 0 1 1 8 19l-4 1Z" strokeLinejoin="round" />
    <path d="M9.2 8.6c.2-.4.5-.4.7-.4h.4c.2 0 .4.1.5.4l.6 1.4c.1.2 0 .4-.1.6l-.4.5c.5 1 1.3 1.8 2.3 2.3l.5-.5c.2-.2.4-.2.6-.1l1.4.6c.3.1.4.3.4.5v.4c0 .3-.1.5-.4.7-.5.4-1.3.6-2 .4-2.2-.7-3.9-2.4-4.6-4.6-.2-.7 0-1.5.1-2Z" fill="currentColor" stroke="none" />
  </svg>
);

export const SOCIALS = [
  { key: 'instagram', label: 'Instagram', href: brand.social.instagram, Icon: Instagram },
  { key: 'facebook', label: 'Facebook', href: brand.social.facebook, Icon: Facebook },
  { key: 'tiktok', label: 'TikTok', href: brand.social.tiktok, Icon: TikTok },
  { key: 'whatsapp', label: 'WhatsApp', href: brand.social.whatsapp, Icon: WhatsApp },
];

export default function SocialLinks({ tone = 'dark', size = 18, withLabels = false }) {
  const base = tone === 'light'
    ? 'border-white/25 text-white/85 hover:bg-white hover:text-mauve'
    : 'border-line text-mauve hover:border-rosewood hover:bg-rosewood hover:text-white';
  return (
    <ul className={`flex ${withLabels ? 'flex-col gap-3' : 'gap-2.5'}`}>
      {SOCIALS.map(({ key, label, href, Icon }) => (
        <li key={key}>
          <a href={href} target="_blank" rel="noreferrer noopener" aria-label={label}
            className={withLabels ? 'group inline-flex items-center gap-3 text-mauve hover:text-rosewood' : `grid h-10 w-10 place-items-center rounded-full border transition ${base}`}>
            {withLabels ? (
              <>
                <span className={`grid h-10 w-10 place-items-center rounded-full border transition ${base}`}><Icon size={size} /></span>
                <span>{label}</span>
              </>
            ) : <Icon size={size} />}
          </a>
        </li>
      ))}
    </ul>
  );
}
