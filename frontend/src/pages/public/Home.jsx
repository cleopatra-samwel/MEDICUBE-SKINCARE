import HeroSlideshow from '@/components/home/HeroSlideshow';
import ShopByCategory from '@/components/home/ShopByCategory';
import BestSellers from '@/components/home/BestSellers';
import ProductVideo from '@/components/home/ProductVideo';
import BrandStory from '@/components/home/BrandStory';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import CustomerReviews from '@/components/home/CustomerReviews';
import DeliveryBenefits from '@/components/home/DeliveryBenefits';
import Newsletter from '@/components/home/Newsletter';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

/** Section order follows the brief exactly (navbar and footer come from PublicLayout). */
export default function Home() {
  useDocumentTitle();
  return (
    <>
      <HeroSlideshow />
      <ShopByCategory />
      <BestSellers />
      <ProductVideo />
      <BrandStory />
      <WhyChooseUs />
      <CustomerReviews />
      <DeliveryBenefits />
      <Newsletter />
    </>
  );
}
