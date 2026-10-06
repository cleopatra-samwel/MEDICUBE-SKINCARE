import { useSelector } from 'react-redux';
import PageHeader from '@/components/ui/PageHeader';
import { brand } from '@/config/brand';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatPrice } from '@/utils/format';

/**
 * Template policy copy. Review it with a legal adviser before launch and edit
 * the text below to match how your business actually operates.
 */
function content(page, delivery) {
  const fees = delivery?.fees_by_region || {};
  switch (page) {
    case 'privacy':
      return {
        title: 'Privacy policy',
        sections: [
          ['What we collect', 'When you order we collect your name, phone number, optional email and delivery address. If you create an account we also store your password as a secure one-way hash, never in plain text.'],
          ['How we use it', 'Only to process and deliver your orders, send order updates, answer your messages and, if you subscribe, send our newsletter. We never sell your data.'],
          ['Payments', 'Payments are handled by licensed payment providers. We do not see or store your mobile money PIN or card details.'],
          ['Your choices', `You can update your details from your account, unsubscribe from emails at any time, or ask us to delete your data by writing to ${brand.email}.`],
        ],
      };
    case 'terms':
      return {
        title: 'Terms & conditions',
        sections: [
          ['Orders', 'An order is confirmed once payment has been verified by our payment provider. We may cancel an order if a product becomes unavailable, and any payment taken will be refunded in full.'],
          ['Prices', 'All prices are in Tanzanian shillings (TSh) and include applicable taxes. Delivery fees are shown before you pay.'],
          ['Product use', 'Always patch test new skincare. Stop use and seek advice if irritation occurs. Our products are cosmetics and are not intended to treat medical conditions.'],
          ['Accounts', 'Accounts are optional. You are responsible for keeping your password safe.'],
        ],
      };
    case 'refund':
      return {
        title: 'Refund policy',
        sections: [
          ['Returns', 'Unopened products in original packaging can be returned within 14 days of delivery.'],
          ['Damaged or wrong items', 'If something arrives damaged or incorrect, contact us within 48 hours with a photo and we will replace it or refund you.'],
          ['How refunds are paid', 'Refunds go back to the original payment method, usually within 5–7 working days after we receive the return.'],
        ],
      };
    default:
      return {
        title: 'Delivery information',
        sections: [
          ['Where we deliver', 'We deliver to all regions of Tanzania mainland and Zanzibar.'],
          ['Delivery times', 'Dar es Salaam: 1–2 working days. Other regions: 2–5 working days, depending on location.'],
          ['Delivery fees', `${Object.entries(fees).map(([r, f]) => `${r}: ${formatPrice(f)}`).join(' · ') || 'Fees depend on your region.'}${delivery?.default_fee ? ` · Other regions: ${formatPrice(delivery.default_fee)}` : ''}${delivery?.free_delivery_threshold ? `. Free delivery on orders over ${formatPrice(delivery.free_delivery_threshold)}.` : ''}`],
          ['Tracking', 'Use your order number and phone number on the Track order page to follow each step, from payment to delivery.'],
        ],
      };
  }
}

export default function Policy({ page }) {
  const delivery = useSelector((s) => s.ui.shopConfig?.delivery);
  const { title, sections } = content(page, delivery);
  useDocumentTitle(title);
  return (
    <>
      <PageHeader title={title} crumbs={[[null, title]]} />
      <article className="shell max-w-3xl py-12 sm:py-16">
        {sections.map(([h, p]) => (
          <section key={h} className="mb-10">
            <h2 className="font-display text-[1.75rem]">{h}</h2>
            <p className="prose-copy mt-3 text-lg font-normal leading-[1.7] text-stone">{p}</p>
          </section>
        ))}
        <p className="text-sm text-stone">Questions? Email <a href={`mailto:${brand.email}`} className="link-underline">{brand.email}</a>.</p>
      </article>
    </>
  );
}
