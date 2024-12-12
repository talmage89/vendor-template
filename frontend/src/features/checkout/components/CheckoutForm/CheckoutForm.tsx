import * as React from "react";
import { AddressElement, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import "./CheckoutForm.scss";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeftIcon, ChevronRightIcon } from "lucide-react";
import { useWizard, Wizard } from "react-use-wizard";
import clsx from "clsx";
import { Address } from "@stripe/stripe-js";
import { http } from "~/api";
import { useCartStore } from "~/hooks";
import { formatPrice } from "~/utils/format";

type CheckoutFormProps = {
  dpmCheckerLink?: string;
};

const steps = ["Sign in", "Shipping Details", "Payment Details"];

const shippingMethods = {
  us: 1000,
  uk: 1200,
  eu: 1200,
  other: 1500,
};

export const CheckoutForm = (props: CheckoutFormProps) => {
  const { cart, getTotalCents } = useCartStore();

  const [email, setEmail] = React.useState("");
  const [shipping, setShipping] = React.useState<{ country: string; priceCents: number } | null>(
    null
  );
  const [expectedTotal, setExpectedTotal] = React.useState(0);

  React.useEffect(() => {
    setExpectedTotal(getTotalCents() + (shipping?.priceCents || 0));
  }, [cart, shipping]);

  const handleAddressChange = (address: Address | null) => {
    if (address) {
      const country = address.country?.toLowerCase();
      const shippingMethod = shippingMethods[country as keyof typeof shippingMethods];
      country && setShipping({ country, priceCents: shippingMethod });
    } else {
      setShipping(null);
    }
  };

  if (!cart.length) {
    return <Navigate to="/cart" />;
  }

  return (
    <Wizard wrapper={<CheckoutFormWrapper shipping={shipping} expectedTotal={expectedTotal} />}>
      <SignInStep email={email} setEmail={setEmail} />
      <ShippingDetailsStep onAddressChange={handleAddressChange} />
      <PaymentDetailsStep expectedTotal={expectedTotal} />
    </Wizard>
  );
};

export const CheckoutFormWrapper = (props: any) => {
  const navigate = useNavigate();
  const wizard = useWizard();
  const { getTotalCents } = useCartStore();

  return (
    <div className="CheckoutForm">
      <div className="CheckoutForm__form">
        <div className="CheckoutForm__form__header">
          <div
            onClick={() => {
              wizard.activeStep > 0 ? wizard.previousStep() : navigate("/cart");
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
                    wizard.activeStep > index && wizard.goToStep(index);
                  }}
                  className={clsx("CheckoutForm__form__steps__step", {
                    "CheckoutForm__form__steps__step--active": wizard.activeStep === index,
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
        {props.children}
      </div>
      <div className="CheckoutForm__summary">
        <div className="CheckoutForm__summary__item">
          <p>Cart</p>
          <p>{formatPrice(getTotalCents())}</p>
          <p>Shipping</p>
          {props.shipping ? (
            <p>{formatPrice(props.shipping.priceCents)}</p>
          ) : (
            <p>Enter your shipping address</p>
          )}
          <p>Total</p>
          <p>{formatPrice(props.expectedTotal)}</p>
        </div>
      </div>
    </div>
  );
};

type SignInStepProps = {
  email: string;
  setEmail: (email: string) => void;
};

const SignInStep = (props: SignInStepProps) => {
  const wizard = useWizard();

  const [error, setError] = React.useState(false);

  const verifyEmail = (email: string) => {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    setError(!valid);
    return valid;
  };

  return (
    <>
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
            value={props.email}
            onChange={(e) => {
              props.setEmail(e.target.value);
              setError(false);
            }}
          />
          {error && <p className="SignInStep__input__error">Please enter a valid email address</p>}
        </div>
      </div>
      <div className="CheckoutForm__form__submit__container">
        <button
          className="CheckoutForm__form__submit"
          disabled={!props.email}
          onClick={() => {
            if (verifyEmail(props.email)) {
              wizard.nextStep();
            }
          }}
        >
          <span>Next</span>
        </button>
      </div>
    </>
  );
};

type ShippingDetailsStepProps = {
  onAddressChange: (address: Address | null) => void;
};

const ShippingDetailsStep = (props: ShippingDetailsStepProps) => {
  const wizard = useWizard();

  const [addressValid, setAddressValid] = React.useState(false);

  return (
    <>
      <div className="ShippingDetailsStep CheckoutForm__form__content">
        <h3 className="CheckoutForm__form__subheader mb-6">Shipping Details</h3>
        <AddressElement
          id="address-element"
          options={{ mode: "shipping", autocomplete: { mode: "automatic" } }}
          onChange={(event) => {
            event.complete
              ? props.onAddressChange(event.value.address)
              : props.onAddressChange(null);
            setAddressValid(event.complete);
          }}
        />
      </div>
      <div className="CheckoutForm__form__submit__container">
        <button
          className="CheckoutForm__form__submit"
          disabled={!addressValid}
          onClick={() => addressValid && wizard.nextStep()}
        >
          <span>Next</span>
        </button>
      </div>
    </>
  );
};

type PaymentDetailsStepProps = {
  expectedTotal: number;
};

const PaymentDetailsStep = (props: PaymentDetailsStepProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { cart } = useCartStore();

  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const [paymentInputValid, setPaymentInputValid] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  async function handleSubmit() {
    if (!cart.length || !stripe || !elements || !termsAccepted) return;
    setIsLoading(true);
    http.post("/api/payments/create-payment-intent/", {
      cart: cart.map((item) => ({
        clothing: item.clothing.id,
        quantity: item.quantity,
        size: item.size.id,
        color: item.color.id,
      })),
      expected_total: props.expectedTotal,
    });
    setIsLoading(false);
  }

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
      <div className="CheckoutForm__form__submit__container">
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
        <p>Your payment method will be charged {formatPrice(props.expectedTotal)}.</p>
        <p>All transactions are secure and encrypted.</p>
      </div>
    </>
  );
};
