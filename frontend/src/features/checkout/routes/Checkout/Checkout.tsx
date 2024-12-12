import * as React from "react";
import { Routes, Route } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { Appearance, loadStripe } from "@stripe/stripe-js";
import { http } from "~/api";
import { Spinner } from "~/components";
import { useAuthStore, useCartStore, useCheckoutStore } from "~/hooks";
import { CheckoutForm, CheckoutReturn } from "../../components";
import "./Checkout.scss";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
const appearance = { theme: "stripe" };
const loader = "always";

export const Checkout = () => {
  const { user } = useAuthStore();
  const { cart, getTotalCents } = useCartStore();
  const { shipping, setExpectedTotal } = useCheckoutStore();

  const [isLoading, setIsLoading] = React.useState(true);
  const [clientSecret, setClientSecret] = React.useState<string | null>(null);

  React.useEffect(() => {
    (user
      ? http.post("/api/payments/create-setup-intent/", { user_id: user?.id })
      : http.post("/api/payments/create-setup-intent/")
    )
      .then((res) => setClientSecret(res.data.client_secret))
      .finally(() => setIsLoading(false));
  }, [user]);

  React.useEffect(() => {
    setExpectedTotal(getTotalCents() + (shipping?.shipping_cost || 0));
  }, [cart, shipping]);

  return (
    <div className="Checkout">
      {isLoading ? (
        <div className="Checkout-loading">
          <Spinner />
        </div>
      ) : clientSecret ? (
        <Elements
          options={{ clientSecret, appearance: appearance as Appearance, loader }}
          stripe={stripePromise}
        >
          <Routes>
            <Route path="/" element={<CheckoutForm />} />
            <Route path="complete" element={<CheckoutReturn />} />
          </Routes>
        </Elements>
      ) : (
        <div className="Checkout-error">
          <p>An unexpected error occurred.</p>
        </div>
      )}
    </div>
  );
};
