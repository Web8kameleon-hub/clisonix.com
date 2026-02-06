"""
CLISONIX USER API - REST API for User Management
=================================================

API endpoints për regjistrimin dhe menaxhimin e përdoruesve.

Port: 8070
Base URL: /api/users

Author: Ledjan Ahmati (CEO, ABA GmbH)
"""

import logging
from typing import Any, Dict, Optional

import uvicorn
from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from user_core import (
    AccountStatus,
    SubscriptionPlan,
    UserRegistry,
    get_user_registry,
)

# ═══════════════════════════════════════════════════════════════════════════════
# LOGGING
# ═══════════════════════════════════════════════════════════════════════════════

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s"
)
logger = logging.getLogger("user_api")

# ═══════════════════════════════════════════════════════════════════════════════
# PYDANTIC MODELS - Skemat e kërkesave/përgjigjeve
# ═══════════════════════════════════════════════════════════════════════════════

class RegisterRequest(BaseModel):
    """Kërkesa për regjistrim"""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=30)
    password: str = Field(..., min_length=8)
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    plan: Optional[str] = "free"


class LoginRequest(BaseModel):
    """Kërkesa për login"""
    email_or_username: str
    password: str


class ProfileUpdateRequest(BaseModel):
    """Përditësimi i profilit"""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    display_name: Optional[str] = None
    phone: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    timezone: Optional[str] = None
    language: Optional[str] = None
    organization: Optional[str] = None
    job_title: Optional[str] = None
    specialization: Optional[str] = None


class ChangePlanRequest(BaseModel):
    """Ndryshimi i planit"""
    plan: str
    duration_days: int = 30


class AddCreditsRequest(BaseModel):
    """Shtimi i krediteve"""
    amount: int = Field(..., gt=0)


# ═══════════════════════════════════════════════════════════════════════════════
# FASTAPI APP
# ═══════════════════════════════════════════════════════════════════════════════

app = FastAPI(
    title="Clisonix User Management API",
    description="""
    🔐 **Sistemi Qendror i Menaxhimit të Përdoruesve**
    
    Ky API ofron:
    - Regjistrim dhe login të përdoruesve
    - Menaxhim të profilëve
    - Autentifikim me token dhe API key
    - Menaxhim të planeve dhe krediteve
    
    **Autor:** Ledjan Ahmati (CEO, ABA GmbH)
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Clerk webhook router
from clerk_webhook import router as clerk_router

app.include_router(clerk_router)


# ═══════════════════════════════════════════════════════════════════════════════
# DEPENDENCIES
# ═══════════════════════════════════════════════════════════════════════════════

def get_registry() -> UserRegistry:
    """Dependency: Merr regjistrin"""
    return get_user_registry()


async def get_current_user(
    authorization: Optional[str] = Header(None),
    x_api_key: Optional[str] = Header(None),
    registry: UserRegistry = Depends(get_registry)
) -> Dict[str, Any]:
    """Dependency: Valido dhe merr përdoruesin aktual"""
    
    # Try API Key first
    if x_api_key:
        user = registry.validate_api_key(x_api_key)
        if user:
            return user
    
    # Try Bearer token
    if authorization and authorization.startswith("Bearer "):
        token = authorization[7:]
        user = registry.validate_token(token)
        if user:
            return user
    
    raise HTTPException(
        status_code=401,
        detail="Autentifikimi dështoi. Jepni token ose API key."
    )


async def require_admin(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """Dependency: Kërko akses admin"""
    if current_user.get("role") not in ["admin", "superadmin"]:
        raise HTTPException(
            status_code=403,
            detail="Kjo veprim kërkon privilegje admin"
        )
    return current_user


# ═══════════════════════════════════════════════════════════════════════════════
# HEALTH ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/health")
async def health_check():
    """Health check"""
    return {"status": "healthy", "service": "user-management"}


@app.get("/")
async def root():
    """API info"""
    return {
        "name": "Clisonix User Management API",
        "version": "1.0.0",
        "endpoints": {
            "register": "POST /api/users/register",
            "login": "POST /api/users/login",
            "profile": "GET /api/users/me/profile",
            "docs": "/docs"
        }
    }


# ═══════════════════════════════════════════════════════════════════════════════
# AUTH ENDPOINTS - Regjistrimi dhe login
# ═══════════════════════════════════════════════════════════════════════════════

@app.post("/api/users/register")
async def register_user(
    request: RegisterRequest,
    http_request: Request,
    registry: UserRegistry = Depends(get_registry)
):
    """
    📝 Regjistro përdorues të ri
    
    Krijo llogari të re me email, username dhe fjalëkalim.
    """
    plan = SubscriptionPlan.FREE
    if request.plan:
        try:
            plan = SubscriptionPlan(request.plan.lower())
        except ValueError:
            pass
    
    result = registry.register_user(
        email=request.email,
        username=request.username,
        password=request.password,
        first_name=request.first_name,
        last_name=request.last_name,
        plan=plan
    )
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result


@app.post("/api/users/login")
async def login_user(
    request: LoginRequest,
    http_request: Request,
    registry: UserRegistry = Depends(get_registry)
):
    """
    🔑 Login përdoruesi
    
    Autentifikohu me email/username dhe fjalëkalim.
    Merr access_token për API calls.
    """
    ip_address = http_request.client.host if http_request.client else None
    user_agent = http_request.headers.get("user-agent")
    
    result = registry.login(
        email_or_username=request.email_or_username,
        password=request.password,
        ip_address=ip_address,
        user_agent=user_agent
    )
    
    if not result["success"]:
        raise HTTPException(status_code=401, detail=result["error"])
    
    return result


@app.post("/api/users/logout")
async def logout_user(
    current_user: Dict[str, Any] = Depends(get_current_user),
    registry: UserRegistry = Depends(get_registry)
):
    """
    🚪 Logout përdoruesi
    
    Mbyll sesionin aktual.
    """
    session_id = current_user.get("session_id")
    if session_id:
        return registry.logout(session_id)
    return {"success": True, "message": "Logged out"}


@app.post("/api/users/validate-token")
async def validate_token(
    authorization: str = Header(...),
    registry: UserRegistry = Depends(get_registry)
):
    """
    ✅ Valido token
    
    Kontrollo nëse token është i vlefshëm dhe kthe të dhënat e përdoruesit.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=400, detail="Format: Bearer <token>")
    
    token = authorization[7:]
    user = registry.validate_token(token)
    
    if not user:
        raise HTTPException(status_code=401, detail="Token i pavlefshëm ose i skaduar")
    
    return {"valid": True, "user": user}


@app.post("/api/users/validate-api-key")
async def validate_api_key(
    x_api_key: str = Header(...),
    registry: UserRegistry = Depends(get_registry)
):
    """
    🔑 Valido API Key
    
    Kontrollo nëse API key është i vlefshëm.
    """
    user = registry.validate_api_key(x_api_key)
    
    if not user:
        raise HTTPException(status_code=401, detail="API key i pavlefshëm")
    
    return {"valid": True, "user": user}


# ═══════════════════════════════════════════════════════════════════════════════
# PROFILE ENDPOINTS - Menaxhimi i profilit
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/api/users/me")
async def get_current_user_info(
    current_user: Dict[str, Any] = Depends(get_current_user),
    registry: UserRegistry = Depends(get_registry)
):
    """
    👤 Merr të dhënat e përdoruesit aktual
    """
    user_id = current_user["user_id"]
    
    profile = registry.get_profile(user_id)
    account = registry.get_account(user_id, include_sensitive=True)
    usage = registry.get_usage(user_id)
    
    return {
        "profile": profile,
        "account": account,
        "usage": usage
    }


@app.get("/api/users/me/profile")
async def get_my_profile(
    current_user: Dict[str, Any] = Depends(get_current_user),
    registry: UserRegistry = Depends(get_registry)
):
    """
    📋 Merr profilin tim
    """
    profile = registry.get_profile(current_user["user_id"])
    if not profile:
        raise HTTPException(status_code=404, detail="Profili nuk u gjet")
    return profile


@app.put("/api/users/me/profile")
async def update_my_profile(
    request: ProfileUpdateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    registry: UserRegistry = Depends(get_registry)
):
    """
    ✏️ Përditëso profilin tim
    """
    updates = request.model_dump(exclude_none=True)
    result = registry.update_profile(current_user["user_id"], updates)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result


@app.get("/api/users/me/usage")
async def get_my_usage(
    current_user: Dict[str, Any] = Depends(get_current_user),
    registry: UserRegistry = Depends(get_registry)
):
    """
    📊 Merr përdorimin tim
    """
    usage = registry.get_usage(current_user["user_id"])
    if not usage:
        raise HTTPException(status_code=404, detail="Të dhënat nuk u gjetën")
    return usage


@app.get("/api/users/me/api-key")
async def get_my_api_key(
    current_user: Dict[str, Any] = Depends(get_current_user),
    registry: UserRegistry = Depends(get_registry)
):
    """
    🔑 Merr API key-in tim
    """
    account = registry.get_account(current_user["user_id"], include_sensitive=True)
    if not account:
        raise HTTPException(status_code=404, detail="Llogaria nuk u gjet")
    
    return {"api_key": account.get("api_key")}


# ═══════════════════════════════════════════════════════════════════════════════
# ADMIN ENDPOINTS - Funksionet admin
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/api/admin/users")
async def list_users(
    status: Optional[str] = None,
    plan: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    admin: Dict[str, Any] = Depends(require_admin),
    registry: UserRegistry = Depends(get_registry)
):
    """
    📋 Listo të gjithë përdoruesit (vetëm admin)
    """
    account_status = None
    subscription_plan = None
    
    if status:
        try:
            account_status = AccountStatus(status)
        except ValueError:
            pass
    
    if plan:
        try:
            subscription_plan = SubscriptionPlan(plan)
        except ValueError:
            pass
    
    users = registry.list_users(
        status=account_status,
        plan=subscription_plan,
        limit=limit,
        offset=offset
    )
    
    return {
        "users": users,
        "count": len(users),
        "limit": limit,
        "offset": offset
    }


@app.get("/api/admin/users/{user_id}")
async def get_user(
    user_id: str,
    admin: Dict[str, Any] = Depends(require_admin),
    registry: UserRegistry = Depends(get_registry)
):
    """
    👤 Merr detajet e një përdoruesi (vetëm admin)
    """
    profile = registry.get_profile(user_id)
    account = registry.get_account(user_id)
    usage = registry.get_usage(user_id)
    
    if not profile:
        raise HTTPException(status_code=404, detail="Përdoruesi nuk u gjet")
    
    return {
        "profile": profile,
        "account": account,
        "usage": usage
    }


@app.post("/api/admin/users/{user_id}/activate")
async def activate_user(
    user_id: str,
    admin: Dict[str, Any] = Depends(require_admin),
    registry: UserRegistry = Depends(get_registry)
):
    """
    ✅ Aktivo përdoruesin (vetëm admin)
    """
    result = registry.activate_user(user_id)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@app.post("/api/admin/users/{user_id}/suspend")
async def suspend_user(
    user_id: str,
    reason: str = "No reason provided",
    admin: Dict[str, Any] = Depends(require_admin),
    registry: UserRegistry = Depends(get_registry)
):
    """
    ⚠️ Pezullo përdoruesin (vetëm admin)
    """
    result = registry.suspend_user(user_id, reason)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@app.post("/api/admin/users/{user_id}/change-plan")
async def change_user_plan(
    user_id: str,
    request: ChangePlanRequest,
    admin: Dict[str, Any] = Depends(require_admin),
    registry: UserRegistry = Depends(get_registry)
):
    """
    📦 Ndrysho planin e përdoruesit (vetëm admin)
    """
    try:
        plan = SubscriptionPlan(request.plan.lower())
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Plan i pavlefshëm: {request.plan}")
    
    result = registry.change_plan(user_id, plan, request.duration_days)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@app.post("/api/admin/users/{user_id}/add-credits")
async def add_user_credits(
    user_id: str,
    request: AddCreditsRequest,
    admin: Dict[str, Any] = Depends(require_admin),
    registry: UserRegistry = Depends(get_registry)
):
    """
    💰 Shto kredite përdoruesit (vetëm admin)
    """
    result = registry.add_credits(user_id, request.amount)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@app.get("/api/admin/stats")
async def get_admin_stats(
    admin: Dict[str, Any] = Depends(require_admin),
    registry: UserRegistry = Depends(get_registry)
):
    """
    📊 Merr statistikat e sistemit (vetëm admin)
    """
    return registry.get_stats()


# ═══════════════════════════════════════════════════════════════════════════════
# PUBLIC ENDPOINTS - Kontrolle publike
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/api/users/check-email/{email}")
async def check_email_availability(
    email: str,
    registry: UserRegistry = Depends(get_registry)
):
    """
    📧 Kontrollo nëse email është i disponueshëm
    """
    exists = registry.get_user_by_email(email) is not None
    return {
        "email": email,
        "available": not exists,
        "message": "Email tashmë i regjistruar" if exists else "Email i disponueshëm"
    }


@app.get("/api/users/check-username/{username}")
async def check_username_availability(
    username: str,
    registry: UserRegistry = Depends(get_registry)
):
    """
    👤 Kontrollo nëse username është i disponueshëm
    """
    exists = registry.get_user_by_username(username) is not None
    return {
        "username": username,
        "available": not exists,
        "message": "Username tashmë i marrë" if exists else "Username i disponueshëm"
    }


@app.get("/api/users/by-clerk/{clerk_id}")
async def get_user_by_clerk_id(
    clerk_id: str,
    registry: UserRegistry = Depends(get_registry)
):
    """
    🔗 Merr userin nga Clerk ID
    
    Përdoret nga Ocean për të identifikuar userin.
    """
    user = registry.find_by_clerk_id(clerk_id)
    if not user:
        raise HTTPException(status_code=404, detail="Përdoruesi nuk u gjet")
    return user


# ═══════════════════════════════════════════════════════════════════════════════
# STARTUP
# ═══════════════════════════════════════════════════════════════════════════════

@app.on_event("startup")
async def startup_event():
    """Initialize on startup"""
    registry = get_user_registry()
    stats = registry.get_stats()
    logger.info(f"👤 User Management API started - {stats['total_users']} users registered")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8070)
