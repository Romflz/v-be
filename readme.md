# Backend – TypeScript Express Template

This is a simple backend template using **Express** and **TypeScript**.  
It features a clean structure with controllers, models, and routes, suitable for REST API development.

## Features

- TypeScript for type safety
- Express for fast API development
- Nodemon for auto-reloading during development
- Organized folders: `controllers`, `models`, `routes`
- Ready for expansion and integration with databases
- Drizzle ORM (PostgreSQL) with schema & migrations

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
├── drizzle.config.ts
├── drizzle/            # Generated migrations
```

- **controllers/**: Request logic, validation, authentication
- **models/**: Data access, database logic
- **routes/**: API endpoint definitions
- **index.ts**: Express app entry point

## Requirements

- Node.js >= 22
- npm >= 10

## Drizzle ORM

### Environment Variable

Create a `.env` file (not committed) with:

```
DATABASE_URL=postgres://user:password@localhost:5432/mydb
```

### Generate Migration

Edit schema in `src/db/schema/index.ts`, then:

```bash
npm run drizzle:generate
```

### Apply Migrations

```bash
npm run drizzle:migrate
```

or push schema directly (experimental):

```bash
npm run drizzle:push
```

### Drizzle Studio

```bash
npm run drizzle:studio
```

### Example Schema

See `src/db/schema/index.ts` for `users` table.

### Usage in Code

`src/db/client.ts` exports `db` (Drizzle instance) and `initDb()` which is called before server starts.

Example route: POST /example { "name": "Alice" }

