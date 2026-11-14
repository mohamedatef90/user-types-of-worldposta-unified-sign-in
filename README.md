# WorldPosta Unified Console

A product and UX simulation for managing WorldPosta user types, unified authentication, cloud services, and Posta Gate email-security workflows.

**Live demo:** https://user-types-of-worldposta-unified-si.vercel.app

## What it demonstrates

- Unified sign-in and identity-management concepts
- Four user types (`customer`, `admin`, `reseller`, `super_admin`) with role-aware navigation: customers go to the app dashboard, admins to the admin dashboard, resellers to the reseller dashboard
- CloudEdge configuration and administration experiences
- Email-admin subscription workflows and an email admin suite (organizations and domains, mailboxes)
- Billing views: packages, subscriptions, invoices, and reports
- An AI chat assistant widget that calls Gemini from the browser
- Responsive dashboard and navigation patterns
- Reusable design-system documentation and tokens
- Product exploration across authentication, SaaS administration, and cloud tooling

## Product intent

The prototype explores how a unified identity layer can simplify access across several products while still supporting different user roles, permissions, and administration needs. It is designed as a product/UX simulation rather than a production authentication implementation.

## Tech stack

- React 19
- TypeScript
- React Router
- Vite
- Framer Motion
- Radix UI primitives
- Tailwind CSS (loaded from the CDN in `index.html`)
- Google Gemini through `@google/genai` for the chat widgets

## Run locally

```bash
npm install
npm run dev
```

Environment variable: `GEMINI_API_KEY`, read by `vite.config.ts` and used by the chat widgets. It is inlined into the client bundle at build time, so use it only for local demos. Authentication in this prototype is simulated in the browser against sample data (`context.tsx`, `data.ts`).

## Quality checks

```bash
npm run lint
npm run build
```

## Project structure

```
App.tsx, index.tsx   Routes and entry point
context.tsx          Simulated authentication and app state
data.ts, types.ts    Sample data and types
pages/               Landing, auth, billing, admin, reseller, and email-admin pages
components/ui/       Shared UI components, charts, and chat widgets
lib/                 Utilities and app launcher
```

## Design documentation

- `DESIGN_SYSTEM.md`
- `DESIGN_SYSTEM.json`
- `SSO+TOOLS-DESIGN_SYSTEM.md`

## Status

Interactive product prototype. Production use would require a real identity provider, server-side authorization, secure session handling, accessibility validation, automated tests, and threat modeling.
