# Node.js TypeScript Project with ESLint (Airbnb Style)

A modern Node.js project setup with TypeScript and ESLint using Airbnb style guide.

## Features

- ✅ TypeScript for type safety
- ✅ ESLint with Airbnb style guide
- ✅ Pre-configured build scripts
- ✅ Development server with hot reload
- ✅ Source maps for debugging

## Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

## Installation

```bash
npm install
```

## Available Scripts

### Development
```bash
npm run dev          # Run the project in development mode with ts-node
```

### Building
```bash
npm run build        # Compile TypeScript to JavaScript
npm run clean        # Remove the dist directory
```

### Running
```bash
npm start            # Run the compiled JavaScript
```

### Linting
```bash
npm run lint         # Check code with ESLint
npm run lint:fix     # Fix ESLint issues automatically
```

## Project Structure

```
├── src/
│   ├── index.ts     # Main entry point
│   └── utils/
│       └── greet.ts # Example utility function
├── dist/            # Compiled JavaScript (generated)
├── .eslintrc.js     # ESLint configuration
├── tsconfig.json    # TypeScript configuration
├── package.json     # Project dependencies and scripts
└── README.md        # This file
```

## Configuration

### TypeScript (`tsconfig.json`)
- Target: ES2020
- Module: CommonJS
- Strict mode enabled
- Source maps enabled
- Declaration files generated

### ESLint (`.eslintrc.js`)
- Extends Airbnb base configuration
- TypeScript support with `@typescript-eslint`
- Node.js environment
- Import/export rules configured for TypeScript

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run in development mode:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   npm start
   ```

4. Check code quality:
   ```bash
   npm run lint
   ```

## Development Tips

- Use `npm run dev` for development with automatic TypeScript compilation
- Run `npm run lint:fix` to automatically fix most ESLint issues
- The project uses strict TypeScript settings for better code quality
- All source code should be placed in the `src/` directory

## Contributing

1. Follow the Airbnb style guide (enforced by ESLint)
2. Ensure all TypeScript types are properly defined
3. Run `npm run lint` before committing
4. Write meaningful commit messages
