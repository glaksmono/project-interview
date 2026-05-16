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

## VITE JS (FRONTEND)

Vite was chosen for the frontend architecture because it gives faster development feedback and a simpler modern setup for this project. Very fast local development with instant startup and near real-time HMR, so UI iteration is quick.

## EXPRESS JS, TypeORM (BACKEND)

Express.js and TypeORM were chosen to keep the backend architecture clear, fast to build, and maintainable for this business flow. Express.js is lightweight and flexible, making it easy to structure routes, middleware, authentication, and role-based authorization. It has a mature ecosystem and clear request/response model, which helps deliver REST APIs quickly. TypeORM provides entity-based modeling that maps cleanly to PostgreSQL tables used in this project.

## HOW I USE AI FOR THIS PROJECT

I used AI as a development copilot to speed up implementation, reduce repetitive work, and improve consistency across backend and frontend.

1. Scaffolding and structure
   - Generated initial backend and frontend structure, then adjusted it to match the project requirements and existing folder layout.
2. API implementation support
   - Used AI to draft endpoint handlers, validation patterns, authentication middleware flow, and service-layer separation.
3. Frontend implementation support
   - Used AI to speed up page/component wiring, API integration, state handling, and role-based navigation behavior.
4. Documentation and delivery assets
   - Used AI to help prepare run instructions, Postman collection structure, and improve project documentation clarity.

Quality control example:

1. During implementation, AI-generated output occasionally used inconsistent token naming between frontend and backend (`accessToken` vs `access_token`), which caused unauthorized behavior after login.
2. I caught this issue by testing login and protected API calls end-to-end, then corrected token handling to use one consistent key across request/response flow.
