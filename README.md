<img width="70" src="https://raw.githubusercontent.com/RanitManik/lucide-note/refs/heads/main/apps/web/public/logo.svg" alt="Lucide Note Logo" />

# lucide note

A full-stack, multi-tenant notes application with role-based access control, subscription management, and comprehensive testing features.

> [!WARNING]
> **⚠️ Learning Project Notice**: This repository is a personal learning project and proof-of-concept. It is not intended for commercial use in real-world production systems without further hardening. Use it for learning, experimentation, and reference purposes.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/RanitManik/lucide-note/actions/workflows/ci.yml/badge.svg)](https://github.com/RanitManik/lucide-note/actions/workflows/ci.yml)
[![CodeQL](https://github.com/RanitManik/lucide-note/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/RanitManik/lucide-note/actions/workflows/github-code-scanning/codeql)
[![Dependabot Updates](https://github.com/RanitManik/lucide-note/actions/workflows/dependabot/dependabot-updates/badge.svg)](https://github.com/RanitManik/lucide-note/actions/workflows/dependabot/dependabot-updates)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10.4.1-blue)](https://pnpm.io/)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit-blue)](https://lucide.5dev.in)

## 📑 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Database Setup](#database-setup)
  - [Running the Application](#running-the-application)
- [Configuration](#configuration)
- [Testing](#testing)
- [Development Workflow](#development-workflow)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Architecture](#architecture)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Multi-tenant Architecture** - Complete data isolation between organizations
- **Role-Based Access Control** - Admin and Member roles with fine-grained permissions
- **Subscription Management** - Free tier (3 notes) and Pro tier (unlimited notes)
- **Rich Text Editor** - Powered by TipTap for seamless content creation
- **Optimistic UI Updates** - Real-time feedback for better user experience
- **Theme Support** - Dark and light modes with system preference detection
- **Comprehensive Testing** - Unit, integration, and end-to-end test coverage
- **Security First** - NextAuth.js authentication, bcrypt password hashing, tenant isolation

## Tech Stack

| Layer               | Technology                                 |
| ------------------- | ------------------------------------------ |
| **Frontend**        | Next.js 15 (App Router), React 19          |
| **Backend**         | Next.js API Routes (Serverless)            |
| **Database**        | PostgreSQL with Prisma ORM                 |
| **Authentication**  | NextAuth.js                                |
| **Styling**         | Tailwind CSS + shadcn/ui                   |
| **Testing**         | Jest (Unit/Integration) + Playwright (E2E) |
| **Deployment**      | Vercel                                     |
| **Package Manager** | pnpm                                       |

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** 20 or higher
- **pnpm** (Install via `npm install -g pnpm`)
- **PostgreSQL** database (local installation or cloud provider like Supabase/Neon)

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/RanitManik/lucide-note.git
cd lucide-note
```

2. **Install dependencies:**

```bash
pnpm install
```

### Database Setup

1. **Configure environment variables:**

Copy the example environment file and update the values:

```bash
cd apps/web
cp .env.example .env
```

Then edit `.env` with your actual values:

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"
DIRECT_URL="postgresql://username:password@host:port/database"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-here"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Email (Brevo)
BREVO_API_KEY="your-brevo-api-key-here"
BREVO_FROM_EMAIL="noreply@yourdomain.com"
BREVO_FROM_NAME="lucide note"
```

2. **Run database migrations:**

```bash
cd apps/web
pnpm db:migrate
```

3. **Seed the database with test data:**

```bash
pnpm db:seed
```

This creates two test tenants with sample users and notes.

### Running the Application

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Test Accounts

Use these credentials to explore the application (password: `password` for all):

**Acme Corporation:**

- `admin@acme.test` - Administrator with full permissions
- `user@acme.test` - Regular member

**Globex Corporation:**

- `admin@globex.test` - Administrator with full permissions
- `user@globex.test` - Regular member

## Configuration

### Environment Variables

| Variable               | Description                               | Url                                               |
| ---------------------- | ----------------------------------------- | ------------------------------------------------- |
| `DATABASE_URL`         | PostgreSQL connection string (pooled)     | [Supabase](https://supabase.com)                  |
| `DIRECT_URL`           | Direct PostgreSQL connection (migrations) | [Supabase](https://supabase.com)                  |
| `NEXTAUTH_URL`         | Base URL of your application              | -                                                 |
| `NEXTAUTH_SECRET`      | Secret for NextAuth session encryption    | [Generate](https://generate-secret.vercel.app/32) |
| `GITHUB_CLIENT_ID`     | GitHub OAuth client ID                    | [GitHub](https://github.com/settings/developers)  |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret                | [GitHub](https://github.com/settings/developers)  |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID                    | [Google](https://console.developers.google.com/)  |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret                | [Google](https://console.developers.google.com/)  |
| `BREVO_API_KEY`        | Brevo email API key                       | [Brevo](https://www.brevo.com/)                   |
| `BREVO_FROM_EMAIL`     | Verified sender email for Brevo           | [Brevo](https://www.brevo.com/)                   |
| `BREVO_FROM_NAME`      | Sender name for emails                    | [Brevo](https://www.brevo.com/)                   |

### Available Scripts

```bash
# Development
pnpm dev              # Start development server (localhost:3000)
pnpm build            # Create production build
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm format           # Format code with Prettier

# Database Operations
pnpm db:migrate       # Apply database migrations
pnpm db:seed          # Seed database with test data
pnpm db:generate      # Regenerate Prisma client
pnpm db:studio        # Open Prisma Studio (database GUI)
pnpm db:reset         # Reset database (⚠️ destroys all data)

# Testing
pnpm test             # Run all tests
pnpm test:unit        # Run unit tests only
pnpm test:e2e         # Run end-to-end tests
pnpm test:watch       # Run tests in watch mode

# Git Workflow
pnpm commit           # Interactive commit with Commitizen
```

## Testing

This project maintains high test coverage across multiple layers:

### Unit Tests (Jest)

```bash
pnpm test:unit
```

Tests individual functions, components, and utilities in isolation.

### Integration Tests (Jest)

```bash
pnpm test:integration
```

Tests API routes, database interactions, and business logic.

### End-to-End Tests (Playwright)

```bash
pnpm test:e2e
```

Tests complete user workflows across the entire application.

## Development Workflow

### Code Quality Tools

This project uses several tools to maintain code quality and consistency:

- **EditorConfig** - Consistent coding styles across editors
- **Prettier** - Automatic code formatting
- **ESLint** - Code linting and best practices
- **Husky** - Git hooks for automation
- **lint-staged** - Run checks only on staged files
- **Commitlint** - Enforce commit message conventions
- **Commitizen** - Interactive commit creation

### Git Hooks

**Pre-commit:** Automatically runs on every commit

- Formats code with Prettier
- Lints code with ESLint
- Fixes auto-fixable issues

**Commit-msg:** Validates commit message format

### Commit Message Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/). Use the interactive prompt:

```bash
pnpm commit
```

Or format manually:

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types:**

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, semicolons, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `perf` - Performance improvements
- `ci` - CI/CD changes
- `build` - Build system changes
- `revert` - Revert previous commit

**Examples:**

```bash
feat(notes): add markdown export functionality
fix(auth): resolve token expiration edge case
docs(readme): update installation instructions
```

## API Documentation

| Category       | Endpoint                      | Method   | Description                                                   |
| -------------- | ----------------------------- | -------- | ------------------------------------------------------------- |
| Authentication | `/api/auth/register`          | POST     | Register new user account with email verification             |
| Authentication | `/api/auth/forgot-password`   | POST     | Request password reset email                                  |
| Authentication | `/api/auth/reset-password`    | POST     | Reset password using reset token                              |
| Authentication | `/api/auth/send-verification` | POST     | Send email verification link                                  |
| Authentication | `/api/auth/verify-email`      | GET      | Verify email address using verification token                 |
| Authentication | `/api/auth/[...nextauth]`     | GET/POST | NextAuth.js authentication (login, OAuth, session management) |
| Notes          | `/api/notes`                  | GET      | Retrieve all notes for the authenticated user's tenant        |
| Notes          | `/api/notes`                  | POST     | Create a new note (enforces free plan limits)                 |
| Notes          | `/api/notes/:id`              | GET      | Retrieve a specific note by ID (tenant-scoped)                |
| Notes          | `/api/notes/:id`              | PUT      | Update an existing note (tenant-scoped)                       |
| Notes          | `/api/notes/:id`              | DELETE   | Delete a note (tenant-scoped)                                 |
| Organization   | `/api/organization/create`    | POST     | Create a new organization and assign current user as admin    |
| Organization   | `/api/organization/invite`    | POST     | Send invitation emails to join the organization               |
| Tenant         | `/api/tenant`                 | GET      | Get current tenant information including plan and usage       |
| Tenants        | `/api/tenants/:slug/upgrade`  | POST     | Upgrade tenant to Pro plan (admin only)                       |
| Health Check   | `/api/health`                 | GET      | Service health check endpoint                                 |

## Deployment

### Deploy to Vercel (Recommended)

1. **Push code to GitHub:**

```bash
git push origin main
```

1. **Import project in Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your repository

2. **Configure environment variables:**
   - Add `DATABASE_URL`
   - Add `NEXTAUTH_SECRET`

3. **Deploy:**
   - Vercel will automatically build and deploy
   - Run migrations on first deploy: `npx prisma migrate deploy`

### Manual Deployment

```bash
# Build the application
pnpm build

# Run production migrations
pnpm db:migrate:prod

# Start production server
pnpm start
```

## Architecture

### Multi-Tenancy Strategy

This application implements **shared schema multi-tenancy**:

```text
┌─────────────────────────────────────┐
│         PostgreSQL Database         │
├─────────────────────────────────────┤
│  Tables (with tenant_id column)     │
│  ├── tenants                        │
│  ├── users (tenant_id FK)           │
│  ├── notes (tenant_id FK)           │
│  └── subscriptions (tenant_id FK)   │
└─────────────────────────────────────┘
```

**Key Characteristics:**

- Single database schema shared by all tenants
- Every table contains a `tenant_id` column
- All queries automatically filtered by current tenant
- Complete data isolation enforced at application level
- Cost-effective and scalable for SMB applications

### Security Model

- 🔐 **Authentication:** NextAuth.js with session-based authentication
- 🔒 **Authorization:** Role-based access control (Admin/Member)
- 🛡️ **Data Isolation:** Row-level tenant filtering on all queries
- 🔑 **Password Security:** Bcrypt hashing with salt rounds
- 🌐 **CORS:** Configured for secure cross-origin requests
- 🚫 **SQL Injection:** Parameterized queries via Prisma

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Make your changes
4. Commit using conventional commits (`pnpm commit`)
5. Push to your branch (`git push origin feat/amazing-feature`)
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">Built with ❤️ for learning and exploration</div>
