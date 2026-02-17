# ⚡ Quick Reference: Cart Update Fix

## What Was Broken

Cart items weren't updating after adding to cart - required page refresh.

## Root Causes Fixed

### 1️⃣ Query Key Mismatch (CRITICAL)

```typescript
// ❌ BEFORE (src/hooks/queries/use-cart.ts)
queryKey: [getUseCartQueryKey()]; // Creates [["cart"]]

// ✅ AFTER
queryKey: getUseCartQueryKey(); // Is ["cart"]
```

**Why:** Mutations invalidate `["cart"]` but query had `[["cart"]]` - no match = no refetch!

### 2️⃣ Hardcoded Keys in Components

```typescript
// ❌ BEFORE (add-to-cart-button.tsx, product-actions.tsx)
queryClient.invalidateQueries({ queryKey: ["cart"] });

// ✅ AFTER
queryClient.invalidateQueries({ queryKey: getUseCartQueryKey() });
```

**Why:** Single source of truth for query key prevents breaking changes

### 3️⃣ Missing Cache Configuration

```typescript
// ❌ BEFORE (src/providers/react-query.tsx)
const queryClient = new QueryClient();

// ✅ AFTER
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,              // Cache never fresh
      refetchOnWindowFocus: true, // Refetch on window focus
    },
  },
});

// ✅ ALSO ADDED to useCart
staleTime: 0,  // Ensures refetch on invalidation
```

**Why:** `staleTime: 0` makes cache immediately invalid when marked, triggering refetch

---

## Files Changed

| File                                         | Change                              | Impact                           |
| -------------------------------------------- | ----------------------------------- | -------------------------------- |
| `src/hooks/queries/use-cart.ts`              | Remove array wrapper from queryKey  | ✅ Keys now match                |
| `src/hooks/queries/use-cart.ts`              | Add `staleTime: 0`                  | ✅ Force refetch on invalidation |
| `src/providers/react-query.tsx`              | Add default config                  | ✅ Global cache behavior         |
| `src/app/product/.../add-to-cart-button.tsx` | Import + use `getUseCartQueryKey()` | ✅ Consistent keys               |
| `src/app/product/.../product-actions.tsx`    | Import + use `getUseCartQueryKey()` | ✅ Consistent keys               |

---

## How to Test

### ✅ Manual Test

1. Go to product page
2. Click "Adicionar à sacola"
3. **Watch cart update immediately** (no refresh needed!)

### ✅ DevTools Test

1. Open React Query DevTools
2. Watch "cart" query
3. Add product → should see query refetch

### ✅ Network Tab Test

1. Open DevTools Network tab
2. Add product → see:
   - POST (mutation)
   - GET (refetch)
   - In that order!

---

## Why Cart Wasn't Updating

```
🔴 Problem Chain:
useCart query key: [["cart"]]
         ↓
Mutations invalidate: ["cart"]
         ↓
Keys don't match: [["cart"]] ≠ ["cart"]
         ↓
Query not marked invalid
         ↓
staleTime undefined → might not refetch anyway
         ↓
Cart shows stale data
         ↓
User needs refresh
```

```
✅ Fixed Chain:
useCart query key: ["cart"]
         ↓
Mutations invalidate: ["cart"]
         ↓
Keys match: ["cart"] = ["cart"] ✓
         ↓
Query marked invalid
         ↓
staleTime: 0 → refetch immediately
         ↓
Cart refetches latest data
         ↓
Component re-renders instantly
         ↓
User sees updated cart! 🎉
```

---

## Key Takeaways

1. **Query keys must match exactly between query and invalidation**
   - Use same function `getUseCartQueryKey()` everywhere
   - Never hardcode query keys

2. **`staleTime` controls when refetch happens**
   - `staleTime: 0` = Always refetch (good for cart)
   - `staleTime: 60000` = Wait 60s before refetching (good for static data)

3. **Invalidation without refetch = wasted effort**
   - `invalidate` marks cache as stale
   - But `staleTime` determines when refetch actually happens
   - Both need to work together

4. **One QueryClient per app**
   - Configure defaults once in provider
   - All queries inherit unless overridden
   - Cart query adds its own `staleTime: 0` for extra safety

---

## Verification

All mutations already had cache invalidation:

- ✅ `useIncreaseCartProductQuantity`
- ✅ `useDecreaseCartProductQuantity`
- ✅ `useRemoveProductFromCart`
- ✅ `useUpdateCartShipping`
- ✅ `useUpdateCartShippingAddress`

Now they all work correctly because:

1. Query key matches mutation invalidation key
2. Cache is configured to refetch on invalidation
3. Components use consistent key function

---

## Testing Checklist

- [ ] Add product to cart → updates immediately
- [ ] Increase quantity → updates immediately
- [ ] Decrease quantity → updates immediately
- [ ] Remove item → updates immediately
- [ ] Close/reopen cart sidebar → still shows correct data
- [ ] Refresh page → cart data persists (expected from DB)
- [ ] Multiple products → all update in real-time
