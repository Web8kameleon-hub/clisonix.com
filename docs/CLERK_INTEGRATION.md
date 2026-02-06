# 🔐 Clerk Integration Guide

## Overview

Clisonix uses **Clerk** for user authentication and identity management. This integration allows Ocean to identify users and provide personalized experiences.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Clerk Auth    │────▶│  Webhook Handler │────▶│  UserRegistry   │
│   (Frontend)    │     │  (Port 8070)     │     │  (Backend)      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                                               │
        │                                               ▼
        │                                        ┌─────────────────┐
        └───────────────────────────────────────▶│   Ocean API     │
                    clerk_user_id                │   (Port 8030)   │
                                                 └─────────────────┘
```

## Setup

### 1. Environment Variables

Add these to your `.env`:

```bash
# Clerk Authentication
CLERK_SECRET_KEY=sk_test_xxxxx           # From Clerk Dashboard → API Keys
CLERK_WEBHOOK_SECRET=whsec_xxxxx         # From Clerk Dashboard → Webhooks
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
```

### 2. Configure Clerk Webhooks

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **Webhooks** → **Add Endpoint**
3. Set URL: `https://api.clisonix.cloud/webhooks/clerk`
4. Select events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
5. Copy the **Signing Secret** to `CLERK_WEBHOOK_SECRET`

### 3. Services

| Service | Port | Description |
|---------|------|-------------|
| User Management | 8070 | Handles Clerk webhooks, user storage |
| Ocean API | 8030 | Main chat API with user context |

## API Endpoints

### Webhook Receiver
```
POST /webhooks/clerk
Content-Type: application/json
svix-id: xxx
svix-timestamp: xxx
svix-signature: xxx
```

### Get User by Clerk ID
```
GET /api/users/by-clerk/{clerk_id}
```

### Chat with User Context
```
POST /api/v1/chat
{
  "message": "Përshëndetje!",
  "clerk_user_id": "user_xxxxx",
  "user_name": "Ledjan",
  "user_language": "sq"
}
```

Or via header:
```
POST /api/v1/chat
X-Clerk-User-Id: user_xxxxx
{
  "message": "Përshëndetje!"
}
```

## Frontend Integration

Use the `useOceanChat` hook:

```tsx
import { useOceanChat } from '@/hooks/use-ocean-chat';

function ChatComponent() {
  const { messages, sendMessage, isLoading } = useOceanChat();
  
  // clerk_user_id is automatically included
  await sendMessage("Përshëndetje Ocean!");
}
```

## Rate Limits by Tier

| Plan | Rate Limit | Messages |
|------|------------|----------|
| FREE | 10 req/min | 1000/hour |
| PRO | 100 req/min | Unlimited |
| ENTERPRISE | 1000 req/min | Unlimited |

## User Data Flow

1. **User Signs Up** → Clerk creates user → Webhook fires
2. **Webhook Received** → `clerk_webhook.py` processes event
3. **User Created** → `UserRegistry.register_user()` stores user
4. **User Chats** → Frontend sends `clerk_user_id` with request
5. **Ocean Receives** → Identifies user, personalizes response

## Files

| File | Purpose |
|------|---------|
| `services/user-management/clerk_webhook.py` | Webhook handler |
| `services/user-management/user_core.py` | User storage |
| `ocean-core/user_context.py` | User context for Ocean |
| `apps/web/src/hooks/use-ocean-chat.tsx` | Frontend hook |

## Testing

```bash
# 1. Start services
docker-compose up user-management ocean-core

# 2. Simulate webhook (local testing)
curl -X POST http://localhost:8070/webhooks/clerk \
  -H "Content-Type: application/json" \
  -d '{"type":"user.created","data":{"id":"user_test123","email_addresses":[{"email_address":"test@example.com"}],"first_name":"Test","last_name":"User"}}'

# 3. Verify user created
curl http://localhost:8070/api/users/by-clerk/user_test123

# 4. Chat with user context
curl -X POST http://localhost:8030/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Përshëndetje!","clerk_user_id":"user_test123"}'
```

## Troubleshooting

### Webhook not receiving events
- Check Clerk Dashboard for webhook logs
- Verify `CLERK_WEBHOOK_SECRET` is correct
- Ensure endpoint is publicly accessible

### User not found in chat
- Check if webhook was processed (logs)
- Verify `clerk_user_id` matches exactly
- Check UserRegistry has user entry

### Signature verification failed
- Update `CLERK_WEBHOOK_SECRET` from Clerk Dashboard
- Ensure headers are forwarded correctly

---

> 📚 For more details, see [Clerk Documentation](https://clerk.com/docs)
