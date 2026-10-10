# Unibox Frontend

Next.js 14 App Router dashboard for the Unibox WhatsApp Business inbox. Pairs with
[`../unibox-backend`](../unibox-backend).

## Stack

| Area           | Choice                                           |
| -------------- | ------------------------------------------------ |
| Framework      | Next.js 14 (App Router, TypeScript strict)       |
| Styling        | Tailwind CSS + shadcn-style primitives           |
| Server state   | TanStack Query v5                                |
| Client state   | Zustand (`auth`, `inbox`)                        |
| Forms          | React Hook Form + Zod                            |
| Realtime       | socket.io-client                                 |
| HTTP           | Axios with auth-refresh interceptor              |
| Theming        | `next-themes` (light/dark/system)                |
| Icons          | lucide-react                                     |
| Toasts         | `sonner`                                         |

## Quick start

```bash
cp .env.example .env.local        # points at http://localhost:4000 by default
npm install
npm run dev                       # http://localhost:3000
```

Seed logins (from the backend seed):

| Role  | Email              | Password      |
| ----- | ------------------ | ------------- |
| OWNER | owner@acme.test    | password123   |
| AGENT | agent@acme.test    | password123   |

## Environment variables

| Variable               | Purpose                                                 |
| ---------------------- | ------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`  | Backend REST base, e.g. `http://localhost:4000/api/v1` |
| `NEXT_PUBLIC_WS_URL`   | Backend Socket.IO origin, e.g. `http://localhost:4000` |

## Project layout

```
src/
├── app/
│   ├── (auth)/              login, signup, accept-invite
│   ├── (dashboard)/         inbox, numbers, team, settings
│   ├── globals.css          Tailwind + theme tokens
│   ├── layout.tsx
│   └── providers.tsx        QueryClient + Theme + Toaster
├── components/
│   ├── dashboard/           Sidebar, Topbar, AuthGate, SocketBridge
│   ├── inbox/               ConversationList, MessageThread, Composer
│   ├── numbers/             AddNumber/AssignUsers dialogs
│   ├── team/                Invite dialog
│   └── ui/                  Button, Card, Dialog, Avatar, Badge, …
├── lib/
│   ├── api/                 Axios client + endpoints + token store
│   ├── hooks/               useSocket
│   ├── stores/              auth.store, inbox.store
│   └── utils.ts
├── types/api.ts             shared DTO types (mirrors backend)
└── middleware.ts            redirects / → /inbox
```

## Behavior

- **Auth**: Tokens are kept in `localStorage`. The Axios response interceptor automatically
  refreshes a stale access token on 401 and retries the original request; a failed refresh
  clears storage and redirects to `/login`.
- **Realtime**: `SocketBridge` opens a Socket.IO connection with the access token on login.
  Incoming `message.created` / `message.updated` / `conversation.updated` events are reconciled
  directly into the TanStack Query cache so lists and threads update without refetches.
- **Inbox**: 3-column layout — sidebar, conversation list (filter by number + scope), message
  thread with status ticks + composer. Resolving a conversation disables the composer.
- **Numbers**: Table + dialog to connect a number from Meta plus an "Assign users" dialog
  checkbox grid. Only visible to Owners/Admins (the server also enforces this).
- **Team**: Member table with role switcher, invite dialog that returns a copyable
  acceptance URL, pending invite revocation.

## Notes & defaults chosen

- Attachments are a composer placeholder (no uploads yet).
- Message thread pagination fetches the latest 50; backend supports `before=<messageId>`
  cursor loading for history, which can be wired to the scroll area later.
- Tokens live in `localStorage` for simplicity. For production, consider httpOnly cookies
  so XSS cannot exfiltrate them.
