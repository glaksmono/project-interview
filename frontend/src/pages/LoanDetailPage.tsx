import { useState, useEffect, useCallback, type FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import { getLoanById, fundLoan } from "../api";
import { useAuth } from "../context/AuthContext";
import { formatRupiah, formatDate, getErrorMessage } from "../utils/format";
import type { LoanDetail } from "../types";

export default function LoanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, updateWalletBalance } = useAuth();
  const [loan, setLoan] = useState<LoanDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [fundAmount, setFundAmount] = useState<string | number>("");
  const [funding, setFunding] = useState<boolean>(false);
  const [fundError, setFundError] = useState<string>("");
  const [fundSuccess, setFundSuccess] = useState<string>("");

  const fetchLoan = useCallback(() => {
    setLoading(true);
    getLoanById(id!)
      .then((res) => setLoan(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchLoan();
  }, [fetchLoan]);

  const handleFund = async (e: FormEvent) => {
    e.preventDefault();
    setFundError("");
    setFundSuccess("");
    setFunding(true);
    try {
      const res = await fundLoan(id!, Number(fundAmount));
      updateWalletBalance(res.data.walletBalanceAfter);
      setFundSuccess("Successfully funded " + formatRupiah(Number(fundAmount)));
      setFundAmount("");
      fetchLoan();
    } catch (err) {
      setFundError(getErrorMessage(err));
    } finally {
      setFunding(false);
    }
  };

  if (loading) return <div className="loading">Loading loan details...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!loan) return null;

  const rawFundedPct =
    loan.requestedAmount > 0
      ? Math.round((loan.fundedAmount / loan.requestedAmount) * 100)
      : 0;
  const fundedPct = Math.max(0, Math.min(100, rawFundedPct));

  const maxFund = Math.min(loan.remainingAmount, user?.walletBalance || 0);

  return (
    <div className="page page-narrow">
      <div className="page-back">
        <Link to="/loans">Back to Marketplace</Link>
      </div>

      <div className="detail-card">
        <div className="detail-card-header">
          <div>
            <h2>{loan.borrower?.name}</h2>
            <span className="text-muted text-sm">ID: {loan.id}</span>
          </div>
          <span
            className={`badge badge-${loan.status === "open" ? "warning" : "success"}`}
          >
            {loan.status}
          </span>
        </div>

        <div className="detail-grid">
          <div className="detail-item">
            <span>Loan Date</span>
            <strong>{formatDate(loan.createdAt)}</strong>
          </div>
          <div className="detail-item">
            <span>Loan Amount</span>
            <strong>{formatRupiah(loan.requestedAmount)}</strong>
          </div>
          <div className="detail-item">
            <span>Funded</span>
            <strong className="text-success">
              {formatRupiah(loan.fundedAmount)}
            </strong>
          </div>
          <div className="detail-item">
            <span>Remaining Needed</span>
            <strong className="text-primary">
              {formatRupiah(loan.remainingAmount)}
            </strong>
          </div>
          <div className="detail-item">
            <span>Term</span>
            <strong>{loan.termMonths} months</strong>
          </div>
          <div className="detail-item">
            <span>Interest</span>
            <strong>{(loan.interestRate * 100).toFixed(1)}%</strong>
          </div>
          <div className="detail-item">
            <span>Installment / Month</span>
            <strong>{formatRupiah(loan.monthlyInstallment)}</strong>
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
      </div>

      {loan.status === "open" && (
        <div className="detail-card">
          <h3>Fund This Loan</h3>
          <p className="text-muted text-sm">
            Your wallet balance:{" "}
            <strong>{formatRupiah(user?.walletBalance)}</strong>
          </p>
          {fundError && <div className="alert alert-error">{fundError}</div>}
          {fundSuccess && (
            <div className="alert alert-success">{fundSuccess}</div>
          )}
          <form onSubmit={handleFund} className="fund-form">
            <div className="form-group">
              <label>Funding Amount (Rp)</label>
              <input
                type="number"
                min={1}
                max={maxFund}
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                placeholder={"Max. " + formatRupiah(maxFund)}
                required
              />
              <span className="form-hint">
                Maximum: {formatRupiah(loan.remainingAmount)} (remaining needed)
              </span>
            </div>
            <div className="fund-quick-btns">
              {[25, 50, 75, 100].map((pct) => {
                const val = Math.floor((loan.remainingAmount * pct) / 100);
                return (
                  <button
                    key={pct}
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setFundAmount(Math.min(val, maxFund))}
                  >
                    {pct}%
                  </button>
                );
              })}
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={funding || !fundAmount}
            >
              {funding ? "Processing..." : "Fund Now"}
            </button>
          </form>
        </div>
      )}

      {loan.fundings?.length > 0 && (
        <div className="detail-card">
          <h3>Funding History</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Lender</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loan.fundings.map((f) => (
                <tr key={f.id}>
                  <td>{f.lender?.name}</td>
                  <td>{formatRupiah(f.amount)}</td>
                  <td>{formatDate(f.fundedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
