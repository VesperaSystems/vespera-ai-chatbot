# Developer Checklist

This checklist ensures your code will pass all Vercel build checks and maintain code quality standards.

## Pre-commit Checklist

Before committing your code, run these commands to ensure everything is clean:

### 1. Linting Checks

```bash
# Run all linting (ESLint + Biome)
pnpm run lint

# Run ESLint only
pnpm exec next lint

# Run Biome only
npx biome lint --write --unsafe
```

### 2. Type Checking

```bash
# Run strict TypeScript checking (same as Vercel)
pnpm exec tsc --noEmit --strict

# Run TypeScript checking with verbose output
pnpm exec tsc --noEmit --listFiles
```

### 3. Build Verification

```bash
# Run production build (same as Vercel)
pnpm run build

# Run production build with verbose output
NODE_ENV=production pnpm exec next build
```

## Automated Scripts

### Quick Health Check

```bash
# Run all checks in sequence
pnpm run lint && pnpm exec tsc --noEmit --strict && pnpm run build
```

### Database Migration Check

```bash
# Run migrations only
pnpm exec tsx lib/db/migrate
```

## Code Quality Standards

### TypeScript Rules

- ✅ **Strict mode enabled**: All TypeScript errors must be resolved
- ✅ **No `any` types**: Use proper type definitions
- ✅ **Proper null handling**: Use optional chaining (`?.`) and nullish coalescing (`??`)
- ✅ **Schema-driven types**: Use Drizzle-inferred types from `lib/db/schema.ts`

### Linting Rules (Biome)

- ✅ **No array index keys**: Use stable, unique identifiers
- ✅ **No unused imports**: Remove all unused imports
- ✅ **JSX formatting**: Double quotes for attributes, single quotes for strings
- ✅ **Trailing commas**: Always use trailing commas
- ✅ **Semicolons**: Always use semicolons
- ✅ **Line width**: 80 characters max
- ✅ **Indentation**: 2 spaces

### Next.js 15+ Requirements

- ✅ **Route parameters**: Must be awaited (Promise-based)
- ✅ **API routes**: Proper error handling and type safety
- ✅ **Server components**: Proper async/await usage

## Common Issues & Fixes

### Type Errors

- **SubscriptionType conflicts**: Use `number` type from database schema
- **VisibilityType conflicts**: Cast string to `VisibilityType` union type
- **Date vs String**: Database returns `Date`, components expect `string` (ISO format)

### Linting Errors

- **Array index keys**: Use question text or stable ID instead of array index
- **Unused imports**: Remove unused imports or use them
- **Type assertions**: Use proper type guards instead of `as` when possible

### Build Errors

- **Route parameters**: Ensure `params` is awaited in Next.js 15+
- **Database types**: Use schema-inferred types consistently
- **Environment variables**: Ensure all required env vars are set

## Vercel Deployment Checklist

Before pushing to production:

1. ✅ **Local build passes**: `pnpm run build`
2. ✅ **Linting passes**: `pnpm run lint`
3. ✅ **Type checking passes**: `pnpm exec tsc --noEmit --strict`
4. ✅ **Database migrations**: Ensure all migrations are applied
5. ✅ **Environment variables**: All required env vars are set in Vercel

## Development Workflow

### Daily Development

1. Run `pnpm run lint` before committing
2. Run `pnpm exec tsc --noEmit --strict` to catch type errors
3. Test your changes locally with `pnpm run dev`

### Before Pull Request

1. Run the complete checklist above
2. Ensure all tests pass (if applicable)
3. Update documentation if needed

### Before Production Deploy

1. Run full build locally: `pnpm run build`
2. Verify all environment variables are set
3. Test critical user flows

## Troubleshooting

### Build Fails Locally but Works on Vercel

- Check Node.js version compatibility
- Ensure all dependencies are installed: `pnpm install`
- Clear cache: `rm -rf .next && pnpm run build`

### Type Errors on Vercel but Not Locally

- Run strict TypeScript check: `pnpm exec tsc --noEmit --strict`
- Check for environment-specific type differences
- Ensure consistent type definitions across files

### Linting Errors

- Run Biome with auto-fix: `npx biome lint --write --unsafe`
- Check for conflicting ESLint/Biome rules
- Ensure consistent formatting across the codebase

## Environment Setup

### Required Tools

- Node.js 18+
- pnpm package manager
- TypeScript 5+
- Next.js 15+

### IDE Setup

- Install Biome extension for VS Code
- Enable TypeScript strict mode
- Configure auto-format on save

---

**Remember**: This checklist ensures your code will build successfully on Vercel and maintain high code quality standards. Run these checks regularly during development to catch issues early.
