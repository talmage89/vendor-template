import * as React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { http } from "~/api";
import { Spinner } from "~/components";
import { useToast } from "~/hooks";
import "./VerifyEmail.scss";

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toaster = useToast();

  const [verifying, setVerifying] = React.useState(false);
  const [newEmailRequested, setNewEmailRequested] = React.useState(false);

  React.useEffect(() => {
    const token = searchParams.get("token");
    if (token && !verifying) {
      setVerifying(true);
      verifyEmail(token);
    }

    return () => setVerifying(false);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    Promise.all([
      http.post("/api/auth/verify-email/", { token }),
      new Promise((resolve) => setTimeout(resolve, 500)),
    ])
      .then(() => {
        toaster.success("Email verified successfully. Please log in.");
        navigate("/login");
      })
      .catch((err) => toaster.error(err.response?.data?.error))
      .finally(() => setVerifying(false));
  };

  const requestNewVerificationEmail = () => {
    setNewEmailRequested(true);
    http
      .post("/api/auth/request-new-verification-email/", { token: searchParams.get("token") })
      .then(() => toaster.success("New verification email sent"))
      .catch((error) => {
        if (error.response?.status === 429) {
          const secondsRemaining = error.response.data.seconds_remaining;
          const minutes = Math.ceil(secondsRemaining / 60);
          toaster.error(
            `Please wait ${minutes} minute${
              minutes > 1 ? "s" : ""
            } before requesting another verification email`
          );
        } else {
          toaster.error("Failed to request new verification email");
        }
      })
  };

  if (searchParams.get("token")) {
    return verifying ? (
      <div className="VerifyEmail">
        <div className="VerifyEmail__verifying">
          <p>Verifying email...</p>
          <Spinner />
        </div>
      </div>
    ) : newEmailRequested ? (
      <div className="VerifyEmail">
        <div className="VerifyEmail__message">
          <h2>New verification email sent!</h2>
          <p>Please check your email for a new verification link.</p>
          <button onClick={requestNewVerificationEmail}>Request new verification email</button>
        </div>
      </div>
    ) : (
      <div className="VerifyEmail">
        <div className="VerifyEmail__message">
          <h2>Sorry, something went wrong.</h2>
          <p>You can request a new verification email by clicking the button below.</p>
          <button onClick={requestNewVerificationEmail}>Request new verification email</button>
        </div>
      </div>
    );
  }

  return (
    <div className="VerifyEmail">
      <div className="VerifyEmail__message">
        <h2>Verify your email</h2>
        <p>Almost there! Please check your email for a verification link.</p>
      </div>
    </div>
  );
};
