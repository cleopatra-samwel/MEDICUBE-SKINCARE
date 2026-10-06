import { useDispatch } from 'react-redux';
import { App } from 'antd';
import { addItem } from '@/features/cart/cartSlice';
import { openCart } from '@/features/ui/uiSlice';

/** Add to cart with the toast + drawer feedback used across the site. */
export function useAddToCart() {
  const dispatch = useDispatch();
  const { message } = App.useApp();

  return (product, quantity = 1, { open = true } = {}) => {
    if (!product?.in_stock) {
      message.warning('This product is out of stock.');
      return false;
    }
    dispatch(addItem({ product, quantity }));
    message.success('Added to cart successfully.');
    if (open) dispatch(openCart());
    return true;
  };
}
