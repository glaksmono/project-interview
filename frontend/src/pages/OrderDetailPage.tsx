import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderById } from "../api";
import { formatRupiah, formatDate, getErrorMessage } from "../utils/format";
import type { OrderDetail } from "../types";

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  confirmed: { label: "Confirmed", cls: "badge-success" },
  pending_funding: { label: "Pending Funding", cls: "badge-warning" },
  cancelled: { label: "Cancelled", cls: "badge-error" },
};

const LOAN_STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  open: { label: "Open", cls: "badge-warning" },
  funded: { label: "Funded", cls: "badge-success" },
  closed: { label: "Closed", cls: "badge-default" },
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    getOrderById(id!)
      .then((res) => setOrder(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading">Loading order details...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!order) return null;

  const status = STATUS_LABELS[order.status] || {
    label: order.status,
    cls: "badge-default",
  };
  const loan = order.loanApplication;

  return (
    <div className="page page-narrow">
      <div className="page-back">
        <Link to="/orders">Back to Orders</Link>
      </div>

      <div className="detail-card">
        <div className="detail-card-header">
          <div>
            <h2>{order.product?.name}</h2>
            <span className="text-muted text-sm">ID: {order.id}</span>
          </div>
          <span className={"badge " + status.cls}>{status.label}</span>
        </div>
        <div className="detail-grid">
          <div className="detail-item">
            <span>Order Date</span>
            <strong>{formatDate(order.createdAt)}</strong>
          </div>
          <div className="detail-item">
            <span>Quantity</span>
            <strong>{order.quantity} unit</strong>
          </div>
          <div className="detail-item">
            <span>Unit Price</span>
            <strong>{formatRupiah(order.unitPrice)}</strong>
          </div>
          <div className="detail-item">
            <span>Total</span>
            <strong className="text-primary">
              {formatRupiah(order.totalAmount)}
            </strong>
          </div>
          <div className="detail-item">
            <span>Payment Method</span>
            <strong>
              {order.paymentMethod === "loan" ? "Loan" : "Direct"}
            </strong>
          </div>
        </div>
      </div>

      {loan && (
        <div className="detail-card">
          <h3>Loan Details</h3>
          {(() => {
            const loanStatus = LOAN_STATUS_LABELS[loan.status] || {
              label: loan.status,
              cls: "badge-default",
            };
            const fundedPct =
              loan.requestedAmount > 0
                ? Math.round((loan.fundedAmount / loan.requestedAmount) * 100)
                : 0;
            return (
              <>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span>Loan Status</span>
                    <span className={"badge " + loanStatus.cls}>
                      {loanStatus.label}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span>Loan Amount</span>
                    <strong>{formatRupiah(loan.requestedAmount)}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Funded</span>
                    <strong>{formatRupiah(loan.fundedAmount)}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Remaining</span>
                    <strong>{formatRupiah(loan.remainingAmount)}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Term</span>
                    <strong>{loan.termMonths} months</strong>
                  </div>
                  <div className="detail-item">
                    <span>Interest</span>
                    <strong>{(loan.interestRate * 100).toFixed(1)}%</strong>
                  </div>
                </div>
                <div className="progress-bar-wrapper">
                  <div className="progress-bar-label">
                    <span>Funding Progress</span>
                    <span>{fundedPct}%</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{ width: fundedPct + "%" }}
                    />
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {loan?.repaymentSchedule && loan.repaymentSchedule.length > 0 && (
        <div className="detail-card">
          <h3>Installment Schedule</h3>
          <p className="text-muted text-sm">
            Monthly installment:{" "}
            <strong>{formatRupiah(loan.monthlyInstallment)}</strong>
          </p>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loan.repaymentSchedule.map((inst) => (
                <tr key={inst.installmentNumber}>
                  <td>{inst.installmentNumber}</td>
                  <td>{formatRupiah(inst.amount)}</td>
                  <td>{formatDate(inst.dueDate)}</td>
                  <td>
                    <span
                      className={
                        "badge badge-sm " +
                        (inst.status === "paid"
                          ? "badge-success"
                          : "badge-default")
                      }
                    >
                      {inst.status === "paid" ? "Paid" : "Unpaid"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
