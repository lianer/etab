# eTab

A full-stack web application with React + TypeScript frontend and Node.js + Express backend.

## Project Structure

```
eTab/
├── backend/          # Node.js + Express API
│   ├── src/         # Source code
│   ├── dist/        # Compiled output
│   └── package.json # Backend dependencies
├── frontend/         # React + TypeScript SPA
│   ├── src/         # React source code
│   ├── build/       # Production build
│   └── package.json # Frontend dependencies
└── package.json     # Root package (monorepo scripts)
```

## Getting Started

### Install dependencies

```bash
npm run install:all
```

### Development

Run both frontend and backend in development mode:

```bash
npm run dev
```

Or run separately:

```bash
npm run dev:frontend   # http://localhost:3000
npm run dev:backend    # http://localhost:3001
```

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

## Tech Stack

**Frontend**
- React 19
- TypeScript
- React Router
- CSS Modules

**Backend**
- Node.js
- Express
- TypeScript
- CORS
