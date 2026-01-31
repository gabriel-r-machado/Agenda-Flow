# AgendaFlow

[![Coverage: 99%](https://img.shields.io/badge/coverage-99%25%20(core)-brightgreen)](docs/TESTING.md) [![Next.js 16](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/) [![TypeScript 5](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/) [![Tested with Jest](https://img.shields.io/badge/tested_with-jest-99424f)](https://jestjs.io/) [![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

Scalable, production-oriented SaaS booking system built with Clean Architecture principles. This repository is a portfolio project demonstrating an enterprise-grade architecture: trade-offs and decisions are documented to keep domain rules testable, maintainable and framework-agnostic.

## Overview

AgendaFlow is a multi-tenant scheduling platform for service professionals (coaches, consultants, therapists). The architecture enforces clear boundaries between domain rules, application services and delivery layers so core business logic remains independent from frameworks and infrastructure.

## Key features

- Clean Architecture: domain rules live in `src/core` (no framework deps).
- Deterministic scheduling: all dates stored/processed in UTC; UI performs local conversions.
- High-confidence testing: critical domain logic covered with >99% unit test coverage.
- DTOs (Zod): API contracts decoupled from persistence models.
- Type-safe: TypeScript strict mode enabled, minimal `any` usage.
- Server Actions: Next.js Server Actions are used as thin controllers.

## Architecture (high level)

```
src/
├── core/        # 🟢 Domain (pure TypeScript)
│   └── booking/
│       ├── booking-rules.ts
│       └── booking-rules.spec.ts
├── services/    # 🔵 Application layer + DTOs
│   └── appointmentService.ts
├── actions/     # 🟡 Server Actions (thin controllers)
│   └── appointments.ts
└── components/  # 🔴 Presentation (React)
	└── ui/
```

**Principle:** dependencies point inward — core has no knowledge of Next.js, React, or Supabase.

## Design decisions & trade-offs

- Next.js App Router vs Clean Architecture: we keep domain logic inside `src/core` and use Server Actions as controllers to avoid embedding business rules in `page.tsx`.
- Testing: focus on unit tests for domain rules; E2E used sparingly for integration checks.
- Dates/time: store and compute in UTC; convert at presentation layer to avoid timezone-induced double-bookings.

## Running tests

```bash
npm run test
npm run test:watch
npm run test:coverage
```

## Quick start

Prerequisites: Node.js 20+, Supabase account, Resend account (optional).

```bash
git clone https://github.com/gaahfrm/agendaflow.git
cd agendaflow
npm install
cp .env.example .env.local
# edit .env.local with your Supabase and Resend credentials
npm run db:migrate
npm run dev
```

## Tech stack

- Next.js 16 (App Router)
- TypeScript 5 (strict mode)
- Tailwind CSS + shadcn/ui
- Supabase (Postgres + Auth)
- Zod for validation
- Jest for tests

## Contributing & contact

This repository is maintained as a portfolio project that reflects production-focused architectural decisions.

Author: Gabriel Machado — GitHub: @gaahfrm — LinkedIn: gabrielmachado-se
