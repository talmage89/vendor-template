import clsx from "clsx";
import * as React from "react";
import { AddressElement, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeftIcon, ChevronRightIcon } from "lucide-react";
import { http } from "~/api";
import { useAuthStore, useCartStore, useCheckoutStore, useToast } from "~/hooks";
import { formatPrice } from "~/utils/format";
import "./CheckoutForm.scss";

const steps = ["Sign in", "Shipping Details", "Payment Details"];

export const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { cart, getTotalCents } = useCartStore();
  const {
    expectedTotal,
    isLoading,
    message,
    shipping,
    termsAccepted,
    handlePaymentSubmission,
    setTermsAccepted,
  } = useCheckoutStore();

  const [currentStep, setCurrentStep] = React.useState(0);

  function renderChildStep(stepIndex: number, children: React.ReactNode) {
    return (
      <div
        className={clsx("CheckoutForm__form__content", {
          "CheckoutForm__form__content--previous": currentStep > stepIndex,
          "CheckoutForm__form__content--hidden": currentStep <stepIndex,
        })}
      >
        {children}
      </div>
    );
  }

  if (!cart.length) {
    return <Navigate to="/cart" />;
  }

  return (
    <div className="CheckoutForm">
      <div className="CheckoutForm__form">
        <div className="CheckoutForm__form__header">
          <div
            onClick={() => {
              currentStep > 0 ? setCurrentStep(currentStep - 1) : navigate("/cart");
            }}
            className="CheckoutForm__form__back"
          >
            <ArrowLeftIcon />
            <p>Back</p>
          </div>
          <div className="CheckoutForm__form__steps">
            {steps.map((step, index) => (
              <React.Fragment key={step}>
                <p
                  onClick={() => {
                    currentStep > index && setCurrentStep(index);
                  }}
                  className={clsx("CheckoutForm__form__steps__step", {
                    "CheckoutForm__form__steps__step--active": currentStep === index,
                  })}
                >
                  {step}
                </p>
                {index < steps.length - 1 && (
                  <div className="CheckoutForm__form__steps__separator">
                    <ChevronRightIcon className="CheckoutForm__form__steps__separator__icon" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        {renderChildStep(0, <SignInStep />)}
        {renderChildStep(1, <ShippingDetailsStep />)}
        {renderChildStep(2, <PaymentDetailsStep />)}
        {currentStep < steps.length - 1 ? (
          <div className="CheckoutForm__form__submit__container">
            <button
              className="CheckoutForm__form__submit"
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              Next
            </button>
          </div>
        ) : (
          <div className="CheckoutForm__form__submit__container">
            {message && (
              <div id="payment-message" className="CheckoutForm__form__error">
                {message}
              </div>
            )}
            <div className="CheckoutForm__form__terms">
              <label>
                <input
                  type="checkbox"
                  required
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                />
                I agree to the <Link to="/terms">Terms of Service</Link> and{" "}
                <Link to="/privacy">Privacy Policy</Link>
              </label>
            </div>
            <button
              disabled={isLoading || !stripe || !elements || !termsAccepted}
              className="CheckoutForm__form__submit"
              onClick={() => {
                stripe && elements && handlePaymentSubmission({ stripe, elements, cart });
              }}
            >
              <span>Pay Now</span>
            </button>
            <p>Your payment method will be charged {formatPrice(expectedTotal)}.</p>
            <p>All transactions are secure and encrypted.</p>
          </div>
        )}
      </div>
      <div className="CheckoutForm__summary">
        <div className="CheckoutForm__summary__item">
          <p>Cart</p>
          <p>{formatPrice(getTotalCents())}</p>
          <p>Shipping</p>
          {shipping ? (
            <p>{formatPrice(shipping.shipping_cost)}</p>
          ) : (
            <p>Enter your shipping address</p>
          )}
          <p>Total</p>
          <p>{formatPrice(expectedTotal)}</p>
        </div>
      </div>
    </div>
  );
};

const SignInStep = () => {
  const { user } = useAuthStore();
  const { email, setEmail } = useCheckoutStore();

  const [error, setError] = React.useState(false);

  const verifyEmail = (email: string) => {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    setError(!valid);
    return valid;
  };

  if (user) {
    return null;
  }

  return (
    <div className="SignInStep CheckoutForm__form__content">
      <h3 className="CheckoutForm__form__subheader">Sign in to your account</h3>
      <button className="SignInStep__signinButton">Sign In</button>
      <p>
        Sign in to save time on checkout. If you don't have an account, you can create one{" "}
        <Link to="/signup">here</Link>.
      </p>
      <p>Or, enter your email below to checkout as a guest.</p>
      <div className="SignInStep__input">
        <label>Email Address</label>
        <input
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(false);
          }}
        />
        {error && <p className="SignInStep__input__error">Please enter a valid email address</p>}
      </div>
    </div>
  );
};

const ShippingDetailsStep = () => {
  const { setShipping } = useCheckoutStore();
  const toaster = useToast();

  const [addressValid, setAddressValid] = React.useState(false);

  return (
    <div className="ShippingDetailsStep CheckoutForm__form__content">
      <h3 className="CheckoutForm__form__subheader mb-6">Shipping Details</h3>
      <AddressElement
        id="address-element"
        options={{ mode: "shipping", autocomplete: { mode: "automatic" } }}
        onChange={(event) => {
          event.complete
            ? http
                .post("/api/fulfillment/shipping-costs/", {
                  country: event.value.address.country,
                })
                .then((res) => setShipping({ ...res.data, country: event.value.address.country }))
                .catch(() => {
                  toaster.error("Failed to get shipping costs.");
                  setShipping(null);
                })
            : setShipping(null);
          setAddressValid(event.complete);
        }}
      />
    </div>
  );
};

const PaymentDetailsStep = () => {
  const [paymentInputValid, setPaymentInputValid] = React.useState(false);

  return (
    <>
      <div className="PaymentDetailsStep CheckoutForm__form__content">
        <h3 className="CheckoutForm__form__subheader mb-6">Payment Details</h3>
        <PaymentElement
          id="payment-element"
          options={{ layout: "accordion" }}
          onChange={(event) => setPaymentInputValid(event.complete)}
        />
      </div>
      {/* <div className="CheckoutForm__form__submit__container">
        {message && (
          <div id="payment-message" className="CheckoutForm__form__error">
            {message}
          </div>
        )}
        <div className="CheckoutForm__form__terms">
          <label>
            <input type="checkbox" required onChange={(e) => setTermsAccepted(e.target.checked)} />I
            agree to the <Link to="/terms">Terms of Service</Link> and{" "}
            <Link to="/privacy">Privacy Policy</Link>
          </label>
        </div>
        <button
          disabled={isLoading || !stripe || !elements || !termsAccepted || !paymentInputValid}
          className="CheckoutForm__form__submit"
          onClick={handleSubmit}
        >
          <span>Pay Now</span>
        </button>
        <p>Your payment method will be charged {formatPrice(expectedTotal)}.</p>
        <p>All transactions are secure and encrypted.</p>
      </div> */}
    </>
  );
};
