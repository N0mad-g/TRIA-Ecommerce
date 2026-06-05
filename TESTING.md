# Testing Guide — Epic 1

## Story 1.2: Database Migration

### Prerequisites
- Supabase account + project
- `.env` populated with credentials
- Supabase CLI installed

### Test Procedure

```bash
# 1. Link project
supabase link --project-ref your-project-id

# 2. Apply migration
supabase db push

# 3. Validate tables created
supabase db query
# Then in psql:
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
# Expected: diagnoses, products, profiles, protocols, subscriptions, users

# 4. Validate seed data
SELECT COUNT(*) as product_count FROM products;
# Expected: 5

SELECT COUNT(*) as protocol_count FROM protocols;
# Expected: 4

# 5. Check RLS policies
SELECT tablename, policyname FROM pg_policies WHERE tablename IN ('profiles', 'user_diagnoses', 'subscriptions');
# Expected: 6 policies (2 for profiles, 2 for diagnoses, 2 for subscriptions)

# 6. Sample query
SELECT id, sku, name, price FROM products LIMIT 1;
# Expected: One product with INCI nomenclature
```

---

## Story 1.3: Catalog API & Page

### Prerequisites
- Story 1.2 completed (database migrated)
- Dev server running: `npm run dev`

### Test Procedure

#### 1. API Endpoint Test
```bash
# In another terminal:
curl http://localhost:3000/api/catalog

# Expected response (200 OK):
{
  "status": "ok",
  "data": {
    "products": [
      {
        "id": "uuid",
        "sku": "TRIA-P1",
        "name": "Shampoo Reconstrutor",
        "price": 89.9,
        "category": "Cabelo",
        "active_ingredients": {...},
        "inci": "Aqua, Silicones, ..."
      },
      ...5 products total
    ],
    "protocols": [
      {
        "id": "uuid",
        "name": "Origin",
        "price": 249.9,
        "original_price": 314.7,
        "products": [...],
        "narrative": "..."
      },
      ...4 protocols total
    ]
  }
}
```

#### 2. Catalog Page Visual Test
1. Open browser: `http://localhost:3000/catalog`
2. Verify loading skeleton appears briefly
3. Verify products section renders 5 cards
4. Verify protocols section renders 4 cards
5. Click product card → Modal opens
6. Click "Ver Detalhes" → Modal shows full INCI
7. Press ESC → Modal closes
8. Click protocol card → Modal shows protocol details
9. Verify prices displayed correctly
10. Check mobile view (320px width) → 1 column layout
11. Check tablet view (768px) → 2 columns
12. Check desktop (1024px+) → 3 columns (products), 2 (protocols)

#### 3. Error Handling Test
1. Stop dev server
2. Refresh catalog page
3. Verify error message displays: "Erro ao carregar catálogo..."
4. Restart server
5. Page should recover after refresh

#### 4. Accessibility Test
- Tab through cards → All buttons focusable
- Click card with keyboard → Modal opens
- Press ESC in modal → Modal closes
- Screen reader should read product names

---

## Manual Testing Checklist

### Story 1.2
- [ ] Migration applied without errors
- [ ] Products count = 5
- [ ] Protocols count = 4
- [ ] All INCI fields non-empty
- [ ] RLS policies enabled (6 total)
- [ ] Foreign keys enforced

### Story 1.3
- [ ] `npm run dev` starts without errors
- [ ] `GET /api/catalog` returns 200 with correct structure
- [ ] Catalog page loads in < 2s (after DB query)
- [ ] Skeleton loading state visible
- [ ] 5 products rendered with cards
- [ ] 4 protocols rendered with cards
- [ ] Modal opens on card click
- [ ] Modal displays full INCI nomenclature
- [ ] ESC closes modal
- [ ] Mobile layout = 1 column
- [ ] Desktop layout = 3 columns (products), 2 (protocols)
- [ ] Error message displays if API fails
- [ ] No console errors or warnings

---

## Next: QA Gate

When complete, stories are ready for `@qa *qa-gate` review:
- Code quality (patterns, readability)
- Unit test coverage (if added)
- Acceptance criteria met
- No regressions
- Performance acceptable (< 2s page load)
- Security (no PII logged)
