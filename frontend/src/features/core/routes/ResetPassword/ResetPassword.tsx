import * as React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { http } from "~/api";
import { useToast } from "~/hooks";
import "./ResetPassword.scss";

export const ResetPassword = () => {
  const [form, setForm] = React.useState({
    email: "",
    password1: "",
    password2: "",
  });
  const [hasRequested, setHasRequested] = React.useState(false);
  const [countdownSeconds, setCountdownSeconds] = React.useState(0);

  const [searchParams] = useSearchParams();
  const toaster = useToast();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (countdownSeconds <= 0) return;
    const timeout = setTimeout(() => {
      setCountdownSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [countdownSeconds]);

  const handleRequestResetLink = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    http
      .post("/api/auth/request-password-reset/", { email: form.email })
      .then(() => setCountdownSeconds(300))
      .catch((error) => {
        if (error.response?.status === 429) {
          const secondsRemaining = error.response.data.seconds_remaining;
          const minutes = Math.ceil(secondsRemaining / 60);
          toaster.error(
            `Please wait ${minutes} minute${
              minutes > 1 ? "s" : ""
            } before requesting another reset link`
          );
          setCountdownSeconds(secondsRemaining);
        } else {
          toaster.error("Failed to request password reset");
        }
      })
      .finally(() => setHasRequested(true));
  };

  const handleResetPassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    http
      .post("/api/auth/reset-password/", {
        token: searchParams.get("token"),
        password1: form.password1,
        password2: form.password2,
      })
      .then(() => {
        toaster.success("Password reset successfully. You may now login.");
        navigate("/login");
      })
      .catch((error) => toaster.error(error.response.data.error));
  };

  function getMinutesWithLabel(seconds: number) {
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  }

  if (searchParams.get("token")) {
    return (
      <div>
        <h2>Reset your password</h2>
        <p>Please enter your new password below.</p>
        <form onSubmit={handleResetPassword}>
          <input
            type="password"
            name="password1"
            placeholder="New password"
            value={form.password1}
            onChange={(e) => setForm({ ...form, password1: e.target.value })}
          />
          <input
            type="password"
            name="password2"
            placeholder="Confirm password"
            value={form.password2}
            onChange={(e) => setForm({ ...form, password2: e.target.value })}
          />
          <button type="submit" disabled={!form.password1 || !form.password2}>
            Reset password
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="ResetPassword">
      <div className="ResetPassword__card">
        <h2>Forgot your password?</h2>
        <div className="ResetPassword__text">
          <p>Please enter your email below.</p>
          <p>If an account exists with the given email, you will receive a reset link.</p>
          <p>Make sure to check your spam folder.</p>
        </div>
        <form onSubmit={handleRequestResetLink} className="ResetPassword__form">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <button type="submit" disabled={!form.email || countdownSeconds > 0}>
            Reset
          </button>
        </form>
        {countdownSeconds > 0 ? (
          <p>
            You may request a new reset link in{" "}
            <span className="ResetPassword__countdown">
              {getMinutesWithLabel(countdownSeconds)}
            </span>
            .
          </p>
        ) : (
          hasRequested && (
            <div className="ResetPassword__text">
              <p>
                If you still haven't received the reset link, you may request another by submitting
                your email again.
              </p>
              <p>
                Alternatively, you can try creating a new account{" "}
                <Link className="ResetPassword__link" to="/signup">
                  here.
                </Link>
              </p>
            </div>
          )
        )}
        <Link className="ResetPassword__link" to="/login">
          Back to login
        </Link>
      </div>
    </div>
  );
};
