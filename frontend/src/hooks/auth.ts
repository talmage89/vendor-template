import { create } from "zustand";
import { http, uninterceptedInstance, User } from "~/api";

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
