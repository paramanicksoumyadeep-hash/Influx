# INFLUX | Influencer & Brand Collaboration Platform

INFLUX is a premium networking and marketplace platform designed to bridge the gap between top-tier influencers and global brands. Built with a modern tech stack focused on real-time interactivity and exclusive aesthetics.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- Redis (Optional, for scaling Socket.io)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Influx
   ```

2. **Setup Backend**
   ```bash
   cd influx-backend
   npm install
   # Create .env based on .env.example
   npx prisma generate
   npx prisma db push
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd influx-frontend
   npm install
   # Create .env.local based on .env.example
   npm run dev
   ```

## 🏗 Architecture

- **Frontend**: Next.js 15 (App Router), Tailwind CSS 4, Framer Motion, Zustand.
- **Backend**: Node.js, Express, TypeScript, Socket.io.
- **Database**: PostgreSQL with Prisma ORM.
- **Auth**: JWT (Access + Refresh Tokens) with HTTP-only cookies.

## ✨ Core Features

- **Exclusive Marketplace**: Multi-platform campaign discovery and application.
- **Smart Networking**: Connection request system with role-based interactions.
- **Real-Time Messaging**: Instant chat with typing indicators and read status.
- **Dynamic Profiles**: Role-specific profile management for influencers and brands.

## 🛠 Tech Stack
- **Styling**: Tailwind CSS (Glassmorphism & Dark Mode)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State Management**: Zustand
- **API**: Axios with interceptors
