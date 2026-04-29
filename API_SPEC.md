# API Specification

Base path: `/api/v1`

All request and response bodies are JSON. Protected endpoints require `Authorization: Bearer <token>`.

---

## Auth

### POST /auth/register

**Request:**
```json
{
  "name": "Acme Corp",
  "email": "buyer@acme.com",
  "password": "secret123",
  "role": "buyer"
}
```

**Response `201`:**
```json
{
  "id": "uuid",
  "name": "Acme Corp",
  "email": "buyer@acme.com",
  "role": "buyer",
  "wallet_balance": 50000.00,
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### POST /auth/login

**Request:**
```json
{
  "email": "buyer@acme.com",
  "password": "secret123"
}
```

**Response `200`:**
```json
{
  "access_token": "eyJ...",
  "token_type": "Bearer",
  "user": {
    "id": "uuid",
    "name": "Acme Corp",
    "role": "buyer",
    "wallet_balance": 50000.00
  }
}
```

---

## Products

### GET /products
**Auth required. Any role.**

**Response `200`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Industrial Pump",
      "description": "Heavy-duty water pump",
      "price": 1500.00,
      "stock_quantity": 10,
      "category": "machinery"
    }
  ]
}
```

---

## Orders

### POST /orders
**Role: buyer**

Place an order and complete checkout in one step.

**Request (direct payment):**
```json
{
  "product_id": "uuid",
  "quantity": 2,
  "payment_method": "direct"
}
```

**Request (loan payment):**
```json
{
  "product_id": "uuid",
  "quantity": 2,
  "payment_method": "loan",
  "loan_term_months": 6
}
```

**Response `201` (direct):**
```json
{
  "order": {
    "id": "uuid",
    "product": { "id": "uuid", "name": "Industrial Pump" },
    "quantity": 2,
    "unit_price": 1500.00,
    "total_amount": 3000.00,
    "payment_method": "direct",
    "status": "confirmed",
    "loan_application": null,
    "created_at": "2024-01-01T00:00:00Z"
  },
  "wallet_balance_after": 47000.00
}
```

**Response `201` (loan):**
```json
{
  "order": {
    "id": "uuid",
    "product": { "id": "uuid", "name": "Industrial Pump" },
    "quantity": 2,
    "unit_price": 1500.00,
    "total_amount": 3000.00,
    "payment_method": "loan",
    "status": "pending_funding",
    "loan_application": {
      "id": "uuid",
      "requested_amount": 3000.00,
      "funded_amount": 0.00,
      "remaining_amount": 3000.00,
      "term_months": 6,
      "interest_rate": 0.05,
      "monthly_installment": 525.00,
      "status": "open"
    },
    "created_at": "2024-01-01T00:00:00Z"
  },
  "wallet_balance_after": 50000.00
}
```

---

### GET /orders
**Role: buyer**

Returns all orders for the authenticated buyer.

**Response `200`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "product": { "id": "uuid", "name": "Industrial Pump" },
      "quantity": 2,
      "total_amount": 3000.00,
      "payment_method": "loan",
      "status": "pending_funding",
      "loan_application": {
        "id": "uuid",
        "funded_amount": 1200.00,
        "remaining_amount": 1800.00,
        "status": "open"
      },
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### GET /orders/:id
**Role: buyer (own orders only)**

Full order detail including repayment schedule if the loan is funded.

**Response `200`:**
```json
{
  "id": "uuid",
  "product": { "id": "uuid", "name": "Industrial Pump" },
  "quantity": 2,
  "unit_price": 1500.00,
  "total_amount": 3000.00,
  "payment_method": "loan",
  "status": "confirmed",
  "loan_application": {
    "id": "uuid",
    "requested_amount": 3000.00,
    "funded_amount": 3000.00,
    "remaining_amount": 0.00,
    "term_months": 6,
    "interest_rate": 0.05,
    "status": "funded",
    "repayment_schedule": [
      {
        "installment_number": 1,
        "amount": 525.00,
        "due_date": "2024-02-01",
        "status": "pending"
      },
      {
        "installment_number": 2,
        "amount": 525.00,
        "due_date": "2024-03-01",
        "status": "pending"
      }
    ]
  },
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

## Loans

### GET /loans
**Role: lender**

List all open loan applications.

**Response `200`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "borrower": { "id": "uuid", "name": "Acme Corp" },
      "order_id": "uuid",
      "requested_amount": 3000.00,
      "funded_amount": 1200.00,
      "remaining_amount": 1800.00,
      "term_months": 6,
      "interest_rate": 0.05,
      "monthly_installment": 525.00,
      "status": "open",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### GET /loans/:id
**Role: lender**

Full loan detail including individual funding contributions.

**Response `200`:**
```json
{
  "id": "uuid",
  "borrower": { "id": "uuid", "name": "Acme Corp" },
  "order_id": "uuid",
  "requested_amount": 3000.00,
  "funded_amount": 1200.00,
  "remaining_amount": 1800.00,
  "term_months": 6,
  "interest_rate": 0.05,
  "monthly_installment": 525.00,
  "status": "open",
  "fundings": [
    {
      "id": "uuid",
      "lender": { "id": "uuid", "name": "Investor A" },
      "amount": 1200.00,
      "funded_at": "2024-01-02T00:00:00Z"
    }
  ],
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### POST /loans/:id/fund
**Role: lender**

Fund an open loan application.

**Request:**
```json
{ "amount": 800.00 }
```

**Response `200`:**
```json
{
  "funding": {
    "id": "uuid",
    "loan_application_id": "uuid",
    "amount": 800.00,
    "funded_at": "2024-01-02T00:00:00Z"
  },
  "loan_application": {
    "id": "uuid",
    "funded_amount": 2000.00,
    "remaining_amount": 1000.00,
    "status": "open"
  },
  "wallet_balance_after": 49200.00
}
```

When the loan becomes 100% funded, `status` is `"funded"` and the linked order status becomes `"confirmed"`.

---

## Wallet

### GET /wallet
**Auth required. Any role.**

**Response `200`:**
```json
{
  "balance": 49200.00
}
```

---

## Error Format

All errors follow this structure:

```json
{
  "error": "INSUFFICIENT_WALLET_BALANCE",
  "message": "Your wallet balance is insufficient to fund this amount.",
  "details": {
    "required": 1800.00,
    "available": 800.00
  }
}
```

Common status codes:
- `400` — Validation error
- `401` — Missing or invalid token
- `403` — Wrong role or not the resource owner
- `404` — Resource not found
- `422` — Business rule violation (insufficient balance, over-funding, out of stock)
