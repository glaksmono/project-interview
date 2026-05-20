import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/format";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<{ email: string; password: string }>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === "lender" ? "/loans" : "/products");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Login</h1>
        <p className="auth-subtitle">Welcome back</p>
        {error && (
          <div className="alert alert-error" role="alert" aria-live="assertive">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <input
              type="email"
              id="login-email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="email@perusahaan.co.id"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              type="password"
              id="login-password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? "Processing..." : "Login"}
          </button>
        </form>
        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register now</Link>
        </p>
      </div>
    </div>
  );
}
