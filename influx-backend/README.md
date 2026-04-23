# INFLUX Backend

The robust API engine for the INFLUX platform.

## Features
- **JWT Auth**: Secure registration and login with token rotation.
- **Prisma ORM**: Type-safe database interactions with PostgreSQL.
- **Socket.io**: Real-time event handling for chat and notifications.
- **Role-Based Access**: Middleware-protected routes for Brands and Influencers.

## Environment Variables
Create a `.env` file in the root:
```env
PORT=5000
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
JWT_SECRET="your_secret"
JWT_REFRESH_SECRET="your_refresh_secret"
```

## Available Scripts
- `npm run dev`: Start development server with ts-node-dev.
- `npm run build`: Compile TypeScript to JS.
- `npm start`: Run the compiled production server.
- `npx prisma studio`: Open the database GUI.
