import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { http } from "~/api";
import { useAuthStore } from "~/hooks";
import "./Login.scss";

type LoginForm = {
  email: string;
  password: string;
};

export const Login = () => {
  const { getUser } = useAuthStore();
  const navigate = useNavigate();

  const [form, setForm] = React.useState<LoginForm>({
    email: "",
    password: "",
  });
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    http
      .post("/api/auth/login/", {
        username: form.email,
        password: form.password,
      })
      .then(() => {
        navigate("/");
        getUser();
      })
      .catch((err) => setError(Object.values(err.response?.data)[0] as string));
  };

  return (
    <div className="Login">
      <div className="Login__card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit} className="Login__form">
          <input
            id="email"
            placeholder="Email"
            name="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            id="password"
            placeholder="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {error && <p className="Login__formError">{error}</p>}
          <button type="submit" disabled={!form.email || !form.password}>
            Login
          </button>
        </form>
        <div className="Login__links">
          <p>
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
          <p>
            Forgot your password? <Link to="/reset-password">Reset Password</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
