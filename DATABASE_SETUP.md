# Database Setup Instructions

## Prerequisites

1. Supabase account and project created
2. `.env` file populated:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
   SUPABASE_SERVICE_ROLE_KEY=xxx
   ```

## Apply Migrations

### Option A: Supabase CLI (Recommended)

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link project
supabase link --project-ref your-project-id

# Apply migrations
supabase db push
```

### Option B: Direct SQL (Supabase Dashboard)

1. Go to Supabase Dashboard → SQL Editor
2. Create new query
3. Copy contents of `supabase/migrations/001_initial_schema.sql`
4. Run query

## Validate Migration

```bash
# Connect to database (via psql or Supabase dashboard)
# Run validation queries:

-- Check tables created
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Check products (should return 5 rows)
SELECT COUNT(*) as product_count FROM products;

-- Check protocols (should return 4 rows)
SELECT COUNT(*) as protocol_count FROM protocols;

-- Check RLS policies enabled
SELECT tablename, policyname FROM pg_policies WHERE tablename IN ('profiles', 'user_diagnoses', 'subscriptions') ORDER BY tablename, policyname;

-- Sample product query
SELECT id, sku, name, price, category FROM products LIMIT 1;
```

## Seed Data

Migration includes seed data:
- **Products:** TRIA-P1 through TRIA-P5 (89.90 - 129.90 BRL)
- **Protocols:** Origin, Reconstruct, Define, Complete (189.90 - 449.90 BRL)
- **INCI Data:** Full chemical nomenclature for each product

## Troubleshooting

### "User role not found"
- Ensure `auth.users` table exists (created by Supabase by default)

### "Extension uuid-ossp not found"
- Supabase should create this automatically; if not, run:
  ```sql
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  ```

### Seed data not inserted
- Check for constraint violations (unique SKUs, protocol names)
- Verify foreign key references exist

## Next Steps

After successful migration:
1. Update `.env.example` with confirmation
2. Run Story 1.3 (Catalog API)
3. Test `/api/catalog` endpoint returns seed data

---

**Status:** Ready for manual execution  
**Required by:** Story 1.3 implementation  
**Estimated time:** 2-5 minutes
