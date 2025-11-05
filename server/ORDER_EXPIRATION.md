# Automatic Order Expiration & Cancellation

## Overview
This system automatically cancels orders with expired payment actions after 10 minutes of inactivity.

## How It Works

### 1. Automatic Scheduler
- **Location**: `server/src/utils/scheduler.utils.ts`
- **Frequency**: Runs every 1 minute (60 seconds)
- **Started**: Automatically when the server starts in `server/index.ts`

### 2. Expiration Logic
- Orders with status `PENDING` are checked
- If order date is older than **10 minutes**, it gets cancelled
- Status is updated from `PENDING` to `CANCELLED` in the database

### 3. Manual Endpoints

#### Check Expired Orders (Manual Trigger)
```http
GET /api/payment/check-expired
```
**Response:**
```json
{
  "success": true,
  "data": {
    "checked": 15,
    "cancelled": 3,
    "cancelledOrderIds": [123, 124, 125]
  },
  "message": "Checked 15 orders, cancelled 3 expired orders"
}
```

#### Cancel Single Order
```http
POST /api/payment/cancel
Content-Type: application/json

{
  "order_id": 123
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "order_id": 123,
    "status": "CANCELLED",
    "date": "2025-11-05T10:30:00.000Z"
  },
  "message": "Order 123 has been cancelled"
}
```

## Database Schema
The `order` table has a `status` field that can be:
- `PENDING` - Waiting for payment
- `PAID` - Payment completed successfully
- `CANCELLED` - Order cancelled (expired or manual)

## Files Modified

### Backend
1. **`server/src/services/payment.service.ts`**
   - Added `checkExpiredOrders()` - Finds and cancels expired orders
   - Added `cancelOrder()` - Manually cancel a specific order

2. **`server/src/controller/payment.controller.ts`**
   - Added `checkExpiredOrders` endpoint handler
   - Added `cancelOrder` endpoint handler
   - Emits WebSocket events for real-time updates

3. **`server/src/routes/payment.routes.ts`**
   - Added `GET /check-expired` route
   - Added `POST /cancel` route

4. **`server/src/utils/scheduler.utils.ts`** (NEW)
   - Background job that runs every minute
   - Automatically checks and cancels expired orders

5. **`server/index.ts`**
   - Integrated scheduler on server startup

## Testing

### Test Automatic Cancellation
1. Create an order via POS
2. Don't complete payment
3. Wait 10+ minutes
4. Check the order status - should be `CANCELLED`

### Test Manual Check
```bash
curl http://localhost:5000/api/payment/check-expired
```

### Test Manual Cancel
```bash
curl -X POST http://localhost:5000/api/payment/cancel \
  -H "Content-Type: application/json" \
  -d '{"order_id": 123}'
```

## Configuration

To change the expiration time, edit `server/src/services/payment.service.ts`:

```typescript
// Currently set to 10 minutes (600000 ms)
if (timeDiff > 600000) { // Change this value
  expiredOrderIds.push(order.order_id);
}
```

**Common values:**
- 5 minutes: `300000`
- 10 minutes: `600000` (current)
- 15 minutes: `900000`
- 30 minutes: `1800000`

## Logs

The system logs the following:
- `🕐 Running scheduled expired orders check...` - Every minute
- `⚠️ Automatically cancelled X expired orders` - When orders are cancelled
- `✅ No expired orders found` - When all orders are valid
- `❌ Error in scheduled expired orders check` - If something goes wrong

## WebSocket Events

When an order is cancelled, a WebSocket event is emitted:
```javascript
{
  order_id: 123,
  status: 'cancelled',
  timestamp: '2025-11-05T10:30:00.000Z'
}
```

This allows the frontend to update in real-time.
