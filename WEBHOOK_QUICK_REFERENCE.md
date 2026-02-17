# Webhook Quick Reference

## Endpoint

```
POST https://your-domain.com/api/webhooks/melhor-envio
GET  https://your-domain.com/api/webhooks/melhor-envio
```

## Webhook Payload Format

```json
{
  "event": "shipment.status_changed",
  "data": {
    "id": "melhor-envio-order-id-uuid",
    "status": "delivered|shipped|pending|paid|canceled",
    "tracking": "BR123456789BR",
    "delivered_at": "2026-02-16T10:00:00Z",
    "posted_at": "2026-02-15T10:00:00Z"
  }
}
```

## Status Mapping

| Melhor Envio | → Our Order | Email              |
| ------------ | ----------- | ------------------ |
| pending      | pending     | -                  |
| paid         | paid        | ✓ payment-approved |
| posted       | shipped     | -                  |
| in_transit   | shipped     | -                  |
| delivered    | delivered   | ✓ order-delivered  |
| canceled     | canceled    | -                  |
| returned     | (unchanged) | -                  |

## HTTP Response Codes

- **200 OK**: Webhook processed successfully
- **400 Bad Request**: Invalid payload (missing event or data.id)
- **404 Not Found**: Order not found in database
- **500 Error**: Server error (check logs)

## Response Body Format

```json
{
  "success": true,
  "message": "Webhook processed successfully",
  "orderId": "your-order-uuid",
  "status": "delivered"
}
```

## Quick Test

```bash
curl -X POST http://localhost:3000/api/webhooks/melhor-envio \
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

## Server Logs to Monitor

```
[Melhor Envio Webhook] Recebendo notificação
[Melhor Envio Webhook] Pedido encontrado: [order-id]
[Melhor Envio Webhook] Atualizando status: [old] → [new]
[Melhor Envio Webhook] Email enviado com sucesso
```

## Files

- `src/app/api/webhooks/melhor-envio/route.ts` - Handler
- `WEBHOOK_SETUP.md` - Setup guide
- `WEBHOOK_TESTING.md` - Test guide
- `WEBHOOK_IMPLEMENTATION_FINAL.md` - Full documentation

## Integration Checklist

- [ ] Webhook endpoint implemented (`route.ts`)
- [ ] Local testing with ngrok completed
- [ ] Configuration added to Melhor Envio
- [ ] Production URL updated
- [ ] Email notifications verified
- [ ] Order status updates confirmed
- [ ] Error handling tested
- [ ] Deployment successful

## Melhor Envio Configuration

1. Go to Dashboard → Settings/Webhooks
2. Click "Add Webhook"
3. URL: `https://your-domain.com/api/webhooks/melhor-envio`
4. Event: `shipment.status_changed`
5. Active: ✓ Enabled
6. Save

## Local Testing (ngrok)

```bash
# Terminal 1: Start ngrok
npx ngrok http 3000

# Terminal 2: Start dev server
npm run dev

# Terminal 3: Test webhook
curl -X POST https://xxxxx-xxx-xxxx.ngrok-free.dev/api/webhooks/melhor-envio \
  -H "Content-Type: application/json" \
  -d '{"event":"shipment.status_changed","data":{"id":"order-id","status":"delivered"}}'
```

## Database Query to Verify

```sql
-- Check webhook updates
SELECT id, status, tracking_code, updated_at
FROM "order"
WHERE melhor_envio_order_id = 'your-id'
ORDER BY updated_at DESC;

-- Check email notification preferences
SELECT email_notifications
FROM "order"
WHERE id = 'order-id';
```

## Troubleshooting

| Issue                | Solution                                       |
| -------------------- | ---------------------------------------------- |
| 404 Order not found  | Verify melhorEnvioOrderId exists in DB         |
| Email not sent       | User must enable notification in settings      |
| Webhook not received | Verify URL registered in Melhor Envio          |
| Wrong status         | Check webhook payload has correct status value |
| Server error         | Check logs for detailed error message          |

## Important Notes

- Webhook validates order exists before updating
- Email failures don't block status updates
- Respects user email notification preferences
- Comprehensive logging for debugging
- No signature verification needed (Melhor Envio doesn't provide)
- Supports multiple simultaneous webhooks

---

**Status**: ✅ Ready for Production
