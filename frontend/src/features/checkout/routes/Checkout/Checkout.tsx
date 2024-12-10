import * as React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { Appearance, loadStripe } from "@stripe/stripe-js";
import { Routes, Route } from "react-router-dom";
import { http } from "~/api";
import { Spinner } from "~/components";
import { useCartStore } from "~/hooks";
import { CheckoutForm, CheckoutReturn } from "../../components";
import "./Checkout.scss";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
const appearance = { theme: "stripe" };
const loader = "always";

export const Checkout = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [clientSecret, setClientSecret] = React.useState<string | null>(null);
  const [dpmCheckerLink, setDpmCheckerLink] = React.useState<string | null>(null);

  const { cart } = useCartStore();

  React.useEffect(() => {
    if (!cart.length) return;
    http
      .post("/api/payments/create-payment-intent/", {
        cart: cart.map((item) => ({
          clothing: item.clothing.id,
          quantity: item.quantity,
          size: item.size.id,
          color: item.color.id,
        })),
      })
      .then((res) => {
        setClientSecret(res.data.client_secret);
        setDpmCheckerLink(res.data.dpm_checker_link);
        setIsLoading(false);
      });
  }, [cart]);

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
            <Route path="/" element={<CheckoutForm dpmCheckerLink={dpmCheckerLink} />} />
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
