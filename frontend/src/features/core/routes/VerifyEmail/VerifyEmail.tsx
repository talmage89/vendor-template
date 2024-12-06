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

  if (searchParams.get("token")) {
    return (
      <div className="VerifyEmail">
        <div className="VerifyEmail__verifying">
          <p>Verifying email...</p>
          <Spinner />
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
