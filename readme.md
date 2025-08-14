# Backend – TypeScript Express Template

This is a simple backend template using **Express** and **TypeScript**.  
It features a clean structure with controllers, models, and routes, suitable for REST API development.

## Features

- TypeScript for type safety
- Express for fast API development
- Nodemon for auto-reloading during development
- Organized folders: `controllers`, `models`, `routes`
- Ready for expansion and integration with databases

## Getting Started

### Install dependencies

```bash
npm install
```

### Development mode

Runs the server with auto-reload on changes:

```bash
npm run dev
```

### Build

Compiles TypeScript to JavaScript:

```bash
npm run build
```

### Start (production)

Runs the compiled server:

```bash
npm start
```

## Project Structure

```
backend/
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── index.ts
├── package.json
├── tsconfig.json

```

- **controllers/**: Request logic, validation, authentication
- **models/**: Data access, database logic
- **routes/**: API endpoint definitions
- **index.ts**: Express app entry point

## Requirements

- Node.js >= 22
- npm >= 10

### Environment Variable

Create a `.env` file (not committed) with:

```
DATABASE_URL=postgres://user:password@localhost:5432/mydb
```
