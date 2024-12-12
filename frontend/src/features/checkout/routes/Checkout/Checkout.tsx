import * as React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { Appearance, loadStripe } from "@stripe/stripe-js";
import { Routes, Route } from "react-router-dom";
import { http } from "~/api";
import { Spinner } from "~/components";
import { useAuthStore } from "~/hooks";
import { CheckoutForm, CheckoutReturn } from "../../components";
import "./Checkout.scss";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
const appearance = { theme: "stripe" };
const loader = "always";

export const Checkout = () => {
  const { user } = useAuthStore();

  const [isLoading, setIsLoading] = React.useState(true);
  const [clientSecret, setClientSecret] = React.useState<string | null>(null);

  React.useEffect(() => {
    http
      .post("/api/payments/create-setup-intent/", { user_id: user?.id })
      .then((res) => setClientSecret(res.data.client_secret))
      .finally(() => setIsLoading(false));
  }, [user]);

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
