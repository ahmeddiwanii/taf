# Tafsula

A club operating system for Tunisian youth.

Tafsula helps young people find clubs and events, join a bureau or a team, complete real work, and carry that trail on a profile. Clubs get a house for members, nights, tasks, and ideas — without WhatsApp folklore as the only source of truth.

## Product surfaces

| Surface | Who it is for |
| --- | --- |
| Public site | Discover clubs and events (FR · EN · AR) |
| Member dashboard | Tasks, teams, events, profile |
| Bureau (HR) dashboard | Members, invites, events, teams, proposals |
| Superadmin | Organizations, join requests, platform oversight |

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- PostgreSQL + Prisma
- NextAuth (credentials)
- Optional SMTP for invites / password reset
- Deployable on Vercel + Neon/Supabase

## Local setup

```bash
cp .env.example .env
npm install
npx prisma migrate deploy
npm run seed:test
npm run dev
```

Fill Postgres and `NEXTAUTH_SECRET` in `.env` first. Never commit real secrets.

## Demo login accounts

Created by `npm run seed:test` (safe fictional passwords for local / portfolio demos):

| Role | Email | Password | Opens |
| --- | --- | --- | --- |
| Superadmin | `admin@tafsula.test` | `[set-in-local-env]` | `/dashboard/admin` |
| Bureau (HR) | `hr@tafsula.test` | `[set-in-local-env]` | `/dashboard/hr` |
| Member | `member@tafsula.test` | `[set-in-local-env]` | `/dashboard/member` |

The seed also creates a sample club (`Maison El Medina`), a public open night, a welcome-desk team, and one assigned task.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local server |
| `npm run build` | Prisma generate + Next build |
| `npm start` | Production server |
| `npm run seed:test` | Upsert demo org + role accounts |
| `npm run seed` | Alternate seed script |

## Deploy outline

1. Provision Postgres (Neon or Supabase free tier).
2. Set env vars on the host (see `.env.example`).
3. Run `npx prisma migrate deploy` against production.
4. Deploy the Next.js app (Vercel works with the included config).

## License

MIT
