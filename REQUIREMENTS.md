# Requirements

## 1. Authentication

- Users register with: `name`, `email`, `password`, `role` (`buyer` | `lender`)
- Login returns a JWT
- All non-auth endpoints require a valid JWT
- Role-based access is enforced on every endpoint

---

## 2. Seed Data

Provide a database migration or seed script that creates:

- At least **10 products** across at least 3 categories (e.g., machinery, office supplies, raw materials)
  - Fields: `name`, `description`, `price`, `stock_quantity`, `category`
- Every registered user starts with a wallet balance of **Rp 500,000,000**
  - This can be applied at registration time, not via a separate migration

---

## 3. Products

- Any authenticated user can list all products
- Products show: name, description, price, stock quantity, category
- Out-of-stock products are visible but cannot be ordered

---

## 4. Orders & Checkout

A buyer places an order by selecting a product, specifying a quantity, and choosing a payment method.

### Direct Payment
1. Validate buyer wallet balance >= order total
2. Deduct order total from buyer wallet
3. Deduct quantity from product stock
4. Create order with status `confirmed`

### Loan Payment
1. Validate product has sufficient stock
2. Create order with status `pending_funding`
3. Create a loan application with:
   - `requested_amount` = order total
   - `term_months` specified by the buyer (1–12)
   - `interest_rate` = fixed platform rate (your choice; document it)
   - `status` = `open`
4. Do **not** deduct stock yet

A buyer can view all their own orders including the linked loan application status.

---

## 5. Loan Marketplace

### Lender: Browse
- Lender can list all loan applications with `status = open`
- Each loan shows: borrower name, requested amount, funded amount, remaining amount, term, interest rate

### Lender: Fund
- Lender selects a loan and specifies a funding amount
- Constraints:
  - Amount > 0
  - Amount <= lender wallet balance
  - Amount <= remaining unfunded amount
- Deduct from lender wallet
- Record the funding contribution
- If the loan is now **100% funded**:
  - Set loan status → `funded`
  - Set order status → `confirmed`
  - Deduct quantity from product stock
  - Generate a repayment schedule for the buyer (monthly installments, display only)

---

## 6. Repayment Schedule (Display Only)

When a loan is fully funded, generate a repayment schedule:

- Number of installments = `term_months`
- Installment amount = `(requested_amount * (1 + interest_rate)) / term_months`
- First due date = 30 days from funding date; subsequent due dates monthly
- Status of each installment: `pending`

Buyers can view their repayment schedule. No payment action is required.

---

## 7. Data Integrity

- Wallet deductions and loan funding records must be atomic (database transaction)
- A lender cannot fund more than the remaining amount on a loan
- A buyer cannot place an order for more stock than is available

---

## 8. Frontend Pages

The UI should be functional and navigable. Visual polish is not evaluated.

| Page | Role | Description |
|------|------|-------------|
| Login / Register | All | Role selection on register |
| Product Listing | Buyer | List all products; each has a "Buy" button that opens an order form |
| Order Form | Buyer | Specify quantity and payment method (direct or loan); if loan, specify term |
| My Orders | Buyer | List of buyer's orders with status and loan details if applicable |
| Loan Marketplace | Lender | List of open loan applications |
| Loan Detail | Lender | Full loan details with a funding form |

Wallet balance should be visible in the navigation bar for logged-in users.

---

## 9. Out of Scope

- Seller role and product management UI
- Admin panel
- Loan expiry
- Repayment payments (schedule is display only)
- Email notifications
- Test suite (replace with a Postman collection)
