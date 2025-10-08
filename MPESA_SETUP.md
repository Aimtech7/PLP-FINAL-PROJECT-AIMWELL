# M-Pesa Daraja API Integration Guide

## Overview
AIMWELL now supports M-Pesa payments through the Safaricom Daraja API (Lipa Na M-Pesa Online). Users can subscribe to premium plans using their M-Pesa mobile money accounts.

## Features Implemented

### 1. Database Schema
- **mpesa_transactions** table tracks all M-Pesa payments
- Stores transaction status, amounts, phone numbers, and M-Pesa receipts
- Row Level Security (RLS) enabled for data protection

### 2. Edge Functions

#### mpesa-stk-push
- Initiates STK Push (Lipa Na M-Pesa) payment requests
- Validates phone numbers (254XXXXXXXXX format)
- Handles Safaricom API authentication
- Records transactions in database

#### mpesa-callback
- Receives payment confirmations from Safaricom
- Updates transaction status (completed/failed)
- Stores M-Pesa receipt numbers
- Public endpoint (no JWT verification required)

### 3. Frontend Components

#### MpesaPayment Component
- User-friendly payment interface
- Phone number validation and formatting
- Real-time payment status updates
- Automatic polling for transaction completion
- Success/failure notifications

#### Subscription Page Integration
- Dual payment options: M-Pesa and Stripe
- Payment method selection dialog
- Seamless integration with existing subscription flow

## Configuration Required

### Environment Variables
Configure these in your Supabase Edge Functions secrets:

```bash
# M-Pesa Credentials (from Daraja Portal)
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=your_shortcode  # Business Shortcode
MPESA_PASSKEY=your_passkey      # Lipa Na M-Pesa Passkey

# Optional
MPESA_ENV=sandbox  # or 'production'
MPESA_CALLBACK_URL=https://your-project.supabase.co/functions/v1/mpesa-callback
```

### Getting M-Pesa Credentials

1. **Register on Daraja Portal**
   - Visit: https://developer.safaricom.co.ke/
   - Create an account
   - Create a new app

2. **Get Sandbox Credentials**
   - Consumer Key and Consumer Secret from your app
   - Test Credentials: Shortcode `174379` and Passkey provided in docs

3. **For Production**
   - Apply for Lipa Na M-Pesa through Safaricom
   - Get your business shortcode and passkey
   - Update environment variables with production credentials

## How It Works

### Payment Flow

1. **User Initiates Payment**
   - Selects a subscription plan
   - Chooses M-Pesa payment method
   - Enters phone number (07XX or 01XX format)

2. **STK Push Request**
   - System formats phone to 254XXXXXXXXX
   - Calls `mpesa-stk-push` Edge Function
   - Safaricom sends prompt to user's phone
   - Transaction saved as 'pending'

3. **User Completes Payment**
   - User enters M-Pesa PIN on phone
   - Confirms payment amount

4. **Callback Processing**
   - Safaricom sends result to `mpesa-callback`
   - Transaction status updated (completed/failed)
   - M-Pesa receipt number stored

5. **Frontend Updates**
   - Automatic status polling (every 3 seconds)
   - Success notification with receipt
   - Subscription activated

## Testing

### Sandbox Test Credentials
- **Test Phone Number**: 254708374149
- **Test Amount**: Any amount between 1-150,000 KES
- **Test PIN**: Provided by Safaricom (check Daraja docs)

### Test Flow
1. Go to Subscription page
2. Click "Subscribe" on any paid plan
3. Select "M-Pesa" payment method
4. Enter: 0708374149
5. Complete the STK push on test phone
6. Verify transaction in database

## Database Queries

### View Recent Transactions
```sql
SELECT
  id,
  phone_number,
  amount,
  status,
  mpesa_receipt_number,
  created_at
FROM mpesa_transactions
ORDER BY created_at DESC
LIMIT 10;
```

### Check User Payments
```sql
SELECT * FROM mpesa_transactions
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC;
```

## Security Features

1. **Phone Number Validation**
   - Regex validation for Kenyan numbers
   - Format: 254[17]XXXXXXXX

2. **Amount Limits**
   - Minimum: 1 KES
   - Maximum: 150,000 KES

3. **Authentication**
   - JWT required for STK Push endpoint
   - User can only create own transactions
   - RLS policies protect user data

4. **Callback Security**
   - Unique checkout request IDs
   - Transaction matching
   - Idempotent updates

## Troubleshooting

### Common Issues

**1. "M-Pesa service not configured"**
- Check environment variables are set
- Verify variable names match exactly

**2. "Invalid phone number format"**
- Use format: 07XXXXXXXX or 01XXXXXXXX
- System auto-converts to 254 format

**3. "Payment timeout"**
- User has 60 seconds to complete
- Check phone has M-Pesa menu
- Verify network connectivity

**4. "Failed to authenticate with M-Pesa"**
- Check Consumer Key/Secret are correct
- Verify credentials are for correct environment (sandbox/prod)

### Debug Logs
Check Edge Function logs in Supabase Dashboard:
- Functions → mpesa-stk-push → Logs
- Functions → mpesa-callback → Logs

## Production Checklist

- [ ] Apply for Lipa Na M-Pesa on Safaricom
- [ ] Get production shortcode and passkey
- [ ] Update `MPESA_ENV` to `production`
- [ ] Update all M-Pesa credentials
- [ ] Set public callback URL
- [ ] Register callback URL with Safaricom
- [ ] Test with real transactions
- [ ] Monitor transaction logs
- [ ] Set up reconciliation process

## Support

For M-Pesa API issues:
- Daraja Portal: https://developer.safaricom.co.ke/
- Safaricom Support: developer@safaricom.co.ke

For AIMWELL integration issues:
- Check Edge Function logs
- Review transaction records in database
- Verify environment variables
