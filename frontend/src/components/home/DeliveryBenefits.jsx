import { useSelector } from 'react-redux';
import { PackageCheck, RotateCcw, ShieldCheck, Smartphone } from 'lucide-react';
import { formatPrice } from '@/utils/format';

export default function DeliveryBenefits() {
  const threshold = useSelector((s) => s.ui.shopConfig?.delivery?.free_delivery_threshold);
  const items = [
    { Icon: PackageCheck, title: 'Delivery across Tanzania', text: threshold ? `1–2 days in Dar es Salaam. Free over ${formatPrice(threshold)}.` : '1–2 days in Dar es Salaam, 2–5 days to other regions.' },
    { Icon: Smartphone, title: 'Pay your way', text: 'M-Pesa, Mixx by Yas, Airtel Money, HaloPesa, card or bank.' },
    { Icon: ShieldCheck, title: 'Secure checkout', text: 'Orders are confirmed only after your payment is verified.' },
    { Icon: RotateCcw, title: 'Easy returns', text: 'Unopened products can be returned within 14 days.' },
  ];
  return (
    <section className="border-y border-line bg-white">
      <div className="shell grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {items.map(({ Icon, title, text }) => (
          <div key={title} className="flex gap-4">
            <Icon size={26} strokeWidth={1.4} className="shrink-0 text-rosewood" />
            <div>
              <h3 className="font-sans text-[15px] font-semibold text-mauve">{title}</h3>
              <p className="mt-1 text-sm text-stone">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
