import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { formatRupiah } from "../utils/format";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const loanTab = new URLSearchParams(location.search).get("tab");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) =>
    location.pathname.startsWith(path) ? "nav-link active" : "nav-link";

  const isActiveLoanTab = (tab: "marketplace" | "history") => {
    if (!location.pathname.startsWith("/loans")) return "nav-link";
    const isHistory = loanTab === "history";
    if (tab === "history") {
      return isHistory ? "nav-link active" : "nav-link";
    }
    return !isHistory ? "nav-link active" : "nav-link";
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🏭</span>
          <span>TradeFinance</span>
        </Link>

        {user && (
          <nav className="navbar-nav">
            {user.role === "buyer" && (
              <>
                <Link to="/products" className={isActive("/products")}>
                  Products
                </Link>
                <Link to="/orders" className={isActive("/orders")}>
                  Orders
                </Link>
              </>
            )}
            {user.role === "lender" && (
              <>
                <Link to="/loans" className={isActiveLoanTab("marketplace")}>
                  Marketplace
                </Link>
                <Link
                  to="/loans?tab=history"
                  className={isActiveLoanTab("history")}
                >
                  Funding History
                </Link>
              </>
            )}
          </nav>
        )}

        <div className="navbar-right">
          {user ? (
            <>
              <div className="navbar-wallet">
                <span className="wallet-label">Balance</span>
                <span className="wallet-amount">
                  {formatRupiah(user.walletBalance)}
                </span>
              </div>
              <div className="navbar-user">
                <span className="user-name">{user.name}</span>
                <span className={`role-badge ${user.role}`}>{user.role}</span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <div className="navbar-auth">
              <Link to="/login" className="btn btn-ghost btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
