import { Stripe, StripeElements } from "@stripe/stripe-js";
import { create } from "zustand";
import { http } from "~/api";
import { CartItem } from "./cart";

interface CheckoutState {
  isLoading: boolean;
  message: string;
  termsAccepted: boolean;
  email: string;
  shipping: { country: string; shipping_cost: number; threshold?: number } | null;
  expectedTotal: number;

  setTermsAccepted: (accepted: boolean) => void;
  setEmail: (email: string) => void;
  setShipping: (shipping: any) => void;
  setExpectedTotal: (total: number) => void;

  handlePaymentSubmission: (params: {
    stripe: Stripe;
    elements: StripeElements;
    cart: CartItem[];
  }) => Promise<void>;
}

export const useCheckoutStore = create<CheckoutState>((set, get) => ({
  isLoading: false,
  message: "",
  termsAccepted: false,
  email: "",
  shipping: null,
  expectedTotal: 0,

  setTermsAccepted: (accepted) => set({ termsAccepted: accepted }),
  setEmail: (email) => set({ email }),
  setShipping: (shipping) => set({ shipping }),
  setExpectedTotal: (total) => set({ expectedTotal: total }),

  handlePaymentSubmission: async ({ stripe, elements, cart }) => {
    const { termsAccepted, expectedTotal, shipping } = get();

    if (!cart.length || !stripe || !elements || !termsAccepted || !expectedTotal || !shipping) {
      return;
    }

    set({ isLoading: true, message: "" });

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        set({ message: submitError.message ?? "An unexpected error occurred." });
        return;
      }

      const { data: paymentIntent } = await http.post("/api/payments/create-payment-intent/", {
        cart: cart.map((item) => ({
          variant: item.variant,
          quantity: item.quantity,
        })),
        country: shipping.country,
        expected_total: expectedTotal,
      });

      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret: paymentIntent.client_secret,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/complete`,
        },
      });

      if (error) {
        set({ message: error.message ?? "An unexpected error occurred." });
      }
    } catch (err: any) {
      set({
        message: err.response?.data?.error ?? "An unexpected error occurred.",
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));
