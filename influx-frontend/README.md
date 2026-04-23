# INFLUX Frontend

The high-fidelity, interactive dashboard for the INFLUX platform.

## Features
- **Next.js 15**: Leveraging the latest App Router and Server Components.
- **Tailwind CSS 4**: Modern utility-first styling with 3D and glow utilities.
- **Framer Motion**: Smooth page transitions and micro-interactions.
- **Zustand**: Lightweight and persistent state management for auth and user data.

## Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
NEXT_PUBLIC_SOCKET_URL="http://localhost:5000"
```

## Available Scripts
- `npm run dev`: Start the development server.
- `npm run build`: Build the production bundle.
- `npm start`: Start the production server.
- `npm run lint`: Run ESLint checks.
