# B2B E-Commerce + P2P Lending Platform

This repository contains a full-stack implementation of:

1. B2B e-commerce product ordering (buyer)
2. Loan-based checkout + lender funding (lender)

## Tech Stack

1. Backend: Node.js, Express, TypeScript, TypeORM, PostgreSQL, JWT
2. Frontend: React, TypeScript, Vite, React Router, Axios
3. Database: PostgreSQL (schema + seed from [seed.sql](seed.sql))

## Prerequisites

1. Node.js 18+ and npm
2. PostgreSQL 14+

## Project Structure

1. [backend](backend) - API server
2. [frontend](frontend) - Web app
3. [seed.sql](seed.sql) - Database schema + seed data
4. [postman_collection.json](postman_collection.json) - Postman import file

## Quick Start

### 1. Setup Database

1. Create database:

```sql
CREATE DATABASE project_interview;
```

2. Run [seed.sql](seed.sql) against `project_interview`.

Example with psql:

```bash
psql -U postgres -d project_interview -f seed.sql
```

### 2. Setup Backend

1. Go to backend folder:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create env file from [backend/.env.example](backend/.env.example):

```powershell
Copy-Item .env.example .env
```

Alternative (Git Bash/Linux/macOS):

```bash
cp .env.example .env
```

4. Update values in `.env` if needed (DB credentials, JWT secret).

5. Run backend in development mode:

```bash
npm run dev
```

Backend URL: `http://localhost:3000/api/v1`

### 3. Setup Frontend

1. Open a new terminal and go to frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. (Optional) Create `.env` if you want custom API URL:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

If omitted, frontend defaults to `http://localhost:3000/api/v1`.

4. Run frontend:

```bash
npm run dev
```

Frontend URL: `http://localhost:5173`

## Running Production Build (Optional)

### Backend

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm run build
npm run preview
```

## API Testing with Postman

1. Import [postman_collection.json](postman_collection.json)
2. Set collection variable `baseUrl` to:

```text
http://localhost:3000/api/v1
```

3. Run login requests first to auto-populate token variables.

## Main Roles and Flows

1. Buyer:
   - Register/Login
   - Browse products
   - Create direct or loan order
   - View order details and repayment schedule

2. Lender:
   - Register/Login
   - Browse open loans
   - Fund loan
   - View funding history

## Common Issues

1. Backend exits on startup:
   - Check PostgreSQL is running
   - Check DB credentials in `backend/.env`
   - Ensure [seed.sql](seed.sql) has been executed

2. Frontend cannot call API:
   - Ensure backend runs on port `3000`
   - Check `VITE_API_URL` if you changed backend host/port

3. Unauthorized responses:
   - Login again to refresh token
   - Ensure using correct role for protected endpoints
