import { create } from "zustand";
import { http, uninterceptedInstance, User, Clothing, ProductSize, ProductColor } from "~/api";

export type CartItem = {
  clothing: Clothing;
  size: ProductSize;
  color: ProductColor;
  quantity: number;
};

type CartStore = {
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
  addToCart: (product: Clothing, size: ProductSize, color: ProductColor, quantity: number) => void;
  removeFromCart: (productId: string, sizeId: number, colorId: number) => void;
  isInCart: (productId: string) => boolean;
  changeQuantity: (productId: string, quantity: number) => void;
  changeSize: (productId: string, size: ProductSize) => void;
  changeColor: (productId: string, color: ProductColor) => void;
  getTotalCents: () => number;
};

export const useCartStore = create<CartStore>((set) => ({
  cart: [],
  setCart: (cart: CartItem[]) => set({ cart }),
  addToCart: (clothing, size, color, quantity = 1) => {
    const cleanedQuantity = Math.max(Math.floor(quantity), 0);
    if (cleanedQuantity == 0 || !clothing || !size || !color) return;
    if (!clothing.available_sizes.find((s) => s.id === size.id)) return;
    if (!clothing.colors.find((c) => c.id === color.id)) return;

    set((state) => {
      const existingItem = state.cart.find(
        (item) =>
          item.clothing.id === clothing.id && item.size.id === size.id && item.color.id === color.id
      );

      if (existingItem) {
        return {
          cart: state.cart.map((item) =>
            item === existingItem ? { ...item, quantity: item.quantity + cleanedQuantity } : item
          ),
        };
      }

      return {
        cart: [...state.cart, { clothing, size, color, quantity: cleanedQuantity }],
      };
    });
  },
  removeFromCart: (productId, sizeId, colorId) =>
    set((state) => ({
      cart: state.cart.filter(
        (item) =>
          item.clothing.id !== productId || item.size.id !== sizeId || item.color.id !== colorId
      ),
    })),
  isInCart: (productId: string): boolean => {
    const state = useCartStore.getState() as CartStore;
    return state.cart.some((item: CartItem) => item.clothing.id === productId);
  },
  changeSize: (productId: string, size: ProductSize) => {
    set((state) => ({
      cart: state.cart.map((item) =>
        item.clothing.id === productId
          ? item.clothing.available_sizes.find((s) => s.id === size.id)
            ? { ...item, size }
            : item
          : item
      ),
    }));
  },
  changeColor: (productId: string, color: ProductColor) => {
    set((state) => ({
      cart: state.cart.map((item) =>
        item.clothing.id === productId
          ? item.clothing.colors.find((c) => c.id === color.id)
            ? { ...item, color }
            : item
          : item
      ),
    }));
  },
  changeQuantity: (productId: string, quantity: number) => {
    const cleanedQuantity = Math.max(Math.floor(quantity), 0);
    if (cleanedQuantity == 0) {
      set((state) => ({
        cart: state.cart.filter((item) => item.clothing.id !== productId),
      }));
    } else {
      set((state) => ({
        cart: state.cart.map((item) =>
          item.clothing.id === productId ? { ...item, quantity: cleanedQuantity } : item
        ),
      }));
    }
  },
  getTotalCents: () => {
    const state = useCartStore.getState() as CartStore;
    return state.cart.reduce((total, item) => total + item.clothing.final_price_cents * item.quantity, 0);
  },
}));

type AuthStore = {
  user: User | null;
  setUser: (user: User | null) => void;
  getUser: () => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user: User | null) => set({ user }),
  getUser: () =>
    http
      .get("/api/auth/me/")
      .then((response) => set({ user: response.data }))
      .catch(() => set({ user: null })),
  logout: () => uninterceptedInstance.post("/api/auth/logout/").then(() => set({ user: null })),
}));
