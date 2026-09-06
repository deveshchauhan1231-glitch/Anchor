# Anchor Next.js

This is the standalone Next.js version of the Anchor student learning platform.
The UI and backend APIs live in the same App Router project. The original
`client` and `server` folders are separate projects and are not required here.

## APIs

The following routes use Clerk user IDs for ownership and Prisma for storage:

- `GET /api/health`
- `GET|POST /api/subjects`, `GET|PUT|DELETE /api/subjects/:id`
- `GET|POST /api/videos`, `GET|PUT|DELETE /api/videos/:id`
- `GET|POST /api/timestamps`, `PUT|DELETE /api/timestamps/:id`
- `GET|POST /api/notes`, `GET|PUT|DELETE /api/notes/:id`
- `GET|POST /api/todos`, `PUT|DELETE /api/todos/:id`
- `POST /api/speech/transcribe`
- `GET /api/users/me`
- `POST /api/webhooks/clerk`
- `POST /api/ai/:path`

Copy `.env.example` to `.env.local`, install dependencies, generate Prisma
Client, and run the database migration before starting the app.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
