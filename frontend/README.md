# Online Polling Platform - Frontend

This is the React frontend for the Online Polling Platform.

## Tech Stack
- React 18 + Vite 5
- TypeScript (Strict Mode)
- Tailwind CSS v3
- React Router v6
- Axios & TanStack Query v5
- React Hook Form + Zod
- react-hot-toast

## Getting Started

1. Install Node.js (v20+ LTS)
   - macOS: `brew install node@20`
   - Ubuntu: `nvm install 20`
   - Windows: Use `nvm-windows`

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup environment variables:
   Copy `.env.example` to `.env` and adjust if needed:
   ```env
   VITE_API_URL=http://localhost:8000
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure
- `/src/api` - Axios API client and endpoints
- `/src/components` - Reusable UI components
- `/src/context` - React contexts (Auth)
- `/src/hooks` - Custom React hooks and TanStack Queries
- `/src/layouts` - Page layouts
- `/src/pages` - Application routes
- `/src/types` - TypeScript interfaces
- `/src/utils` - Helper functions

