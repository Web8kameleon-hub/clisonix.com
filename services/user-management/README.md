# 👤 Clisonix User Management

## Sistemi Qendror i Menaxhimit të Përdoruesve

Ky shërbim është **BURIMI I VETËM I SË VËRTETËS** për të gjitha të dhënat e përdoruesve në sistemin Clisonix.

## 🎯 Qëllimi

- **Regjistrimi i përdoruesve** - Krijoni llogari me email, username, fjalëkalim
- **Autentifikimi** - Login me email/username, token-e, API keys
- **Profilizimi** - Ruajtja e të dhënave personale dhe profesionale
- **Menaxhimi i planeve** - Free, Starter, Standard, Professional, Enterprise
- **Kreditet dhe përdorimi** - Gjurmimi i përdorimit të resurseve

## 🔌 API Endpoints

### Port: 8070

### Autentifikimi

| Metoda | Endpoint | Përshkrimi |
| ------ | -------- | ---------- |
| POST | `/api/users/register` | Regjistro përdorues të ri |
| POST | `/api/users/login` | Login dhe merr token |
| POST | `/api/users/logout` | Mbyll sesionin |
| POST | `/api/users/validate-token` | Valido access token |
| POST | `/api/users/validate-api-key` | Valido API key |

### Profili

| Metoda | Endpoint | Përshkrimi |
| ------ | -------- | ---------- |
| GET | `/api/users/me` | Të dhënat e plota të përdoruesit |
| GET | `/api/users/me/profile` | Profili |
| PUT | `/api/users/me/profile` | Përditëso profilin |
| GET | `/api/users/me/usage` | Përdorimi dhe kreditet |
| GET | `/api/users/me/api-key` | Merr API key |

### Kontrolle Publike

| Metoda | Endpoint | Përshkrimi |
| ------ | -------- | ---------- |
| GET | `/api/users/check-email/{email}` | Kontrollo disponueshmërinë |
| GET | `/api/users/check-username/{username}` | Kontrollo disponueshmërinë |

### Admin (kërkon rol admin)

| Metoda | Endpoint | Përshkrimi |
| ------ | -------- | ---------- |
| GET | `/api/admin/users` | Listo të gjithë përdoruesit |
| GET | `/api/admin/users/{user_id}` | Detajet e përdoruesit |
| POST | `/api/admin/users/{user_id}/activate` | Aktivo llogarinë |
| POST | `/api/admin/users/{user_id}/suspend` | Pezullo llogarinë |
| POST | `/api/admin/users/{user_id}/change-plan` | Ndrysho planin |
| POST | `/api/admin/users/{user_id}/add-credits` | Shto kredite |
| GET | `/api/admin/stats` | Statistikat e sistemit |

## 📦 Data Classes

### UserProfile

```python
- user_id, email, username
- first_name, last_name, display_name, avatar_url
- phone, country, city, timezone, language
- organization, job_title, specialization, license_number
```

### UserAccount

```python
- user_id, email, password_hash
- role: guest | user | pro | admin | superadmin
- status: pending | active | suspended | banned | deleted
- verification: unverified | email_verified | fully_verified | professional_verified
- plan: free | starter | standard | professional | enterprise
- mfa_enabled, api_key, last_login
```

### UserSession

```python
- session_id, user_id
- access_token, refresh_token, expires_at
- ip_address, user_agent, device_type
```

### UserUsage

```python
- credits_balance, credits_used_today, credits_used_month
- api_calls_today, api_calls_month
- storage_used_mb, storage_limit_mb
- ocean_sessions_today, ocean_messages_today
```

## 🔐 Autentifikimi

### Bearer Token

```bash
curl -X GET http://localhost:8070/api/users/me \
  -H "Authorization: Bearer at_abc123..."
```

### API Key

```bash
curl -X GET http://localhost:8070/api/users/me \
  -H "X-API-Key: clx_abc123..."
```

## 🚀 Përdorimi

### 1. Regjistrimi

```bash
curl -X POST http://localhost:8070/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "myuser",
    "password": "SecurePass123!",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:8070/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email_or_username": "user@example.com",
    "password": "SecurePass123!"
  }'
```

### 3. Përdor Token

```bash
curl -X GET http://localhost:8070/api/users/me \
  -H "Authorization: Bearer <access_token>"
```

## 🐳 Docker

```bash
# Build
docker build -t clisonix-user-management .

# Run
docker run -p 8070:8070 clisonix-user-management

# With docker-compose
docker-compose up user-management
```

## 📊 Planet dhe Kreditet

| Plan | Kredite | Storage | Çmimi |
| ---- | ------- | ------- | ----- |
| Free | 100 | 100 MB | €0 |
| Starter | 1,000 | 1 GB | €19/muaj |
| Standard | 5,000 | 5 GB | €49/muaj |
| Professional | 20,000 | 20 GB | €99/muaj |
| Enterprise | 100,000 | 100 GB | Custom |

## 🔗 Integrimi me Ocean

Ky shërbim integrohet me Ocean Core për:

- Sesionet e chat-it (max 23 përdorues njëkohësisht)
- Autentifikimin e API-ve
- Gjurmimin e përdorimit të mesazheve

```python
# Në Ocean, valido përdoruesin:
from httpx import AsyncClient

async def validate_user(token: str):
    async with AsyncClient() as client:
        resp = await client.post(
            "http://user-management:8070/api/users/validate-token",
            headers={"Authorization": f"Bearer {token}"}
        )
        return resp.json()
```

---

**Autor:** Ledjan Ahmati (CEO, ABA GmbH)  
**Port:** 8070  
**Versioni:** 1.0.0
