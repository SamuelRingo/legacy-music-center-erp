# Legacy Musik School ERP — Tasikmalaya

MVP School Management System. 12-day build target.

## Tech Stack
- **Frontend:** React (Vite) + TailwindCSS + shadcn/ui
- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL (Supabase) + Prisma ORM
- **Auth:** JWT (Access Token 24h) + RBAC
- **Storage:** Supabase Storage (event banners, payment proofs)
- **PDF:** react-to-print (frontend only)

## Quick Start

```bash
# 1. Clone & install
cd legacy-musik-erp
npm install
cd frontend && npm install
cd ../backend && npm install

# 2. Environment
cp .env.example .env
# Fill in DATABASE_URL, JWT_SECRET, SUPABASE_*

# 3. Database
cd backend
npx prisma migrate dev --name init
npx prisma db seed

# 4. Run dev
# Terminal 1 - Backend
cd backend && npm run dev
# Terminal 2 - Frontend
cd frontend && npm run dev
```

## Project Structure

```
legacy-musik-erp/
├── frontend/          # React + Vite + shadcn/ui
│   ├── src/
│   │   ├── components/
│   │   │   ├── shared/        # DataTable, etc.
│   │   │   └── layout/        # Sidebar, Navbar
│   │   ├── pages/
│   │   │   ├── public/        # Landing, Register
│   │   │   ├── admin/         # Super Admin pages
│   │   │   ├── staff/         # Staff pages
│   │   │   ├── teacher/       # Teacher pages
│   │   │   └── student/       # Student pages
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── App.jsx
│   └── ...
├── backend/           # Express + Prisma
│   ├── src/
│   │   ├── middleware/  # auth, rbac
│   │   ├── routes/      # API routes
│   │   ├── controllers/
│   │   └── utils/
│   ├── prisma/
│   │   └── schema.prisma
│   └── ...
├── .env.example
└── README.md
```

