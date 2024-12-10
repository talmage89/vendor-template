import { create } from "zustand";
import { http, uninterceptedInstance, User, Clothing } from "~/api";

type CartStore = {
  cart: Clothing[];
  setCart: (cart: Clothing[]) => void;
  addToCart: (product: Clothing) => void;
  removeFromCart: (productId: string) => void;
  isInCart: (productId: string) => boolean;
};

export const useCartStore = create<CartStore>((set) => ({
  cart: [],
  setCart: (cart: Clothing[]) => set({ cart }),
  addToCart: (product) => set((state) => ({ cart: [...state.cart, product] })),
  removeFromCart: (productId: string) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== productId),
    })),
  isInCart: (productId: string): boolean => {
    const state = useCartStore.getState() as CartStore;
    return state.cart.some((item: Clothing) => item.id === productId);
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
