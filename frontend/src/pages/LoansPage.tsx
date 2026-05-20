import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { getLoans, getLoanFundingHistory } from "../api";
import { formatRupiah, formatDate, getErrorMessage } from "../utils/format";
import type { LoanSummary, LoanFundingHistoryItem } from "../types";

type LoanTab = "marketplace" | "history";

function formatLoanStatus(status: string): string {
  switch (status) {
    case "open":
      return "Open";
    case "funded":
      return "Funded";
    case "repaid":
      return "Repaid";
    case "expired":
      return "Expired";
    default:
      return status;
  }
}

export default function LoansPage() {
  const location = useLocation();
  const tabParam = new URLSearchParams(location.search).get("tab");
  const activeTab: LoanTab = tabParam === "history" ? "history" : "marketplace";
  const [loans, setLoans] = useState<LoanSummary[]>([]);
  const [history, setHistory] = useState<LoanFundingHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    setError("");

    const request =
      activeTab === "marketplace"
        ? getLoans().then((res) => setLoans(res.data.data))
        : getLoanFundingHistory().then((res) => setHistory(res.data.data));

    request
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [activeTab]);

  return (
    <div className="page">
      <div className="page-header">
        <h2>
          {activeTab === "marketplace"
            ? "Loan Marketplace"
            : "My Funding History"}
        </h2>
        <p>
          {activeTab === "marketplace"
            ? `${loans.length} open loans`
            : `${history.length} funding records`}
        </p>
      </div>

      {loading && <div className="loading">Loading loans...</div>}
      {error && !loading && <div className="alert alert-error">{error}</div>}

      {!loading && !error && activeTab === "marketplace" && (
        <>
          {loans.length === 0 ? (
            <div className="empty-state">
              No open loans available right now.
            </div>
          ) : (
            <div className="loan-list">
              {loans.map((loan) => {
                const rawFundedPct =
                  loan.requestedAmount > 0
                    ? Math.round(
                        (loan.fundedAmount / loan.requestedAmount) * 100,
                      )
                    : 0;
                const fundedPct = Math.max(0, Math.min(100, rawFundedPct));

                return (
                  <Link
                    key={loan.id}
                    to={"/loans/" + loan.id}
                    className="loan-card"
                  >
                    <div className="loan-card-header">
                      <div>
                        <h4>{loan.borrower?.name}</h4>
                        <span className="text-muted text-sm">
                          {formatDate(loan.createdAt)}
                        </span>
                      </div>
                      <span className="badge badge-warning">
                        {formatLoanStatus(loan.status)}
                      </span>
                    </div>
                    <div className="loan-card-amounts">
                      <div>
                        <span className="text-muted text-sm">Requested</span>
                        <strong>{formatRupiah(loan.requestedAmount)}</strong>
                      </div>
                      <div>
                        <span className="text-muted text-sm">Funded</span>
                        <strong className="text-success">
                          {formatRupiah(loan.fundedAmount)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-muted text-sm">Remaining</span>
                        <strong className="text-primary">
                          {formatRupiah(loan.remainingAmount)}
                        </strong>
                      </div>
                    </div>
                    <div className="progress-bar-wrapper">
                      <div className="progress-bar-label">
                        <span>Progress</span>
                        <span>{fundedPct}%</span>
                      </div>
                      <div className="progress-bar-bg">
                        <div
                          className="progress-bar-fill"
                          style={{ width: fundedPct + "%" }}
                        />
                      </div>
                    </div>
                    <div className="loan-card-meta">
                      <span>
                        Term: <strong>{loan.termMonths} mo</strong>
                      </span>
                      <span>
                        Interest:{" "}
                        <strong>{(loan.interestRate * 100).toFixed(1)}%</strong>
                      </span>
                      <span>
                        Installment:{" "}
                        <strong>
                          {formatRupiah(loan.monthlyInstallment)}/mo
                        </strong>
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}

      {!loading && !error && activeTab === "history" && (
        <>
          {history.length === 0 ? (
            <div className="empty-state">
              You have not funded any loans yet.
            </div>
          ) : (
            <div className="history-list">
              {history.map((item) => {
                const badgeClass =
                  item.loan.status === "funded"
                    ? "badge-success"
                    : item.loan.status === "open"
                      ? "badge-warning"
                      : "badge-default";

                return (
                  <div key={item.id} className="history-card">
                    <div className="history-card-header">
                      <div>
                        <h4>{item.product?.name ?? "Unknown Product"}</h4>
                        <span className="text-muted text-sm">
                          Funded on {formatDate(item.fundedAt)}
                        </span>
                      </div>
                      <span className={"badge " + badgeClass}>
                        {formatLoanStatus(item.loan.status)}
                      </span>
                    </div>

                    <div className="history-card-body">
                      <div>
                        <span className="text-muted text-sm">Contributed</span>
                        <strong>{formatRupiah(item.amount)}</strong>
                      </div>
                      <div>
                        <span className="text-muted text-sm">
                          Estimated Return
                        </span>
                        <strong>
                          {formatRupiah(item.estimatedReturnAmount)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-muted text-sm">
                          Estimated Profit
                        </span>
                        <strong className="text-success">
                          {formatRupiah(item.estimatedProfit)}
                        </strong>
                      </div>
                    </div>

                    <div className="history-card-meta">
                      <span>
                        Borrower: <strong>{item.borrower?.name ?? "-"}</strong>
                      </span>
                      <span>
                        Product:{" "}
                        <strong>{item.product?.category ?? "-"}</strong>
                      </span>
                      <span>
                        Loan Term: <strong>{item.loan.termMonths} mo</strong>
                      </span>
                      <span>
                        Interest:{" "}
                        <strong>
                          {(item.loan.interestRate * 100).toFixed(1)}%
                        </strong>
                      </span>
                    </div>

                    <div className="history-card-actions">
                      <Link
                        to={"/loans/" + item.loan.id}
                        className="btn btn-outline btn-sm"
                      >
                        View Loan
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
