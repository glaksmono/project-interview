import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getOrders } from "../api";
import { formatRupiah, formatDate, getErrorMessage } from "../utils/format";
import type { OrderSummary } from "../types";

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  confirmed: { label: "Confirmed", cls: "badge-success" },
  pending_funding: { label: "Pending Funding", cls: "badge-warning" },
  cancelled: { label: "Cancelled", cls: "badge-error" },
};

const LOAN_STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  open: { label: "Pending Funding", cls: "badge-warning" },
  funded: { label: "Funded", cls: "badge-success" },
  closed: { label: "Closed", cls: "badge-default" },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    getOrders()
      .then((res) => setOrders(res.data.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading orders...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h2>My Orders</h2>
        <Link to="/products" className="btn btn-primary btn-sm">
          + Buy Product
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <p>No orders yet.</p>
          <Link to="/products" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="order-list">
          {orders.map((order) => {
            const status = STATUS_LABELS[order.status] || {
              label: order.status,
              cls: "badge-default",
            };
            return (
              <Link
                key={order.id}
                to={"/orders/" + order.id}
                className="order-card"
              >
                <div className="order-card-header">
                  <div>
                    <h4>{order.product?.name}</h4>
                    <span className="text-muted text-sm">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                  <span className={"badge " + status.cls}>{status.label}</span>
                </div>
                <div className="order-card-body">
                  <div>
                    <span className="text-muted text-sm">Quantity</span>
                    <strong>{order.quantity} unit</strong>
                  </div>
                  <div>
                    <span className="text-muted text-sm">Total</span>
                    <strong>{formatRupiah(order.totalAmount)}</strong>
                  </div>
                  <div>
                    <span className="text-muted text-sm">Payment</span>
                    <strong>
                      {order.paymentMethod === "loan" ? "Loan" : "Direct"}
                    </strong>
                  </div>
                </div>
                {order.loanApplication && (
                  <div className="order-loan-summary">
                    <span className="text-sm">
                      Funds raised:{" "}
                      <strong>
                        {formatRupiah(order.loanApplication.fundedAmount)}
                      </strong>
                      {" / "}
                      {formatRupiah(order.totalAmount)}
                    </span>
                    {(() => {
                      const loanStatus = LOAN_STATUS_LABELS[
                        order.loanApplication.status
                      ] ?? {
                        label: order.loanApplication.status,
                        cls: "badge-default",
                      };
                      return (
                        <span className={"badge badge-sm " + loanStatus.cls}>
                          {loanStatus.label}
                        </span>
                      );
                    })()}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
