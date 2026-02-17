# Testing the Melhor Envio Webhook

## Quick Start Testing

### 1. Test Endpoint is Accessible

```bash
# GET request to verify webhook is active
curl -X GET http://localhost:3000/api/webhooks/melhor-envio

# Response should be:
# {
#   "status": "Webhook endpoint active",
#   "timestamp": "2026-02-16T10:00:00.000Z"
# }
```

### 2. Send Test Webhook (Local Testing)

First, ensure you know an order's `melhorEnvioOrderId` from your database:

```bash
# Get the melhorEnvioOrderId from your database
# SELECT id, melhor_envio_order_id FROM "order" LIMIT 1;
# Note: The id should match an existing order

curl -X POST http://localhost:3000/api/webhooks/melhor-envio \
  -H "Content-Type: application/json" \
  -d '{
    "event": "shipment.status_changed",
    "data": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "status": "delivered",
      "tracking": "BR123456789BR",
      "delivered_at": "2026-02-16T15:30:00Z"
    }
  }'
```

Expected response (200):

```json
{
  "success": true,
  "message": "Webhook processed successfully",
  "orderId": "your-order-id",
  "status": "delivered"
}
```

### 3. Test with Invalid Order ID

```bash
curl -X POST http://localhost:3000/api/webhooks/melhor-envio \
  -H "Content-Type: application/json" \
  -d '{
    "event": "shipment.status_changed",
    "data": {
      "id": "invalid-id-that-does-not-exist",
      "status": "delivered"
    }
  }'
```

Expected response (404):

```json
{
  "error": "Order not found"
}
```

### 4. Test with Invalid Payload

```bash
curl -X POST http://localhost:3000/api/webhooks/melhor-envio \
  -H "Content-Type: application/json" \
  -d '{
    "event": "shipment.status_changed"
    // Missing data field
  }'
```

Expected response (400):

```json
{
  "error": "Invalid payload"
}
```

## Testing Different Statuses

### Status: Delivered (Most Important)

```bash
curl -X POST http://localhost:3000/api/webhooks/melhor-envio \
  -H "Content-Type: application/json" \
  -d '{
    "event": "shipment.status_changed",
    "data": {
      "id": "your-melhor-envio-id",
      "status": "delivered",
      "tracking": "BR123456789BR",
      "delivered_at": "2026-02-16T15:30:00Z"
    }
  }'
```

Check database:

```sql
SELECT id, status, tracking_code FROM "order"
WHERE melhor_envio_order_id = 'your-melhor-envio-id';
-- Should show: status = 'delivered', tracking_code = 'BR123456789BR'
```

### Status: Payment Approved

```bash
curl -X POST http://localhost:3000/api/webhooks/melhor-envio \
  -H "Content-Type: application/json" \
  -d '{
    "event": "shipment.status_changed",
    "data": {
      "id": "your-melhor-envio-id",
      "status": "paid"
    }
  }'
```

### Status: Shipped/Posted

```bash
curl -X POST http://localhost:3000/api/webhooks/melhor-envio \
  -H "Content-Type: application/json" \
  -d '{
    "event": "shipment.status_changed",
    "data": {
      "id": "your-melhor-envio-id",
      "status": "posted",
      "tracking": "BR123456789BR",
      "posted_at": "2026-02-15T10:00:00Z"
    }
  }'
```

### Status: In Transit

```bash
curl -X POST http://localhost:3000/api/webhooks/melhor-envio \
  -H "Content-Type: application/json" \
  -d '{
    "event": "shipment.status_changed",
    "data": {
      "id": "your-melhor-envio-id",
      "status": "in_transit",
      "tracking": "BR123456789BR"
    }
  }'
```

### Status: Cancelled

```bash
curl -X POST http://localhost:3000/api/webhooks/melhor-envio \
  -H "Content-Type: application/json" \
  -d '{
    "event": "shipment.status_changed",
    "data": {
      "id": "your-melhor-envio-id",
      "status": "canceled"
    }
  }'
```

## Testing with Database Verification

### Before Testing

```sql
-- Check the order exists with a melhorEnvioOrderId
SELECT id, status, tracking_code, email_notifications
FROM "order"
WHERE melhor_envio_order_id IS NOT NULL
LIMIT 5;
```

### After Sending Webhook

```sql
-- Verify status updated
SELECT id, status, tracking_code
FROM "order"
WHERE id = 'your-order-id';

-- Check email notification preferences
SELECT id, status, email_notifications
FROM "order"
WHERE id = 'your-order-id';
```

Expected `email_notifications` value:

```json
{
  "orderCreated": false,
  "paymentPending": false,
  "paymentApproved": false,
  "processing": false,
  "shipped": false,
  "delivered": true
}
```

## Testing with ngrok (Remote Testing)

### Step 1: Start ngrok

```bash
npx ngrok http 3000
# Output:
# Forwarding    https://xxxxx-xxx-xxxx.ngrok-free.dev -> http://localhost:3000
```

### Step 2: Test Remote Endpoint

```bash
# Test GET
curl -X GET https://xxxxx-xxx-xxxx.ngrok-free.dev/api/webhooks/melhor-envio

# Test POST with real order data
curl -X POST https://xxxxx-xxx-xxxx.ngrok-free.dev/api/webhooks/melhor-envio \
  -H "Content-Type: application/json" \
  -d '{
    "event": "shipment.status_changed",
    "data": {
      "id": "your-melhor-envio-id",
      "status": "delivered",
      "tracking": "BR123456789BR"
    }
  }'
```

### Step 3: Monitor in ngrok Dashboard

Open http://127.0.0.1:4040 to see:

- All incoming requests
- Request headers and body
- Response status and body
- Request timing

## Testing Email Notifications

### Check if User Enabled Notifications

```sql
SELECT email_notifications, status
FROM "order"
WHERE id = 'your-order-id';
```

Expected for delivered notification to send:

```json
{
  "delivered": true
}
```

### Verify Email Was Sent

Check your email provider logs or:

1. Check "order_delivered" email was queued
2. Look for `[Melhor Envio Webhook] Enviando email: order-delivered` in logs
3. Check for `[Melhor Envio Webhook] Email enviado com sucesso` in logs

If email not sent but webhook succeeded:

```
[Melhor Envio Webhook] Email não enviado: notificação desativada pelo usuário (delivered)
```

## Testing with Postman

1. Create new POST request
2. URL: `http://localhost:3000/api/webhooks/melhor-envio`
3. Headers tab:
   - Content-Type: application/json
4. Body tab → raw → JSON:

```json
{
  "event": "shipment.status_changed",
  "data": {
    "id": "your-melhor-envio-id",
    "status": "delivered",
    "tracking": "BR123456789BR",
    "delivered_at": "2026-02-16T15:30:00Z"
  }
}
```

5. Send and check response

## Server Logs to Monitor

Watch your dev server terminal for:

```
[Melhor Envio Webhook] Recebendo notificação
[Melhor Envio Webhook] Payload: {...}
[Melhor Envio Webhook] Pedido encontrado: abc-123
[Melhor Envio Webhook] Atualizando status: shipped → delivered
[Melhor Envio Webhook] Status atualizado com sucesso
[Melhor Envio Webhook] Enviando email: order-delivered
[Melhor Envio Webhook] Email enviado com sucesso
```

## Troubleshooting Guide

### Issue: 404 Order not found

```
[Melhor Envio Webhook] Pedido não encontrado: xxx
```

**Solutions**:

1. Verify the melhorEnvioOrderId exists in database:

   ```sql
   SELECT * FROM "order" WHERE melhor_envio_order_id = 'xxx';
   ```

2. Ensure shipment was created successfully in create-melhor-envio-shipment action

3. Check if melhorEnvioOrderId was saved when creating shipment

### Issue: Email not sending

```
[Melhor Envio Webhook] Email não enviado: notificação desativada pelo usuário
```

**Solutions**:

1. User needs to enable delivery notifications in account settings
2. Update email_notifications in database:
   ```sql
   UPDATE "order"
   SET email_notifications = jsonb_set(
     email_notifications,
     '{delivered}',
     'true'
   )
   WHERE id = 'your-order-id';
   ```

### Issue: Status not updating

**Check**:

1. Order exists in database
2. Status change is valid (not already in that status)
3. Check server logs for any errors
4. Verify database connection

### Issue: Wrong status returned

```
[Melhor Envio Webhook] Status não mapeado: unknown_status
```

**Check**:

1. Melhor Envio status value matches expected values:
   - pending, paid, posted, in_transit, delivered, canceled, returned
2. Status is lowercase in webhook payload
3. Add more status mappings if needed

## Performance Testing

### Test Multiple Webhooks

```bash
# Send 10 consecutive webhooks
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/webhooks/melhor-envio \
    -H "Content-Type: application/json" \
    -d "{
      \"event\": \"shipment.status_changed\",
      \"data\": {
        \"id\": \"test-order-$i\",
        \"status\": \"delivered\"
      }
    }"
  sleep 0.1
done
```

Monitor:

- Response times
- Database query performance
- Email queue processing
- Error rates

## Integration Testing

### Full Flow Test

1. Create an order in the system
2. Calculate shipping
3. Proceed to checkout (order gets shippingServiceId)
4. Finish order (creates cart, checkout, generates label, stores melhorEnvioOrderId)
5. Admin changes status to "shipped" (creates Melhor Envio shipment)
6. Simulate webhook: `status: "delivered"`
7. Verify:
   - Order status changed to delivered
   - Tracking code saved
   - Email sent to customer
   - Order status visible in admin dashboard

## Browser Testing

### Open DevTools Network Tab

1. F12 → Network tab
2. Filter: "webhooks"
3. Send webhook request
4. See request/response details

### Check Response Headers

Look for:

- Content-Type: application/json
- Status: 200 OK
- Response body with success flag

---

**All tests passing? Webhook is ready for production! 🎉**
