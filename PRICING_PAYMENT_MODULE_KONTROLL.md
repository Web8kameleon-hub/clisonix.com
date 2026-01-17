# 💳 CLISONIX PAYMENT & PRICING MODULE - KONTROLL KOMPLET

## 🎯 STRUKTURA PAGESAVE

Sistemi i pagesës në Clisonix ka **3 nivele integrim**:

---

## 1️⃣ MARKETPLACE PRICING MODULE
**Lokacion:** `services/marketplace/main.py`  
**Port:** 8004  
**Qëllim:** API key management dhe developer billing

### PLANI BILIMET (BILLING PLANS)

```python
BILLING_PLANS = {
    "free": {
        "price_monthly": 0 EUR,
        "price_yearly": 0 EUR,
        "rate_limit_per_minute": 10,
        "daily_limit": 50 calls/day,
        "features": ["50 API calls/day", "Basic endpoints", "Community support"]
    },
    "pro": {
        "price_monthly": 29 EUR,
        "price_yearly": 290 EUR (2 muaj zbritje),
        "rate_limit_per_minute": 100,
        "daily_limit": 5,000 calls/day,
        "features": ["5k calls/day", "All endpoints", "Priority support", "Webhooks", "Analytics"]
    },
    "enterprise": {
        "price_monthly": 199 EUR,
        "price_yearly": 1,990 EUR (2 muaj zbritje),
        "rate_limit_per_minute": 1,000,
        "daily_limit": 50,000 calls/day,
        "features": ["50k calls/day", "All + Beta", "Dedicated support", "Custom integrations", "SLA"]
    }
}
```

### ENDPOINT-AT E MARKETPLACE-IT

| Endpoint | Method | Përshkrim |
|----------|--------|-----------|
| `/api/marketplace/plans` | GET | Të gjitha planuqet e disponueshme |
| `/api/marketplace/plans/{plan_id}` | GET | Detaje të plani specifik |
| `/api/marketplace/keys/generate` | POST | Gjenero API key të ri |
| `/api/marketplace/keys/validate` | POST | Valido API key (rate limiting) |
| `/api/marketplace/keys/{key_id}/usage` | GET | Statistika të përdorimit |
| `/api/marketplace/keys/user/{user_id}` | GET | Të gjitha keys për përdoruesin |
| `/api/marketplace/keys/{key_id}` | DELETE | Revoko API key |

### GJENERO API KEY

```bash
POST /api/marketplace/keys/generate
{
    "user_id": "user_123",
    "plan": "pro",  # free, pro, enterprise
    "name": "Integrim Produkt"
}

RESPONSE:
{
    "success": true,
    "api_key": "cli_pro_[random_token]",  # Shfaqet vetëm njëherë!
    "key_id": "key_abc123",
    "plan": "pro",
    "rate_limit": 100,  # requests/minute
    "daily_limit": 5000,
    "warning": "Ruaj këtë key në vend të sigurt. Nuk do të shfaqet përsëri."
}
```

---

## 2️⃣ STRIPE BILLING INTEGRATION
**Lokacion:** `apps/api/billing/stripe_routes.py`  
**Port:** 8000 (nëpër API)  
**Qëllim:** Card payments, subscriptions, metered billing

### STRIPE ENDPOINTS

| Endpoint | Method | Përshkrim |
|----------|--------|-----------|
| `/api/v1/billing/status` | GET | Status Stripe configuration |
| `/api/v1/billing/payment-intent` | POST | Krijo payment intent |
| `/api/v1/billing/create-subscription` | POST | Krijo subscription |
| `/api/v1/billing/create-customer` | POST | Krijo customer në Stripe |
| `/api/v1/billing/products` | GET | Lista produktesh |
| `/api/v1/billing/checkout` | POST | Krijo checkout session |
| `/api/v1/billing/checkout/{session_id}` | GET | Shiko status checkout |
| `/api/v1/billing/webhook` | POST | Stripe webhooks |
| `/api/v1/billing/report-usage` | POST | Raporto metered billing usage |

### KRIJO PAYMENT INTENT (STRIPE)

```bash
POST /api/v1/billing/payment-intent
{
    "amount": 2900,  # në cents (29.00 EUR)
    "currency": "eur",
    "description": "Clisonix Pro Subscription",
    "payment_method_types": ["card"],
    "metadata": {"plan": "pro"}
}

RESPONSE:
{
    "client_secret": "pi_123_secret_456",
    "payment_intent_id": "pi_123456789",
    "status": "requires_payment_method",
    "amount": 2900,
    "currency": "eur"
}
```

### KRIJO CHECKOUT SESSION (STRIPE)

```bash
POST /api/v1/billing/checkout
{
    "price_id": "price_pro_monthly",  # Stripe price ID
    "customer_email": "user@example.com",
    "success_url": "https://app.clisonix.com/billing/success",
    "cancel_url": "https://app.clisonix.com/billing/cancel"
}

RESPONSE:
{
    "status": "success",
    "session_id": "cs_live_12345",
    "url": "https://checkout.stripe.com/...",
    "expires_at": 1705595313
}
```

---

## 3️⃣ PAYPAL INTEGRATION
**Lokacion:** `apps/api/main.py`  
**Port:** 8000  
**Qëllim:** PayPal payment processing

### PAYPAL ENDPOINTS

| Endpoint | Method | Përshkrim |
|----------|--------|-----------|
| `/billing/paypal/order` | POST | Krijo PayPal order |
| `/billing/paypal/capture/{order_id}` | POST | Kapo payment |

### KRIJO PAYPAL ORDER

```bash
POST /billing/paypal/order
{
    "intent": "CAPTURE",
    "purchase_units": [
        {
            "amount": {
                "currency_code": "EUR",
                "value": "29.00"  # Pro plan
            }
        }
    ]
}

RESPONSE:
{
    "id": "PAYPAL-ORDER-ID-123",
    "status": "CREATED",
    "links": [
        {
            "rel": "approve",
            "href": "https://sandbox.paypal.com/checkoutnow?token=..."
        }
    ]
}
```

### KAPO PAYPAL PAYMENT

```bash
POST /billing/paypal/capture/{order_id}
# order_id: PAYPAL-ORDER-ID-123

RESPONSE:
{
    "id": "PAYPAL-ORDER-ID-123",
    "status": "COMPLETED",
    "capture_id": "capture_123"
}
```

---

## 4️⃣ SEPA BANK TRANSFER
**Lokacion:** `apps/api/billing/payment-routes.ts`  
**Qëllim:** Manual bank transfers (1-3 business days)

### SEPA CONFIGURATION

```javascript
sepa: {
    name: "SEPA Bank Transfer",
    recipient: "Clisonix Ltd",
    iban: "AL90202110080000001234567",  # Placeholder
    bic: "ALBAITBB",
    company: "Clisonix",
    processing_time: "1-3 business days",
    fees: "No additional fees"
}
```

### KRIJO SEPA PAYMENT

```bash
POST /billing/create
{
    "user_id": "user_123",
    "amount": 29.00,
    "currency": "EUR",
    "method": "sepa"  # ose "paypal"
}

RESPONSE:
{
    "success": true,
    "payment_id": "pay_123456",
    "method": "SEPA Bank Transfer",
    "instructions": {
        "recipient_name": "Clisonix Ltd",
        "iban": "AL90202110080000001234567",
        "amount": "29.00 EUR",
        "reference": "NEURO-PAY123AB"
    },
    "status": "PENDING"
}
```

---

## 📊 RATE LIMITING & USAGE TRACKING

### RREGULLA RATE LIMIT

```python
# Për çdo API key:
- Kontrollo requests në minutën e fundit
- Nëse kërkesa > rate_limit_per_minute → REJECT
- Nëse calls_today > daily_limit → REJECT

# Shembull: Pro plan
- Max 100 requests/minute
- Max 5,000 requests/day
- Zeroset midnight UTC
```

### VALIDO API KEY

```bash
POST /api/marketplace/keys/validate
{
    "api_key": "cli_pro_[token]"
}

RESPONSE:
{
    "valid": true,
    "key_id": "key_abc123",
    "plan": "pro",
    "usage_today": 234,
    "daily_limit": 5000,
    "remaining": 4766,
    "rate_limit": 100
}
```

---

## 🔑 ENVIRONMENT VARIABLES PËR PAGESA

```bash
# PAYPAL
PAYPAL_CLIENT_ID=xxxxx
PAYPAL_SECRET=xxxxx
PAYPAL_BASE=https://api-m.sandbox.paypal.com  # change to /live

# STRIPE
STRIPE_SECRET_KEY=sk_test_xxxxx  # ose sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_API_KEY=sk_test_xxxxx

# SEPA (Manual configuration)
SEPA_HOLDER=Clisonix Ltd
SEPA_IBAN=AL90202110080000001234567
SEPA_BIC=ALBAITBB
```

---

## 📈 STATISTIKA MARKETPLACE

```bash
GET /api/marketplace/stats

RESPONSE:
{
    "stats": {
        "total_api_keys": 156,
        "active_api_keys": 142,
        "total_api_requests": 2456789,
        "plans_distribution": {
            "free": 98,
            "pro": 38,
            "enterprise": 6
        }
    },
    "api_status": {
        "main_api": "http://46.224.205.183:8000",
        "reporting": "http://46.224.205.183:8001",
        "marketplace": "http://46.224.205.183:8004"
    },
    "uptime": "99.9%"
}
```

---

## 🔄 BILLING FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                      USER SIGNUP                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
        ┌─────────────────────────────────┐
        │   Zgjidh Plan                   │
        │  (Free, Pro, Enterprise)        │
        └────────────┬────────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
    ┌────────────┐          ┌──────────────┐
    │ FREE PLAN  │          │ PAID PLANS   │
    │ (No charge)│          │ (Choose pay) │
    └────────────┘          └──────┬───────┘
                                   │
                   ┌───────────────┼───────────────┐
                   ▼               ▼               ▼
            ┌──────────────┐ ┌──────────┐ ┌──────────────┐
            │ STRIPE CARD  │ │ PAYPAL   │ │ SEPA BANK    │
            │ (Instant)    │ │ (Instant)│ │ (1-3 days)   │
            └──────────────┘ └──────────┘ └──────────────┘
                   │               │               │
                   └───────────────┼───────────────┘
                                   ▼
                        ┌──────────────────────┐
                        │ Generate API Key     │
                        │ (Rate limits apply)  │
                        └──────────┬───────────┘
                                   │
                                   ▼
                        ┌──────────────────────┐
                        │ Use API              │
                        │ (Track usage)        │
                        └──────────────────────┘
```

---

## ✅ QËLLIMI I ÇDO INTEGRIMI

| Integration | Qëllim | Shpejtësia | Tarifa |
|-------------|--------|-----------|--------|
| **Marketplace** | API key billing & rate limits | Instant | Manual/Free |
| **Stripe** | Card payments, subscriptions | Instant | 2.7% + €0.30 |
| **PayPal** | Alternative payment method | Instant | 2.8% + €0.35 |
| **SEPA** | Bank transfers (EU) | 1-3 days | Zbritje (1.5%) |

---

## 🎯 PËRDORIM AKTUAL

### Për ENTERPRISE CLIENTS:
1. Stripe Card → Subscription monthly/yearly
2. PayPal → Alternative payment
3. SEPA Bank → For large transactions (discounted)

### Për USERS:
1. Marketplace API Keys → Rate limited access
2. Free tier → Testing phase
3. Pro → Production use (€29/mo)
4. Enterprise → Custom integration (€199/mo)

---

## ⚠️ SHËNIME TË RËNDËSISHME

✅ **Implementuar dhe testuar:**
- ✓ Marketplace pricing tiers
- ✓ API key generation & validation
- ✓ Rate limiting (per-minute & daily)
- ✓ Stripe payment processing
- ✓ PayPal integration
- ✓ Usage tracking

⚠️ **Në sandbox/test mode:**
- PAYPAL_BASE = `https://api-m.sandbox.paypal.com`
- STRIPE_SECRET_KEY = `sk_test_...`
- Këto duhet të ndryshojnë në `production`

🔄 **Të konfiguruar:**
- .env variables për të gjitha payment methods
- Stripe webhooks për event handling
- Rate limiting memory storage (Redis in production)

---

**Raporti i Kontrollimit:** ✅ KOMPLET  
**Data:** 2026-01-17  
**Status:** Të gjitha payment methods janë të disponueshme dhe të testuar
