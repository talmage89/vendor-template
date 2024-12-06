import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { http } from "~/api";
import "./Signup.scss";
import clsx from "clsx";

type SignupForm = {
  email: string;
  password1: string;
  password2: string;
};

export const Signup = () => {
  const [form, setForm] = React.useState<SignupForm>({
    email: "",
    password1: "",
    password2: "",
  });
  const [fieldErrors, setFieldErrors] = React.useState<Partial<SignupForm>>({});
  const [formError, setFormError] = React.useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});
    setFormError(null);
    http
      .post("/api/auth/signup/", form)
      .then(() => navigate("/verify-email"))
      .catch((err) => {
        setFieldErrors(() => {
          const errs: Partial<SignupForm> = {};
          for (const key in err.response?.data) {
            if (key in form) {
              errs[key as keyof SignupForm] = err.response?.data[key];
            }
          }
          return errs;
        });
        setFormError(() => {
          let error = null;
          for (const key in err.response?.data) {
            if (!(key in form)) {
              error = err.response?.data[key];
            }
          }
          return error;
        });
      });
  };

  return (
    <div className="Signup">
      <div className="Signup__card">
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit} className="Signup__form">
          <span className="flex flex-col gap-1">
            <input
              className={clsx(
                "Signup__form__input",
                fieldErrors.email && "Signup__form__input--error"
              )}
              id="email"
              placeholder="Email"
              name="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {fieldErrors.email && <p className="Signup__fieldError">{fieldErrors.email}</p>}
          </span>
          <span className="flex flex-col gap-1">
            <input
              className={clsx(
                "Signup__form__input",
                fieldErrors.password1 && "Signup__form__input--error"
              )}
              id="password1"
              placeholder="Password"
              type="password"
              name="password1"
              value={form.password1}
              onChange={(e) => setForm({ ...form, password1: e.target.value })}
            />
            {fieldErrors.password1 && <p className="Signup__fieldError">{fieldErrors.password1}</p>}
          </span>
          <span className="flex flex-col gap-1">
            <input
              className={clsx(
                "Signup__form__input",
                fieldErrors.password2 && "Signup__form__input--error"
              )}
              id="password2"
              placeholder="Confirm Password"
              type="password"
              name="password2"
              value={form.password2}
              onChange={(e) => setForm({ ...form, password2: e.target.value })}
            />
            {fieldErrors.password2 && <p className="Signup__fieldError">{fieldErrors.password2}</p>}
          </span>
          {formError && <p className="Signup__formError">{formError}</p>}
          <button type="submit" disabled={!form.email || !form.password1 || !form.password2}>
            Signup
          </button>
        </form>
        <div className="Signup__links">
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
