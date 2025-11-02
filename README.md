# 🧠 Clisonix Cloud

Industrial Backend & Payment System

**-Industrial-Grade FastAPI Backend with Real
 Business Integration**

**Business Information:**
-**Owner:**
Ledjan Ahmati

- **Company:** WEB8euroweb GmbH
- **SEPA IBAN:** DE72430500010015012263 (Sparkasse Bochum)
- **PayPal:** <ahmati.bau@gmail.com>
- **Data Policy:** REAL DATA ONLY - NO MOCK/PLACEHOLDER

---

## 🚀 Real Industrial Features

### 🧠 AI Character Engines (ALBI/ALBA/JONA)

- **ALBI:** Advanced Learning & Brain Intelligence - Cognitive pattern analysis
- **ALBA:** Adaptive Learning & Brain Analysis - Real-time EEG processing  
- **JONA:** Joint Oscillatory Neural Analysis - Multi-modal signal correlation

### 💳 Payment System Integration

- **SEPA Payments:** Direct bank transfers with real IBAN validation
- **PayPal Integration:** Real business account processing
- **Stripe Checkout:** Subscription management with plan-based quotas
- **Webhook Processing:** Real-time payment verification

### 📊 Live System Monitoring

- **Real-time Metrics:** CPU, memory, disk, network monitoring with psutil
- **Health Scoring:** Industrial-grade system health algorithms
- **Performance Tracking:** Live efficiency and stability measurements
- **Process Monitoring:** Complete system process analysis

### 🔐 Authentication & Security

- **JWT Authentication:** Refresh token support with secure handling
- **Plan-Based Quotas:** Subscription tier restrictions
- **Rate Limiting:** Industrial middleware for API protection
- **CORS Security:** Production-ready cross-origin handling

---

## 🏗️ Architecture

Clisonix-cloud/
├── app/
│   ├── main.py              # Industrial FastAPI backend with live monitoring
│   ├── settings.py          # Configuration with business integration
│   ├── auth/                # JWT authentication system
│   ├── billing/            # SEPA/PayPal/Stripe payment processing
│   ├── middleware/         # Quota gate + security middleware
│   └── ...
├── worker/                 # Background job processing
├── scripts/               # Deployment and utility scripts
├── requirements.txt       # Industrial-grade dependencies
├── docker-compose.yml     # Multi-service orchestration
└── start_server.py        # Backend launcher script

---

## ⚡ Quick Start

### 1. Install Dependencies

```bash
# Install core dependencies
pip install -r requirements.txt

# Or use the launcher (auto-installs)
python start_server.py
```

### 2. Start Industrial Backend

```bash
# Method 1: Use launcher script
python start_server.py

# Method 2: Direct uvicorn
uvicorn app.master:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Access Industrial Backend

- **Backend:** <http://localhost:8000>
- **API Docs:** <http://localhost:8000/docs> (development only)
- **Health Check:** <http://localhost:8000/health>

---

## 🌟 Industrial Endpoints

### System Information

```bash
GET /                        # Complete system overview + business info
GET /health                  # Industrial health check with real metrics
GET /status                  # Full ecosystem status with performance data
GET /api/v1/info            # Complete API capabilities
```

### AI Character Engines  

```bash
GET /api/albi/info          # ALBI Intelligence Engine status
GET /api/alba/info          # ALBA Data Collector metrics
GET /api/jona/info          # JONA System Monitor details
GET /api/ecosystem/status   # Complete ecosystem overview
```

### Real Data Processing

```bash
POST /api/uploads/eeg/process    # Real EEG analysis (ALBI+ALBA engines)
POST /api/uploads/audio/process  # Real audio processing (JONA+ALBA engines)
```

### Payment Processing

```bash
POST /billing/create        # Create SEPA/PayPal payment
POST /billing/process/:id   # Process payment with real verification
GET /billing/payment/:id    # Payment status tracking
GET /billing/stats          # Payment system statistics
```

### Authentication

```bash
POST /auth/login           # JWT authentication
POST /auth/register        # User registration with plan assignment
GET /auth/me              # Current user information
```

---

## 🔧 Configuration

### Environment Variables

```bash
# Database Configuration
DATABASE_URL=postgresql+asyncpg://user:pass@localhost/Clisonix

# Redis Configuration  
REDIS_URL=redis://localhost:6379

# Payment Integration
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Business Configuration
BUSINESS_OWNER="Ledjan Ahmati"
BUSINESS_COMPANY="WEB8euroweb GmbH"
SEPA_IBAN="DE72430500010015012263"
PAYPAL_EMAIL="ahmati.bau@gmail.com"

# Security
JWT_SECRET_KEY=your-industrial-secret-key
JWT_ALGORITHM=HS256

# System Settings
ENVIRONMENT=production
DEBUG=false
API_VERSION=1.0.0
```

---

## 🏭 Industrial Features

### Real System Monitoring

- **CPU Monitoring:** Real-time CPU usage with psutil
- **Memory Tracking:** Live memory consumption analysis
- **Disk Analytics:** Storage utilization monitoring
- **Network Metrics:** Connection and traffic analysis
- **Process Monitoring:** Complete system process tracking

### Payment System

- **SEPA Integration:** Real bank account DE72430500010015012263
- **PayPal Processing:** Business account <ahmati.bau@gmail.com>
- **Stripe Subscriptions:** Plan-based quota management
- **Webhook Verification:** Secure payment status updates

### Data Processing

- **EEG Analysis:** Real neural signal processing (no mock data)
- **Audio Processing:** Industrial-grade audio analysis
- **Multi-modal Integration:** ALBI/ALBA/JONA engine coordination
- **Real-time Classification:** Live signal analysis and feedback

---

## 📈 Performance Metrics

### System Health Scoring

```python
# Industrial health algorithm
cpu_score = max(0, 100 - cpu_usage) * 0.3
memory_score = max(0, 100 - memory_usage) * 0.4  
uptime_score = min(30, uptime_hours) * 0.3
total_health = cpu_score + memory_score + uptime_score
```

### Live Ecosystem Tracking

- **ALBI Jobs:** Real processing job counter
- **ALBA Data Points:** Live data collection metrics  
- **JONA Alerts:** System monitoring alert handling
- **Payment Transactions:** Real business transaction tracking

---

## 🔒 Security & Compliance

### Authentication Security

- **JWT Tokens:** Secure authentication with refresh tokens
- **Plan Quotas:** Subscription-based API limiting
- **CORS Protection:** Production-ready cross-origin policies
- **Request Tracing:** Complete request ID tracking

### Payment Security

- **Webhook Verification:** Stripe signature validation
- **SEPA Compliance:** European payment standard compliance
- **PayPal Integration:** Business account secure processing
- **Transaction Logging:** Complete payment audit trails

---

## 🐳 Docker Deployment

### Production Deployment

```bash
# Build and deploy full stack
docker-compose up -d

# Scale services
docker-compose up -d --scale worker=3

# Monitor logs
docker-compose logs -f api
```

### Services

- **API:** FastAPI backend with industrial monitoring
- **Worker:** Background job processing
- **PostgreSQL:** Production database
- **Redis:** Caching and session storage
- **MinIO:** S3-compatible file storage

---

## 📊 Business Integration

### Real Business Data

```json
{
  "owner": "Ledjan Ahmati",
  "company": "WEB8euroweb GmbH", 
  "sepa_iban": "DE72430500010015012263",
  "sepa_bic": "DORTDE33XXX",
  "sepa_bank": "Sparkasse Bochum",
  "paypal_email": "ahmati.bau@gmail.com",
  "data_policy": "REAL DATA ONLY - NO MOCK"
}
```

 Payment Processing

- **SEPA Transfers:** Direct European bank integration
- **PayPal Payments:** Real business account processing  
- **Stripe Subscriptions:** Plan-based recurring billing
- **Transaction Tracking:** Complete payment lifecycle monitoring

---

## 🛠️ Development

### Local Development

```bash
# Install development dependencies
pip install -r requirements.txt

# Start development server
python start_server.py

# Run with auto-reload
uvicorn app.master:app --reload --host 0.0.0.0 --port 8000
```

### Testing

```bash
# Run test suite
pytest tests/

# Test specific modules
pytest tests/test_api.py -v

# Test payment integration
pytest tests/test_billing.py -v
```

---

## 📞 Business Contact

Ledjan Ahmati - WEB8euroweb GmbH**

- **Email:** <ahmati.bau@gmail.com>
- **SEPA:** DE72430500010015012263 (Sparkasse Bochum)
- **Company:** WEB8euroweb GmbH
- **Data Policy:** Industrial-grade real data processing only

---

## 🔍 System Status

**Live Monitoring Available:**

- Real-time system metrics at `/health`
- Complete ecosystem status at `/status`
- AI engine monitoring at `/api/*/info`
- Payment system status at `/billing/stats`

**No Mock Data:** This is an industrial-grade backend using real business integration, actual system monitoring, and live payment processing. All metrics, business information, and processing capabilities are real and functional. - FastAPI + Worker + Docker Compose
