# ORMS (Ordinance & Resolution Management System)

A modern, web-based platform built to efficiently manage, track, and process ordinances, resolutions, and related municipal documents.

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database**: SQLite via [Prisma ORM](https://www.prisma.io/)
- **Authentication**: Custom JWT implementation (`jose`, `bcryptjs`)
- **Validation**: [Zod](https://zod.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📦 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v20 or higher recommended)
- npm (comes with Node.js)

## 🛠️ Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory. You can use the following default configuration for local development:

```env
# Database connection string (SQLite)
DATABASE_URL="file:./dev.db"

# Secret key for JWT signing (use a secure random string)
JWT_SECRET="your-development-super-secret-jwt-key"
```

### 3. Set up the Database

This project uses Prisma with SQLite for a frictionless local development experience.

First, generate the Prisma Client and run migrations to create your database tables:
```bash
npx prisma generate
npx prisma migrate dev
```

Next, seed the database with initial data (such as default admin accounts or departments):
```bash
npx prisma db seed
```

### 4. Run the Development Server

Start the Next.js development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

Here's a quick overview of how the codebase is organized:

```text
ORMS/
├── app/               # Next.js App Router (Pages, API Routes, Layouts)
│   ├── (admin)/       # Admin dashboard & management interfaces
│   ├── api/           # Backend REST API routes
│   ├── components/    # Reusable UI components (Modals, Tables, Forms)
│   └── login/         # Authentication pages
├── lib/               # Core business logic and integrations
│   ├── services/      # Database operations (Ordinances, Resolutions)
│   ├── utils/         # Helper functions (permissions, formatting, audit)
│   └── validators/    # Zod schemas for API payload validation
├── prisma/            # Database schema (schema.prisma) and seed scripts
└── types/             # Shared global TypeScript interfaces and types
```

## 🔐 Authentication & Permissions

The application features a built-in authentication system without relying on third-party providers like NextAuth. 
- Passwords are encrypted via `bcryptjs`.
- Stateless sessions are maintained using JWTs signed with `jose`.
- Access control is handled via middleware (`middleware.ts`) and specific permission utility functions.

## 🧑‍💻 Useful Commands

- `npm run dev`: Starts the development server.
- `npm run build`: Creates an optimized production build.
- `npm run start`: Starts the production server using the build output.
- `npm run lint`: Runs ESLint to find and fix problems in the code.
- `npx prisma studio`: Opens a visual editor in your browser to view and edit database records.
