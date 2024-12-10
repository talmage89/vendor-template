import * as React from "react";
import { AddressElement, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import "./CheckoutForm.scss";

type CheckoutFormProps = {
  dpmCheckerLink: string | null;
};

export const CheckoutForm = ({ dpmCheckerLink }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: "http://localhost:5173/complete",
      },
    });

    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message ?? "An unexpected error occurred.");
    } else {
      setMessage("An unexpected error occurred.");
    }

    setIsLoading(false);
  };

  return (
    <div className="CheckoutForm">
      <form id="payment-form" onSubmit={handleSubmit} className="CheckoutForm__form">
        <AddressElement id="address-element" options={{ mode: "shipping" }} />
        <PaymentElement id="payment-element" options={{ layout: "accordion" }} />
        <button disabled={isLoading || !stripe || !elements} id="submit">
          <span id="button-text">
            {isLoading ? <div className="spinner" id="spinner"></div> : "Pay now"}
          </span>
        </button>
        {message && <div id="payment-message">{message}</div>}
      </form>
      {/* [TODO]: Remove for production */}
      <div id="dpm-annotation">
        <p>
          Payment methods are dynamically displayed based on customer location, order amount, and
          currency.&nbsp;
          <a
            href={dpmCheckerLink ?? ""}
            target="_blank"
            rel="noopener noreferrer"
            id="dpm-integration-checker"
          >
            Preview payment methods by transaction
          </a>
        </p>
      </div>
    </div>
  );
};
