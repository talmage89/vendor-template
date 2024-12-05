import { create } from "zustand";
import { Artwork, User, UserModel } from "~/api";

type CartStore = {
  cart: Artwork[];
  setCart: (cart: Artwork[]) => void;
  addToCart: (artwork: Artwork) => void;
  removeFromCart: (productId: string) => void;
};

export const useCartStore = create<CartStore>((set) => ({
  cart: [],
  setCart: (cart: Artwork[]) => set({ cart }),
  addToCart: (product) => set((state) => ({ cart: [...state.cart, product] })),
  removeFromCart: (productId: string) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== productId),
    })),
}));

type AuthStore = {
  user: User | null;
  setUser: (user: User | null) => void;
  getUser: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user: User | null) => set({ user }),
  getUser: async () => {
    try {
      const response = await UserModel.listAction("me", "get");
      set({ user: response.data });
    } catch {
      console.error("Failed to get user");
      set({ user: null });
    }
  },
}));
