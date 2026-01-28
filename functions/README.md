# Appwrite Functions Configuration Guide

This document outlines all required environment variables and deployment procedures for Videmy's Appwrite Functions.

---

## Overview

Videmy uses two Appwrite Functions:

1. **Payment Service** (`69786cf5002c98d74ce7`) - Handles Stripe payments and enrollments
2. **User Management** (`6978beb0001820d28ca3`) - Manages user roles and status

---

## Environment Variables

All variables must be configured in **Appwrite Console** → **Functions** → **Settings** → **Environment Variables**

### Payment Service

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `STRIPE_SECRET_KEY` | Stripe API secret key | `sk_live_...` or `sk_test_...` | ✅ Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | `whsec_...` | ✅ Yes |
| `DATABASE_ID` | Appwrite database ID | `videmy_db` | ✅ Yes |
| `COURSES_COLLECTION_ID` | Courses collection ID | Get from Console | ✅ Yes |
| `ENROLLMENTS_COLLECTION_ID` | Enrollments collection ID | Get from Console | ✅ Yes |
| `APPWRITE_API_KEY` | Appwrite API key (full permissions) | Get from Console | ✅ Yes |
| `APPWRITE_ENDPOINT` | Appwrite API endpoint | `https://api.aes.my.id/v1` | ✅ Yes |

### User Management

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `DATABASE_ID` | Appwrite database ID | `videmy_db` | ✅ Yes |
| `COLLECTION_USERS_ID` | Users collection ID | Get from Console | ✅ Yes |
| `APPWRITE_API_KEY` | Appwrite API key (full permissions) | Get from Console | ✅ Yes |
| `APPWRITE_ENDPOINT` | Appwrite API endpoint | `https://api.aes.my.id/v1` | ✅ Yes |

---

## How to Get Collection IDs

1. Open **Appwrite Console**
2. Navigate to **Databases** → `videmy_db`
3. Click on each collection (Courses, Enrollments, Users, etc.)
4. Copy the **Collection ID** from the URL or header

Example URL: `https://cloud.appwrite.io/console/project-xxx/databases/videmy_db/collection/67abc123def`
- Collection ID: `67abc123def`

---

## How to Get Stripe Webhook Secret

### For Testing (Stripe CLI)

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to your function
stripe listen --forward-to https://api.aes.my.id/v1/functions/69786cf5002c98d74ce7/executions

# Copy the webhook signing secret (whsec_...)
```

### For Production

1. Go to **Stripe Dashboard** → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter URL: `https://api.aes.my.id/v1/functions/69786cf5002c98d74ce7/executions`
4. Select events: `checkout.session.completed`
5. Copy the **Signing secret** (starts with `whsec_`)

---

## Deployment

### Method 1: Appwrite CLI (Recommended)

```bash
# Deploy all functions defined in appwrite.json
appwrite deploy function

# Deploy specific function
appwrite deploy function --functionId 69786cf5002c98d74ce7  # Payment Service
appwrite deploy function --functionId 6978beb0001820d28ca3  # User Management
```

### Method 2: Manual Upload

1. Navigate to **Appwrite Console** → **Functions**
2. Select the function
3. Go to **Settings** → **Code**
4. Upload the function folder (e.g., `functions/payment-service`)
5. Click **Deploy**

---

## Testing

### Test Payment Service

```bash
# Test checkout endpoint
curl -X POST https://api.aes.my.id/v1/functions/69786cf5002c98d74ce7/executions \
  -H "X-Appwrite-Project: 6974e8ea002df44a11c6" \
  -H "X-Appwrite-User-Id: YOUR_USER_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "path": "/checkout",
    "body": "{\"courseId\":\"COURSE_ID\",\"successUrl\":\"http://localhost:5173/success\",\"cancelUrl\":\"http://localhost:5173/cancel\"}"
  }'
```

### Test User Management

```bash
# Test status toggle (Admin only!)
curl -X POST https://api.aes.my.id/v1/functions/6978beb0001820d28ca3/executions \
  -H "X-Appwrite-Project: 6974e8ea002df44a11c6" \
  -H "X-Appwrite-JWT: YOUR_ADMIN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "payload": "{\"action\":\"toggle_status\",\"userId\":\"USER_ID\",\"documentId\":\"DOC_ID\",\"status\":\"active\"}"
  }'
```

---

## Security Notes

### ⚠️ CRITICAL

1. **STRIPE_WEBHOOK_SECRET is mandatory**
   - Function will reject webhooks without it
   - Prevents fake payment confirmations

2. **User Management is Admin-Only**
   - Execute permission: `role:admin`
   - Only users with `admin` role can call this function

3. **API Key Permissions**
   - Use a dedicated API key for functions
   - Grant only necessary permissions
   - Never expose in frontend code

### ✅ Best Practices

- Use different Stripe keys for development and production
- Rotate API keys periodically
- Monitor function logs for suspicious activity
- Enable rate limiting in Appwrite

---

## Troubleshooting

### Payment Function Returns 500

**Check**:
1. All environment variables are set
2. `STRIPE_SECRET_KEY` is valid
3. Course ID exists in database
4. User is authenticated (X-Appwrite-User-Id header)

### Webhook Not Working

**Check**:
1. `STRIPE_WEBHOOK_SECRET` is configured
2. Webhook endpoint URL is correct
3. Stripe webhook is sending to the right URL
4. Function logs for error messages

### User Management Returns 401

**Check**:
1. User has `admin` role in their profile
2. JWT token is valid
3. Session is active

---

## Function Logs

View logs in real-time:

```bash
# Payment Service logs
appwrite functions logs --functionId 69786cf5002c98d74ce7

# User Management logs
appwrite functions logs --functionId 6978beb0001820d28ca3

# Live tail
appwrite functions logs --functionId 69786cf5002c98d74ce7 --tail
```

---

## Monitoring

### Key Metrics to Track

1. **Execution Count** - Number of function calls
2. **Error Rate** - Failed executions / total executions
3. **Response Time** - Average execution duration
4. **Webhook Success Rate** - Successful webhook processing

### Recommended Tools

- **Appwrite Console** - Built-in function analytics
- **Stripe Dashboard** - Webhook delivery logs
- **Application Logs** - Frontend error tracking

---

## Production Checklist

Before deploying to production:

- [ ] All environment variables configured
- [ ] `STRIPE_WEBHOOK_SECRET` set
- [ ] Stripe webhook endpoint configured
- [ ] User Management restricted to `role:admin`
- [ ] Functions deployed successfully
- [ ] Test payment flow end-to-end
- [ ] Test webhook processing
- [ ] Test admin functions (status toggle, role update)
- [ ] Monitor logs for errors
- [ ] Set up error alerting

---

## Support

If you encounter issues:

1. Check **Function Logs** first
2. Verify **Environment Variables**
3. Test with **curl** commands above
4. Review **Appwrite Documentation**: https://appwrite.io/docs/products/functions

---

## Changelog

### 2026-01-28
- **SECURITY FIX**: Made `STRIPE_WEBHOOK_SECRET` mandatory
- **SECURITY FIX**: Changed User Management execute permission to `role:admin`
- Created this documentation

---

**Last Updated**: 2026-01-28  
**Maintainer**: Videmy Development Team
