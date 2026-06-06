# Migration Validation — Story 1.2

**Status:** Ready for `supabase db push`

---

## What Changed

Fixed `001_initial_schema.sql`:
- Replaced `uuid_generate_v4()` with `gen_random_uuid()` (PostgreSQL 13+)
- Fixed protocol seed data to use actual product UUIDs (via CTE)
- Prevents "invalid UUID" errors when inserting protocols

---

## Run Migration

```bash
cd /c/Users/Gustavo/Documents/TRIA
supabase link --project-ref rqopfjczhyrjauznxztn
supabase db push
```

Expected output:
```
Skipped migrating '...001_initial_schema.sql' (already applied)
# OR
Successfully applied migration: '...001_initial_schema.sql'
```

---

## Validation Queries

After migration succeeds, run these in Supabase SQL Editor:

### 1. Verify Tables Created
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
```
**Expected:** products, profiles, protocols, subscriptions, user_diagnoses

### 2. Verify Product Count
```sql
SELECT COUNT(*) as count FROM products;
```
**Expected:** 5

### 3. Verify Protocol Count
```sql
SELECT COUNT(*) as count FROM protocols;
```
**Expected:** 4

### 4. Sample Product Data
```sql
SELECT id, sku, name, price, category FROM products LIMIT 1;
```
**Expected:** One product with all fields populated (e.g., TRIA-P1, Shampoo Reconstrutor, 89.90)

### 5. Sample Protocol Data
```sql
SELECT id, name, price, original_price, array_length(products, 1) as product_count FROM protocols LIMIT 1;
```
**Expected:** One protocol (e.g., Origin, 249.90, 314.70, product_count: 3)

### 6. Verify RLS Policies
```sql
SELECT tablename, policyname FROM pg_policies WHERE tablename IN ('profiles', 'user_diagnoses', 'subscriptions') ORDER BY tablename, policyname;
```
**Expected:** 6 policies total
- profiles: 2 (read own, update own)
- user_diagnoses: 2 (read own, insert own)
- subscriptions: 1 (read own)

### 7. Verify Product UUIDs in Protocol
```sql
SELECT 
  p.name,
  p.products,
  (SELECT COUNT(*) FROM products WHERE id = ANY(p.products)) as valid_product_count
FROM protocols p
LIMIT 1;
```
**Expected:** products array contains valid UUIDs, valid_product_count matches array length

---

## Troubleshooting

### "ERROR: relation 'products' already exists"
- Table already created from previous attempt
- This is OK; migration skipped safely

### "ERROR: invalid input syntax for type uuid"
- Check migration file was updated
- Verify `gen_random_uuid()` used (not `uuid_generate_v4()`)
- Verify protocol seed uses CTE

### "ERROR: duplicate key value violates unique constraint 'protocols_name_key'"
- Protocol with same name already exists
- This is OK; `ON CONFLICT (name) DO NOTHING` prevents error

### No seed data inserted
- Check INSERT statements ran
- Run sample queries above to verify

---

## Success Criteria

- ✅ No errors during `supabase db push`
- ✅ All 5 products visible in products table
- ✅ All 4 protocols visible in protocols table
- ✅ All protocol.products arrays contain valid UUIDs
- ✅ RLS policies enabled
- ✅ Foreign key relationships intact

---

## Next Steps (After Validation)

1. Return to terminal
2. Run `npm run dev`
3. Visit `http://localhost:3000/catalog`
4. Verify catalog loads with 5 products + 4 protocols

---

**Commit Hash:** (See git log for hash)  
**Last Updated:** 2026-06-06
