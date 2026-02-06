# Thunder Client Collection - Clisonix Cloud

## ⚡ Si ta përdorësh

### 1. Aktivizo Git Sync

1. Hap Thunder Client (ikona ⚡ në sidebar)
2. Click ⚙️ Settings
3. Enable **"Save To Workspace"**
4. Folder: `.thunder-client`

### 2. Zgjidh Environment

- **Clisonix Production**: Server live (46.225.14.83:8000)
- **Clisonix Local**: localhost:8000

### 3. APIs të disponueshme

| Folder | Endpoints |
| ------ | --------- |
| 📋 Health & Status | `/health`, `/status`, `/api/system-status` |
| 🧠 ASI Trinity | `/asi/status`, `/asi/health`, `/asi/alba/metrics` |
| 🌊 Ocean AI | `/api/ocean/status`, `/api/ocean/session/create`, `/api/ocean/labs/execute` |
| 📊 Excel | `/api/excel/health`, `/api/excel/generate` |
| 💳 Billing | `/billing/stripe/payment-intent`, `/billing/paypal/order` |
| 🔬 Neural | `/neural-symphony`, `/api/ask` |
| 🏭 Content Factory | `/analyze`, `/process`, `/publish`, `/pipeline` |

## 🔐 Environment Variables

- `base_url` - Server URL
- `auth_token` - JWT Token (nëse nevojitet)
- `api_key` - API Key (nëse nevojitet)

## 📦 Import Postman Collection (Opsionale)

Nëse dëshiron të importosh koleksionin e plotë Postman:

1. Click "..." → Import
2. Zgjidh `clisonix-ultra-mega-collection.json`
3. Thunder Client do ta konvertojë automatikisht

---

**Falas. Pa limit. Direkt në VS Code.** 🚀
