# Engineering Interview Test: B2B E-Commerce & P2P Lending Platform

## Overview

Build a simplified integrated **B2B e-commerce** and **P2P lending** platform as a full-stack web application. The core concept: businesses buy products, and when they can't or don't want to pay upfront, they finance the purchase through peer-to-peer loans funded by individual lenders.

All transactions use **Indonesian Rupiah (IDR)**. Every user starts with a wallet balance of **Rp 500,000,000**.

**Timeline: 5 days**

---

## A Note on AI Tools

You are expected to use AI tools — Claude, Cursor, GitHub Copilot, ChatGPT, or anything else you prefer. Candidates who leverage AI effectively will have a significant advantage in completing this project. Those who don't will likely run out of time.

Your submission README must include a **"How I Used AI"** section covering:
- Which tools you used and for what (scaffolding, schema, logic, debugging, etc.)
- One concrete example where the AI output was wrong or incomplete and how you caught it

We are not judging whether you used AI. We are judging whether you used it well.

---

## Business Context

Two integrated products:

1. **B2B E-Commerce** — Business buyers browse and purchase products from a catalog.
2. **P2P Lending** — Buyers who choose to pay via loan create a loan application at checkout. Lenders browse open loans and fund them. Once fully funded, the order is confirmed.

---

## Roles

| Role | Description |
|------|-------------|
| **Buyer** | Browses products, places orders, can apply for a loan at checkout |
| **Lender** | Browses open loan applications, funds them partially or in full |

No seller or admin role is required. Products and initial wallet balances are seeded via database migration.

---

## Core Flows

### Flow 1: Direct Purchase
Buyer places an order → pays from wallet → order confirmed immediately.

### Flow 2: Loan Purchase
Buyer places an order → applies for a loan → order status is `pending_funding`.
Lender browses open loans → funds one (partial or full).
When loan reaches 100% funded → order status changes to `confirmed` → repayment schedule is generated.

---

## Deliverables

1. **Backend API** satisfying [REQUIREMENTS.md](./REQUIREMENTS.md) and [API_SPEC.md](./API_SPEC.md)
2. **Frontend** with the pages listed in [REQUIREMENTS.md](./REQUIREMENTS.md)
3. **Database migrations** including seed data (products + initial wallet balances)
4. **README** (replace this file) with:
   - How to run the project
   - Architecture decisions and assumptions
   - **How I Used AI** section (required)

---

## Technical Constraints

- **Backend**: Any language and framework (Node.js, Python, Go, Java, etc.)
- **Frontend**: Any modern framework (React, Next.js, Vue, etc.) — UI does not need to be polished, but must be functional
- **Database**: PostgreSQL (preferred) or MySQL
- **Auth**: JWT
- **Payments**: Simulated via wallet balance — no external payment gateway

---

## Suggested Project Structure

```
/
├── backend/
├── frontend/
├── migrations/
├── README.md
├── REQUIREMENTS.md      # Do not modify
└── API_SPEC.md          # Do not modify
```

---

## Submission

When you are done:

1. Push your work to your forked repository
2. Open a **pull request** against the original repository with the title: `[Your Name] — Submission`
3. In the pull request description, include:
   - How to run the project locally
   - A brief summary of your architecture decisions
   - Your **How I Used AI** section
4. Notify your interviewer contact that your PR is ready
5. Be prepared to do a **live demo** where you will walk through the working application end-to-end, covering both the direct checkout flow and the loan checkout-to-funding flow

The demo is your opportunity to show the application working, explain your decisions, and discuss trade-offs. There are no trick questions — we want to understand how you think.

---

## Questions

Document your assumptions and move forward. Reach out to your interviewer contact only for critical blockers.
