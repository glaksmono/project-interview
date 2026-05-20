import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createOrder } from "../api";
import { useAuth } from "../context/AuthContext";
import { formatRupiah, getErrorMessage } from "../utils/format";
import type { Product } from "../types";

export default function OrderModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const { user, updateWalletBalance } = useAuth();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<string>("direct");
  const [termMonths, setTermMonths] = useState<number>(6);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const total = product.price * quantity;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const normalizedQuantity = Number(quantity);
    if (
      !Number.isInteger(normalizedQuantity) ||
      normalizedQuantity < 1 ||
      normalizedQuantity > product.stockQuantity
    ) {
      setError("Please enter a valid quantity within available stock.");
      return;
    }
    setLoading(true);

    try {
      const payload: {
        product_id: string;
        quantity: number;
        payment_method: "direct" | "loan";
        loan_term_months?: number;
      } = {
        product_id: product.id,
        quantity: normalizedQuantity,
        payment_method: paymentMethod as "direct" | "loan",
      };
      if (paymentMethod === "loan") {
        payload.loan_term_months = Number(termMonths);
      }
      const res = await createOrder(payload);
      if (res.data.walletBalanceAfter !== undefined) {
        updateWalletBalance(res.data.walletBalanceAfter);
      }
      onClose();
      navigate("/orders");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create Order</h3>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="order-product-info">
            <span className="badge">{product.category}</span>
            <h4>{product.name}</h4>
            <p className="text-muted">{product.description}</p>
            <div className="order-price-unit">
              {formatRupiah(product.price)} / unit
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                min={1}
                max={product.stockQuantity}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
              />
              <span className="form-hint">
                Stock available: {product.stockQuantity}
              </span>
            </div>

            <div className="form-group">
              <label>Payment Method</label>
              <div className="payment-selector">
                <label
                  className={`payment-option ${paymentMethod === "direct" ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="direct"
                    checked={paymentMethod === "direct"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>💳 Direct Payment</span>
                  <span className="text-muted text-sm">
                    Deduct from wallet balance now
                  </span>
                </label>
                <label
                  className={`payment-option ${paymentMethod === "loan" ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="loan"
                    checked={paymentMethod === "loan"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>🏦 Loan</span>
                  <span className="text-muted text-sm">
                    Pay in installments via lender
                  </span>
                </label>
              </div>
            </div>

            {paymentMethod === "loan" && (
              <div className="form-group">
                <label>Installment Term (months)</label>
                <select
                  value={termMonths}
                  onChange={(e) => setTermMonths(parseInt(e.target.value))}
                >
                  {[1, 2, 3, 6, 9, 12].map((m) => (
                    <option key={m} value={m}>
                      {m} months
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="order-summary">
              <div className="order-summary-row">
                <span>Subtotal</span>
                <span>{formatRupiah(total)}</span>
              </div>
              {paymentMethod === "direct" && (
                <div className="order-summary-row text-muted text-sm">
                  <span>Your wallet balance</span>
                  <span>{formatRupiah(user?.walletBalance)}</span>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Processing..." : "Confirm Order"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
