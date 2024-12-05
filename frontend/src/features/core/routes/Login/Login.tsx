import * as React from "react";
import { http } from "~/api";
import { useAuthStore } from "~/hooks";

type LoginForm = {
  email: string;
  password: string;
};

export const Login = () => {
  const { getUser } = useAuthStore();

  const [form, setForm] = React.useState<LoginForm>({
    email: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    http
      .post("/api/token/", {
        username: form.email,
        password: form.password,
      })
      .then(() => getUser())
      .catch(console.error);
  };

  return (
    <div className="Login">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};
