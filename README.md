# OtakuNote 📒✨

A beautiful, modern anime tracking app built with Next.js, Tailwind CSS, and a slick interactive UI. Track, search, and manage your anime watchlist with ease!

---

## 🚀 Features

- 🎬 **Trending Anime Carousel:** See what's hot this season with a stunning, animated carousel.
- 🔍 **Powerful Search:** Find anime by title, genre, or popularity with advanced filters.
- 🏷️ **Genre Filtering:** Instantly filter anime by your favorite genres.
- 🗂️ **Personal Watchlist:** Add, organize, and manage your anime with status tabs: Watching, Completed, Plan to Watch, Dropped.
- 📝 **Detailed Anime Info:** Click any anime for a rich modal with synopsis, characters, and more.
- 🌙 **Dark Mode:** Enjoy a sleek, eye-friendly interface day or night.
- ⚡ **Fast & Responsive:** Built with Next.js 14, Framer Motion, and Tailwind CSS for a buttery-smooth experience.
- 🛠️ **Modern Stack:** Next.js, React 18, Tailwind CSS, Jotai, Framer Motion, and more.

---

## 🧩 Project Structure

- `src/app/` — Main app pages and logic
  - `page.tsx` — Home/trending page
  - `search/` — Search page with filters
  - `watchlist/` — Personal watchlist with status tabs
  - `components/` — UI components (carousels, cards, modals, etc.)
- `public/` — Static assets (logo, icons)
- `tailwind.config.ts` — Tailwind CSS config

---

## 📦 Tech Stack

- **Framework:** Next.js 14, React 18
- **Styling:** Tailwind CSS, Framer Motion
- **State:** Jotai
- **API:** GraphQL (codegen ready)
- **UI:** Radix UI, Lucide Icons
- **Other:** Sonner (toasts), Axios

---

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
