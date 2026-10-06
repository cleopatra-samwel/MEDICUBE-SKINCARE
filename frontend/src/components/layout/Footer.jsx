import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import Logo from '@/assets/brand/Logo';
import { brand } from '@/config/brand';
import SocialLinks from './SocialLinks';

const COLUMNS = [
  { title: 'Quick links', links: [['/', 'Home'], ['/about', 'About Us'], ['/products', 'Our Products'], ['/contact', 'Contact']] },
  { title: 'Customer', links: [['/profile', 'My Account'], ['/orders', 'My Orders'], ['/track-order', 'Track Order'], ['/delivery-information', 'Delivery Information']] },
  { title: 'Support', links: [['/privacy-policy', 'Privacy Policy'], ['/terms', 'Terms & Conditions'], ['/refund-policy', 'Refund Policy']] },
];

export default function Footer() {
  return (
    <footer className="bg-mauve text-white/75">
      <div className="shell grid gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-4">
          <Logo tone="light" />
          <p className="mt-5 max-w-sm text-[15px] leading-[1.7]">{brand.description}</p>
          <ul className="mt-6 space-y-2.5 text-sm">
            <li className="flex items-center gap-3"><Phone size={15} /> <a href={`tel:${brand.phone.replace(/\s/g, '')}`} className="hover:text-white">{brand.phone}</a></li>
            <li className="flex items-center gap-3"><Mail size={15} /> <a href={`mailto:${brand.email}`} className="hover:text-white">{brand.email}</a></li>
            <li className="flex items-center gap-3"><MapPin size={15} /> {brand.location}</li>
          </ul>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title} className="md:col-span-2">
            <h3 className="font-sans text-sm font-semibold tracking-[0.04em] text-white">{col.title}</h3>
            <ul className="mt-5 space-y-3 text-[15px] font-normal">
              {col.links.map(([to, label]) => (
                <li key={to}><Link to={to} className="transition hover:text-white">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}

        <div className="md:col-span-2">
          <h3 className="font-sans text-sm font-semibold tracking-[0.04em] text-white">Follow us</h3>
          <div className="mt-5"><SocialLinks tone="light" /></div>
          <Link to="/admin/login" className="mt-8 inline-flex items-center gap-2 text-sm transition hover:text-white">
            <ShieldCheck size={15} /> Admin Login
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="shell flex flex-col gap-2 py-6 text-[13px] sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {brand.name}. All rights reserved.</p>
          <p>Prices in Tanzanian shillings (TSh). Made in Dar es Salaam.</p>
        </div>
      </div>
    </footer>
  );
}
