import { create } from "zustand";
import {
  PrintifyProductVariant,
  PrintifyProductImage,
  PrintifyProductColor,
  PrintifyProductSize,
} from "~/api";

type CartVariant = PrintifyProductVariant & {
  images: PrintifyProductImage[];
  color: PrintifyProductColor;
  size: PrintifyProductSize;
  product_id: string;
};

export type CartItem = {
  variant: CartVariant;
  quantity: number;
};

type CartStore = {
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
  addToCart: (variant: CartVariant, quantity: number) => void;
  removeFromCart: (variantId: number) => void;
  isInCart: (variantId: number) => boolean;
  changeQuantity: (variantId: number, quantity: number) => void;
  getTotalCents: () => number;
};

export const useCartStore = create<CartStore>((set) => ({
  cart: [],
  setCart: (cart: CartItem[]) => set({ cart }),
  addToCart: (variant: CartVariant, quantity: number) => {
    const cleanedQuantity = Math.max(Math.floor(quantity), 0);
    if (cleanedQuantity == 0 || !variant) return;

    set((state) => {
      const existingItem = state.cart.find((item) => item.variant.id === variant.id);
      return existingItem
        ? {
            cart: state.cart.map((item) =>
              item === existingItem ? { ...item, quantity: item.quantity + cleanedQuantity } : item
            ),
          }
        : { cart: [...state.cart, { variant, quantity: cleanedQuantity }] };
    });
  },
  removeFromCart: (variantId: number) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.variant.id !== variantId),
    })),
  isInCart: (variantId: number): boolean => {
    const state = useCartStore.getState() as CartStore;
    return state.cart.some((item: CartItem) => item.variant.id === variantId);
  },
  changeQuantity: (variantId: number, quantity: number) => {
    const cleanedQuantity = Math.max(Math.floor(quantity), 0);
    if (cleanedQuantity == 0) {
      set((state) => ({
        cart: state.cart.filter((item) => item.variant.id !== variantId),
      }));
    } else {
      set((state) => ({
        cart: state.cart.map((item) =>
          item.variant.id === variantId ? { ...item, quantity: cleanedQuantity } : item
        ),
      }));
    }
  },
  getTotalCents: () => {
    const state = useCartStore.getState() as CartStore;
    return state.cart.reduce((total, item) => total + item.variant.price * item.quantity, 0);
  },
}));
