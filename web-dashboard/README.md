# Sit or Live - Web Dashboard

Real-time global statistics dashboard for the sit-or-live desktop application.

## Features

- 📊 Global theme usage statistics
- 🌍 City-level activity data
- 🎨 6 Halloween themes visualization
- ⚡ Real-time updates (via Supabase Realtime)
- 📱 Responsive design

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account (for production)

### Installation

```bash
# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

### Deploy to Vercel

```bash
vercel --prod
```

## Environment Variables

Required in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL + Realtime)
- React Leaflet (for maps)

## License

MIT
