# CardForge – Backend

**Design once. Generate thousands. Print with ease.**

CardForge is a multi-tenant ID-card management platform that helps vendors manage multiple organizations, maintain personnel records, design reusable ID-card templates, and streamline ID-card generation.

The platform aims to simplify ID-card management through a centralized system with secure tenant isolation and scalable backend architecture.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT
- **Validation:** Zod
- **Password Hashing:** Argon2

## Getting Started

Follow these steps to run the project locally.

### Prerequisites

- Node.js
- npm
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd cardforge-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root.

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/cardforge?schema=public"
PORT=8080
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
PUBLIC_BASE_URL=http://localhost:3000

SECRET_KEY=
ACCESS_TOKEN_MAX_AGE=150000m
REFRESH_TOKEN_MAX_AGE_SECONDS=2592000
```

Add the authentication secrets required by the application. Refer to the configuration files for the exact variable names.

### 4. Create the Database

Create a PostgreSQL database named `cardforge` using pgAdmin or the PostgreSQL command line.

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Run Database Migrations

```bash
npx prisma migrate deploy
```

### 7. Seed Reference Data

Run the following commands to populate the initial reference data:

```bash
npx tsx prisma/seed-locations.ts
npx tsx prisma/seed-organization-types.ts
```

### 8. Start the Development Server

```bash
npm run dev
```

The backend server should now be running locally.

## Useful Commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build the application |
| `npm start` | Start production server |
| `npm run typecheck` | Run TypeScript type checking |
| `npx prisma studio` | Open Prisma Studio |
| `npx prisma generate` | Generate Prisma Client |

---

**CardForge – Simplifying ID-card management, one organization at a time.**
