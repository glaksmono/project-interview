import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/format";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<{
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: string;
  }>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "buyer",
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const isPasswordMismatch =
    form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Password confirmation does not match.");
      return;
    }

    setLoading(true);
    try {
      await register(form);
      navigate("/login");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Start your business journey</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Company Name / Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Acme Corp"
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="email@perusahaan.co.id"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              required
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
              aria-invalid={isPasswordMismatch}
              required
            />
            {isPasswordMismatch && (
              <small style={{ color: "#dc2626" }}>
                Password confirmation does not match.
              </small>
            )}
          </div>
          <div className="form-group">
            <label>Role</label>
            <div className="role-selector">
              <label
                className={`role-option ${form.role === "buyer" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="role"
                  value="buyer"
                  checked={form.role === "buyer"}
                  onChange={handleChange}
                />
                <span className="role-icon">🛒</span>
                <span className="role-label">Buyer</span>
                <span className="role-desc">Buy products & manage orders</span>
              </label>
              <label
                className={`role-option ${form.role === "lender" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="role"
                  value="lender"
                  checked={form.role === "lender"}
                  onChange={handleChange}
                />
                <span className="role-icon">💰</span>
                <span className="role-label">Lender</span>
                <span className="role-desc">Fund loans & earn interest</span>
              </label>
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading || isPasswordMismatch}
          >
            {loading ? "Registering..." : "Register Now"}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
