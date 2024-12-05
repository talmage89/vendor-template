import * as React from "react";

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(form);
  };

  return (
    <div className="Signup">
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password1"
          name="password1"
          value={form.password1}
          onChange={(e) => setForm({ ...form, password1: e.target.value })}
        />
        <input
          type="password"
          name="password"
          value={form.password2}
          onChange={(e) => setForm({ ...form, password2: e.target.value })}
        />
        <button type="submit">Signup</button>
      </form>
    </div>
  );
};
