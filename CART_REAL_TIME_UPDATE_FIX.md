# 🛒 Cart Real-Time Update Fix

## Problem

Cart items weren't updating immediately after clicking "Add to cart". Products only appeared after navigation or page refresh.

## Root Cause Analysis

Three critical issues prevented cache invalidation from triggering cart refetch:

### 🔴 **Issue #1: Query Key Double-Wrap**

**File:** `src/hooks/queries/use-cart.ts`

**Before:**

```typescript
export const useCart = () => {
  return useQuery({
    queryKey: [getUseCartQueryKey()], // ❌ Creates [["cart"]]
    queryFn: () => getCart(),
  });
};
```

**Problem:**

- `getUseCartQueryKey()` already returns `["cart"] as const`
- Wrapping it in brackets creates `[["cart"]]`
- When mutations invalidate with `getUseCartQueryKey()` (which is `["cart"]`), the keys don't match!
- Query is never considered invalid, so no refetch occurs

**After:**

```typescript
export const useCart = () => {
  return useQuery({
    queryKey: getUseCartQueryKey(), // ✅ Correct key ["cart"]
    queryFn: () => getCart(),
    staleTime: 0, // ✅ Cache always considered stale
  });
};
```

---

### 🔴 **Issue #2: Hardcoded Query Keys in Components**

**Files:**

- `src/app/product/[slug]/components/add-to-cart-button.tsx`
- `src/app/product/[slug]/components/product-actions.tsx`

**Before:**

```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["cart"] });  // ❌ String literal
  toast.success("Produto adicionado à sacola");
},
```

**Problem:**

- Using hardcoded `["cart"]` instead of `getUseCartQueryKey()`
- If query key definition changes, invalidation breaks
- Not consistent with mutation hooks which use `getUseCartQueryKey()`

**After:**

```typescript
// Add import
import { getUseCartQueryKey } from "@/hooks/queries/use-cart";

// Use consistent key function
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: getUseCartQueryKey() });  // ✅ Consistent
  toast.success("Produto adicionado à sacola");
},
```

---

### 🔴 **Issue #3: Missing React Query Configuration**

**File:** `src/providers/react-query.tsx`

**Before:**

```typescript
const queryClient = new QueryClient(); // ❌ No default configuration
```

**Problem:**

- Queries could cache indefinitely without proper configuration
- Window focus refetches not enabled by default
- Cart query needs `staleTime: 0` to always refetch on invalidation

**After:**

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // ✅ Cache always stale
      refetchOnWindowFocus: true, // ✅ Refetch when window regains focus
    },
  },
});
```

---

## Changes Applied

### 1. Fixed useCart Query Hook

**File:** `src/hooks/queries/use-cart.ts`

```diff
  export const useCart = () => {
    return useQuery({
-     queryKey: [getUseCartQueryKey()],
+     queryKey: getUseCartQueryKey(),
      queryFn: () => getCart(),
+     staleTime: 0,
    });
  };
```

### 2. Configured React Query Defaults

**File:** `src/providers/react-query.tsx`

```diff
- const queryClient = new QueryClient();
+ const queryClient = new QueryClient({
+   defaultOptions: {
+     queries: {
+       staleTime: 0,
+       refetchOnWindowFocus: true,
+     },
+   },
+ });
```

### 3. Fixed AddToCartButton Cache Invalidation

**File:** `src/app/product/[slug]/components/add-to-cart-button.tsx`

```diff
+ import { getUseCartQueryKey } from "@/hooks/queries/use-cart";

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      addProductToCart({
        productId,
        quantity,
      }),
    onSuccess: () => {
-     queryClient.invalidateQueries({ queryKey: ["cart"] });
+     queryClient.invalidateQueries({ queryKey: getUseCartQueryKey() });
      toast.success("Produto adicionado à sacola");
    },
  });
```

### 4. Fixed ProductActions Cache Invalidation

**File:** `src/app/product/[slug]/components/product-actions.tsx`

```diff
+ import { getUseCartQueryKey } from "@/hooks/queries/use-cart";

  const { mutate: addAndGo, isPending: isBuyingNow } = useMutation({
    mutationFn: () =>
      addProductToCart({
        productId,
        quantity,
      }),
    onSuccess: () => {
-     queryClient.invalidateQueries({ queryKey: ["cart"] });
+     queryClient.invalidateQueries({ queryKey: getUseCartQueryKey() });
      router.push("/cart/identification");
    },
  });
```

---

## How It Works Now

### ✅ Cache Invalidation Flow

1. **User clicks "Add to cart"**
   - `AddToCartButton` mutation triggers
   - Product added to database via `addProductToCart` action

2. **onSuccess callback fires**
   - `queryClient.invalidateQueries({ queryKey: getUseCartQueryKey() })`
   - This marks cart query as invalid

3. **Query re-fetches automatically**
   - `useCart` hook detects `staleTime: 0` (cache always stale)
   - Query refetches latest cart data via `getCart` action

4. **Cart component updates immediately**
   - `Cart` component receives new data
   - CartItem components re-render
   - User sees updated cart instantly

---

## Verification Checklist

✅ **Query Key Consistency**

- `getUseCartQueryKey()` returns `["cart"] as const`
- All mutations use `getUseCartQueryKey()` for invalidation
- `useCart` hook query key matches mutation invalidation keys

✅ **Cache Configuration**

- `staleTime: 0` on cart query ensures refetch on invalidation
- React Query provider has default `refetchOnWindowFocus: true`
- Default `staleTime: 0` applies to all queries unless overridden

✅ **Mutation Cache Invalidation**

- All cart mutations invalidate with same key:
  - `useIncreaseCartProductQuantity` ✓
  - `useDecreaseCartProductQuantity` ✓
  - `useRemoveProductFromCart` ✓
  - `useUpdateCartShipping` ✓
  - `useUpdateCartShippingAddress` ✓

✅ **Component Integration**

- `Cart` component uses `useCart()` hook
- `CartItem` components use individual mutations
- All mutations trigger cache invalidation on success

---

## Testing

### Manual Testing Steps

1. **Add product to cart**
   - Navigate to product page
   - Click "Adicionar à sacola"
   - ✅ Cart sidebar should update immediately (no page refresh needed)

2. **Update quantity in cart**
   - Open cart sidebar
   - Click +/- buttons
   - ✅ Quantity should update in real-time

3. **Remove item from cart**
   - Open cart sidebar
   - Click trash icon
   - ✅ Item should remove immediately

4. **Multiple products**
   - Add multiple products
   - ✅ Cart total should update in real-time

### Browser DevTools Testing

1. **React Query DevTools** (if installed)
   - Open DevTools
   - Watch "cart" query
   - Add product to cart
   - Observe query refetch immediately

2. **Network Tab**
   - Add product to cart
   - Should see:
     1. POST to `/add-to-cart-product` (mutation)
     2. GET to `/get-cart` (refetch)

3. **Console Logs**
   - Monitor for React Query cache operations
   - Verify `invalidateQueries` is called

---

## Why This Fixes the Issue

### Before Fix

```
User adds product → Mutation succeeds → Cache invalidation attempts
  ↓
  Invalidates with ["cart"] ← but query key is [["cart"]]
  ↓
  Keys don't match! No invalidation occurs
  ↓
  Cart component shows stale data
  ↓
  User must navigate away to see updated cart
```

### After Fix

```
User adds product → Mutation succeeds → Cache invalidation executes
  ↓
  Invalidates with ["cart"] ← and query key IS ["cart"]
  ↓
  Keys match! Invalidation succeeds
  ↓
  staleTime: 0 means cache is immediately considered stale
  ↓
  useCart hook detects stale cache and refetches
  ↓
  Cart component re-renders with fresh data
  ↓
  User sees updated cart instantly ✨
```

---

## Related Files Already Correct

The following files already had proper cache invalidation and required no changes:

✅ `src/hooks/mutations/use-increase-cart-product.ts`

- Uses `getUseCartQueryKey()` correctly

✅ `src/hooks/mutations/use-decrease-cart-product.ts`

- Uses `getUseCartQueryKey()` correctly

✅ `src/hooks/mutations/use-remove-product-from-cart.ts`

- Uses `getUseCartQueryKey()` correctly

✅ `src/hooks/mutations/use-update-cart-shipping.ts`

- Uses `getUseCartQueryKey()` correctly

✅ `src/hooks/mutations/use-update-cart-shipping-address.ts`

- Uses `getUseCartQueryKey()` correctly

✅ `src/components/common/cart.tsx`

- Uses `useCart()` hook correctly

✅ `src/components/common/cart-item.tsx`

- All mutations properly invalidate cart

---

## Summary

**Fixed:** 4 files changed

1. `src/hooks/queries/use-cart.ts` - Fixed query key double-wrap
2. `src/providers/react-query.tsx` - Added default configuration
3. `src/app/product/[slug]/components/add-to-cart-button.tsx` - Fixed invalidation key
4. `src/app/product/[slug]/components/product-actions.tsx` - Fixed invalidation key

**Result:** Cart now updates in real-time when products are added, quantities changed, or items removed.

---

## Advanced: Optimistic Updates (Optional Enhancement)

If you want even faster UX with optimistic updates, you can implement this pattern:

```typescript
const { mutate, isPending } = useMutation({
  mutationFn: () => addProductToCart({ productId, quantity }),
  onMutate: async (variables) => {
    // Cancel ongoing queries
    await queryClient.cancelQueries({ queryKey: getUseCartQueryKey() });

    // Snapshot previous data
    const previousCart = queryClient.getQueryData(getUseCartQueryKey());

    // Optimistically update
    queryClient.setQueryData(getUseCartQueryKey(), (old) => {
      // Add product optimistically
      return { ...old, items: [...old.items, newItem] };
    });

    return { previousCart };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    if (context?.previousCart) {
      queryClient.setQueryData(getUseCartQueryKey(), context.previousCart);
    }
  },
  onSuccess: () => {
    // Refetch to ensure correctness
    queryClient.invalidateQueries({ queryKey: getUseCartQueryKey() });
  },
});
```

This provides instant visual feedback while ensuring data consistency.
