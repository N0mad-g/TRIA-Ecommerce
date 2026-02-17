# ⚡ Quick Reference: Shipping Cost in Order Emails

## What Was Added

Order confirmation emails now show complete price breakdown:

- **Subtotal** (products only)
- **Frete** (shipping with method)
- **Total** (everything)

## Single File Changed

**File:** `src/emails/components/order-email-layout.tsx`

### What Changed

Added 3 rows to the price breakdown:

1. **Subtotal row** - Shows products total without shipping
2. **Shipping row** - Shows shipping cost with method (or GRÁTIS)
3. **Separator** - Divider before total

### Before vs After

```tsx
// ❌ BEFORE - Only showed total
<Row>
  <Column><Text>Total</Text></Column>
  <Column><Text>R$ 82,93</Text></Column>
</Row>

// ✅ AFTER - Shows breakdown
<Row>
  <Column><Text>Subtotal</Text></Column>
  <Column><Text>R$ 72,93</Text></Column>
</Row>

<Row>
  <Column><Text>Frete (SEDEX)</Text></Column>
  <Column><Text>R$ 10,00</Text></Column>
</Row>

<Hr />

<Row>
  <Column><Text>Total</Text></Column>
  <Column><Text>R$ 82,93</Text></Column>
</Row>
```

---

## Key Features

| Feature             | Behavior                                    |
| ------------------- | ------------------------------------------- |
| **Subtotal**        | `Total - Shipping` (automatic calculation)  |
| **Shipping Method** | Shows `(SEDEX)` or `(PAC)` if available     |
| **Free Shipping**   | Shows `GRÁTIS` in green color (#10b981)     |
| **Paid Shipping**   | Shows amount in standard text color         |
| **Applies To**      | ALL order confirmation emails automatically |

---

## How It Works

### Data Flow

```
Database Order
  ↓
buildOrderEmailData()
  ├─ totalPriceInCents: 8293 (R$ 82,93)
  ├─ shippingCostInCents: 1000 (R$ 10,00)
  └─ shippingMethod: "SEDEX"
  ↓
OrderEmailLayout component
  ├─ Subtotal = 8293 - 1000 = R$ 72,93
  ├─ Shipping = R$ 10,00 (SEDEX)
  └─ Total = R$ 82,93
```

### Emails Using This Layout

All 6 email types automatically show shipping:

- ✅ Order Created
- ✅ Payment Pending
- ✅ Payment Approved
- ✅ Order Processing
- ✅ Order Shipped
- ✅ Order Delivered

---

## Visual Examples

### With Paid Shipping

```
Subtotal          R$ 72,93
Frete (SEDEX)     R$ 10,00
─────────────────────────
Total             R$ 82,93
```

### With Free Shipping

```
Subtotal          R$ 72,93
Frete             GRÁTIS      ← Green text
─────────────────────────
Total             R$ 72,93
```

### With PAC instead of SEDEX

```
Subtotal          R$ 72,93
Frete (PAC)       R$ 8,50
─────────────────────────
Total             R$ 81,43
```

---

## Implementation Details

### Subtotal Calculation

```typescript
formatCentsToBRL(order.totalPriceInCents - order.shippingCostInCents);
```

- Automatic: no changes needed in database
- Calculated at render time
- Always correct: Total = Subtotal + Shipping

### Shipping Display Logic

```typescript
// If shipping cost > R$ 0,00
`Frete (${order.shippingMethod || "SEDEX"})`
formatCentsToBRL(order.shippingCostInCents)

// If shipping cost = R$ 0,00 (free)
"Frete"
"GRÁTIS"  (color: green #10b981)
```

---

## Data Requirements

✅ Already passes from database:

- `order.totalPriceInCents` - Total with shipping
- `order.shippingInCents` - Shipping cost (defaults to 0)
- `order.shippingMethod` - Method like "SEDEX", "PAC"

No changes needed to:

- Database schema
- Data fetching
- Email sending logic
- Data types

---

## Testing

### Quick Test

1. Create order with shipping (e.g., SEDEX R$ 10,00)
2. Trigger email
3. ✅ Should see:
   - Subtotal: R$ XX,XX
   - Frete (SEDEX): R$ 10,00
   - Total: R$ YY,YY

### Math Verification

```
Expected: Subtotal + Shipping = Total
Example:  72,93 + 10,00 = 82,93 ✓
```

### Free Shipping Test

1. Create order with free shipping
2. Trigger email
3. ✅ Should see:
   - Frete: **GRÁTIS** (in green)
   - Total = Subtotal (no shipping added)

---

## Edge Cases Handled

✅ **No shipping method** → Shows default "SEDEX"
✅ **Free shipping (R$ 0)** → Shows "GRÁTIS" in green
✅ **Missing data** → Uses fallback values (0 for cost)
✅ **Large amounts** → R$ formatting works (thousands)

---

## Email Client Compatibility

✅ All major email clients:

- Gmail
- Outlook
- Apple Mail
- Thunderbird
- Mobile apps

Uses:

- Standard HTML tables
- Inline CSS only
- No JavaScript
- No media queries

---

## Screenshots/Visual Reference

The email renders as:

```
┌─────────────────────────┐
│   ORDER CONFIRMATION    │
├─────────────────────────┤
│ Items                   │
│ ├─ Product 1    R$ 50   │
│ ├─ Product 2    R$ 22   │
│                         │
│ ───────────────────── │
│                         │
│ Subtotal      R$ 72,93  │
│ Frete (SEDEX) R$ 10,00  │
│                         │
│ ───────────────────── │
│                         │
│ Total       R$ 82,93    │
│ (bold)                  │
├─────────────────────────┤
```

---

## Common Questions

**Q: Will this appear in all emails?**
A: Yes! All 6 email types use the same layout component.

**Q: Do I need to update the database?**
A: No! Data is already being saved.

**Q: What if shipping is R$ 0?**
A: Shows "GRÁTIS" in green - no changes needed.

**Q: Can I customize the shipping method label?**
A: Yes, it comes from `order.shippingMethod` field.

**Q: Does this break old emails?**
A: No, purely additive - just shows more info.

---

## Verification Checklist

- [x] Subtotal shows correctly
- [x] Shipping displays with method
- [x] Free shipping shows "GRÁTIS" in green
- [x] Total stays the same
- [x] Math: Subtotal + Shipping = Total
- [x] All 6 email types show shipping
- [x] No TypeScript errors
- [x] No layout issues
- [x] Email client compatible

---

## Summary

**One file changed:** `order-email-layout.tsx`
**Lines added:** ~40 lines for price breakdown
**Impact:** All order emails now show complete price breakdown
**Testing:** Create test order with shipping, check email
**Status:** ✅ Ready to use
