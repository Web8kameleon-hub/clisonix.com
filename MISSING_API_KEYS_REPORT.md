# 🔑 Missing API Keys & Configuration Report

**Generated**: December 13, 2025  
**Status**: ⚠️ Production Blockers Identified

---

## 🚨 CRITICAL - Required for Production

### 1. **STRIPE Payment Integration** 🔴 REQUIRED
**Service**: `backend/api/billing_controller.py`, `apps/api/billing/checkout_routes.py`

**Missing Keys**:
```bash
STRIPE_SECRET_KEY=sk_live_...           # Get from: https://dashboard.stripe.com/apikeys
STRIPE_PUBLISHABLE_KEY=pk_live_...     # Get from: https://dashboard.stripe.com/apikeys
STRIPE_WEBHOOK_SECRET=whsec_...        # Get from: https://dashboard.stripe.com/webhooks
STRIPE_PRICE_PRO=price_...             # Product price ID for Pro plan
```

**Impact**: ❌ Payment processing will FAIL  
**Used By**: Subscription checkout, webhook handling  
**Action**: Register at [stripe.com](https://stripe.com) → Get API keys → Add to `.env`

---

### 2. **YOUTUBE Data API v3** 🟡 OPTIONAL (For YouTube Integration)
**Service**: `blerina_reformatter.py`, `apps/api/main.py`, `research/youtube_title_analysis.py`

**Missing Key**:
```bash
YOUTUBE_API_KEY=AIzaSy...              # Get from: https://console.cloud.google.com/apis
```

**Impact**: ⚠️ YouTube video metadata fetching will fail  
**Used By**: YouTube integration endpoints (`/integrations/youtube/*`)  
**Fallback**: Returns error: `"YOUTUBE_API_KEY is not set"`  
**Action**: 
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable "YouTube Data API v3"
3. Create credentials → API Key
4. Add to `.env`

**Free Tier**: 10,000 requests/day

---

### 3. **OpenAI API** 🟡 OPTIONAL (For AI Agent Enhancements)
**Service**: AI agents (Alba, Albi, Jona) - for advanced language processing

**Missing Key**:
```bash
OPENAI_API_KEY=sk-proj-...             # Get from: https://platform.openai.com/api-keys
```

**Impact**: ⚠️ Advanced AI features disabled (basic functionality works)  
**Current**: Uses fallback/local models  
**Action**: Only needed if enabling GPT-4 integration for agents

---

## ✅ CONFIGURED - Already Set

### Database Credentials
- ✅ `POSTGRES_PASSWORD` - Set in docker-compose
- ✅ `REDIS_HOST` - Running on localhost:6379
- ✅ `NEO4J_AUTH` - Set in `.env.sample`
- ✅ `WEAVIATE_API_KEY` - Optional (empty = no auth)
- ✅ `MINIO_ROOT_USER/PASSWORD` - Set for object storage

### Internal Security
- ✅ `SECRET_KEY` - Generated for JWT
- ✅ `JWT_SECRET_KEY` - Generated for authentication
- ✅ `API_KEY` - Internal service auth

### Monitoring
- ✅ `PROMETHEUS_URL` - http://localhost:9090
- ✅ `GRAFANA_URL` - http://localhost:3001
- ✅ `TEMPO` - http://localhost:3200 (tracing)
- ✅ `LOKI` - http://localhost:3100 (logging)

---

## 📋 Quick Setup Checklist

### For Development (Local Testing):
```bash
# 1. Copy template
cp .env.sample .env

# 2. Optional: Add YouTube key for testing
echo "YOUTUBE_API_KEY=your_key_here" >> .env

# 3. Stripe NOT required for local dev (use test mode)
# Services will run without it, just payment features disabled
```

### For Production Deployment:
```bash
# 1. MANDATORY: Add Stripe keys
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# 2. OPTIONAL: Add YouTube if using video integration
YOUTUBE_API_KEY=AIzaSy...

# 3. Generate secure secrets
SECRET_KEY=$(openssl rand -hex 32)
JWT_SECRET_KEY=$(openssl rand -hex 32)
```

---

## 🔍 Services That Will Work WITHOUT External Keys

### ✅ Fully Functional (No External APIs Needed):
- **Alba (5050)**: Network telemetry collection
- **Albi (6060)**: Neural analytics processing
- **Jona (7070)**: Data synthesis coordination
- **PostgreSQL**: Relational data storage
- **Redis**: Caching and pub/sub
- **VictoriaMetrics**: Time-series metrics
- **Loki**: Log aggregation
- **Tempo**: Distributed tracing
- **Prometheus**: Metrics collection
- **Grafana**: Dashboards and visualization
- **ASI Core**: Real-time engine

### ⚠️ Limited Functionality (External Keys Required):
- **Billing/Payments**: Requires Stripe keys
- **YouTube Integration**: Requires YouTube Data API key
- **Advanced AI**: Requires OpenAI key (optional)

---

## 🚀 Immediate Actions Required

### Priority 1 - For Production Launch:
1. **Register Stripe Account** → Get API keys
2. **Add Stripe keys to `.env`** on production server
3. **Configure Stripe webhook** for payment events
4. **Test payment flow** with Stripe test cards

### Priority 2 - Optional Features:
1. Get YouTube API key (if using video features)
2. Consider OpenAI key (for enhanced AI capabilities)

---

## 💡 Notes

- **Stripe Test Mode**: Use `sk_test_...` keys for development
- **Stripe Live Mode**: Use `sk_live_...` keys for production
- **API Key Security**: Never commit real API keys to Git
- **Environment Variables**: Always use `.env` files (already in `.gitignore`)

---

## 📞 Support

If you need help setting up any of these services:
- Stripe: https://stripe.com/docs
- YouTube API: https://developers.google.com/youtube/v3
- OpenAI: https://platform.openai.com/docs

---

**Status Summary**:
- 🔴 **Stripe**: REQUIRED for production (payments)
- 🟡 **YouTube**: OPTIONAL (video integration only)
- 🟡 **OpenAI**: OPTIONAL (AI enhancements)
- ✅ **All core services**: Working without external keys
