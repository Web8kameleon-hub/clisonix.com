"""
NeuroSonix Authentication Dependencies
JWT authentication and user dependency injection
"""
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import redis.asyncio as redis
from datetime import datetime, timedelta

from .models import User, APIKey
from ..database.session import get_db
from ..settings import settings

# Security scheme
security = HTTPBearer()


class AuthenticationError(Exception):
    """Custom authentication error"""
    pass


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    
    to_encode.update({"exp": expire, "type": "access"})
    
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm="HS256")
    return encoded_jwt


def create_refresh_token(user_id: int) -> str:
    """Create JWT refresh token"""
    expire = datetime.utcnow() + timedelta(days=settings.refresh_token_expire_days)
    
    to_encode = {
        "sub": str(user_id),
        "exp": expire,
        "type": "refresh"
    }
    
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm="HS256")
    return encoded_jwt


def verify_token(token: str) -> dict:
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        
        # Check if token is expired
        exp = payload.get("exp")
        if exp and datetime.utcnow() > datetime.fromtimestamp(exp):
            raise AuthenticationError("Token expired")
        
        return payload
        
    except JWTError as e:
        raise AuthenticationError(f"Invalid token: {e}")


async def get_user_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
    """Get user by ID from database"""
    stmt = select(User).where(User.id == user_id, User.is_active == True)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """Get user by email from database"""
    stmt = select(User).where(User.email == email, User.is_active == True)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def authenticate_user(db: AsyncSession, email: str, password: str) -> Optional[User]:
    """Authenticate user with email and password"""
    from passlib.context import CryptContext
    
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    user = await get_user_by_email(db, email)
    if not user:
        return None
    
    if not pwd_context.verify(password, user.hashed_password):
        return None
    
    return user


async def get_current_user_from_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Get current user from JWT token"""
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Verify token
        payload = verify_token(credentials.credentials)
        
        # Extract user ID
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        
        token_type = payload.get("type", "access")
        if token_type != "access":
            raise credentials_exception
        
    except AuthenticationError:
        raise credentials_exception
    
    # Get user from database
    user = await get_user_by_id(db, int(user_id))
    if user is None:
        raise credentials_exception
    
    return user


async def get_current_user_from_api_key(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Get current user from API key"""
    from hashlib import sha256
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid API key",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Hash the provided key
    api_key = credentials.credentials
    key_hash = sha256(api_key.encode()).hexdigest()
    
    # Find API key in database
    stmt = select(APIKey).where(
        APIKey.key_hash == key_hash,
        APIKey.is_active == True
    )
    result = await db.execute(stmt)
    api_key_obj = result.scalar_one_or_none()
    
    if not api_key_obj:
        raise credentials_exception
    
    # Check if key is expired
    if api_key_obj.is_expired:
        raise credentials_exception
    
    # Get associated user
    user = await get_user_by_id(db, api_key_obj.user_id)
    if not user:
        raise credentials_exception
    
    # Update API key usage
    api_key_obj.last_used_at = datetime.utcnow()
    api_key_obj.usage_count += 1
    await db.commit()
    
    return user


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Get current user from JWT token or API key"""
    
    # Try JWT token first
    try:
        return await get_current_user_from_token(credentials, db)
    except HTTPException:
        pass
    
    # Try API key
    try:
        return await get_current_user_from_api_key(credentials, db)
    except HTTPException:
        pass
    
    # Both failed
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current active user (additional check for account status)"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated"
        )
    
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is not verified. Please check your email."
        )
    
    return current_user


def require_subscription_plan(required_plans: list):
    """Dependency to require specific subscription plans"""
    def plan_checker(current_user: User = Depends(get_current_active_user)) -> User:
        if current_user.subscription_plan not in required_plans:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This feature requires {' or '.join(required_plans)} subscription plan. "
                       f"Current plan: {current_user.subscription_plan}"
            )
        return current_user
    
    return plan_checker


# Common plan requirements
require_paid_plan = require_subscription_plan(["standard", "professional", "enterprise"])
require_professional_plan = require_subscription_plan(["professional", "enterprise"])
require_enterprise_plan = require_subscription_plan(["enterprise"])


async def check_feature_access(user: User, feature: str) -> bool:
    """Check if user has access to a specific feature"""
    plan_quotas = settings.plan_quotas.get(user.subscription_plan, {})
    return plan_quotas.get(feature, False)


def require_feature(feature: str):
    """Dependency to require specific feature access"""
    async def feature_checker(current_user: User = Depends(get_current_active_user)) -> User:
        if not await check_feature_access(current_user, feature):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This feature '{feature}' is not available in your current plan: {current_user.subscription_plan}"
            )
        return current_user
    
    return feature_checker


# Redis session management
class SessionManager:
    """Manage user sessions in Redis"""
    
    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client
    
    async def create_session(self, user_id: int, session_data: dict, ttl: int = 3600) -> str:
        """Create user session"""
        import uuid
        
        session_id = str(uuid.uuid4())
        session_key = f"session:{session_id}"
        
        # Store session data
        await self.redis.setex(
            session_key, 
            ttl, 
            json.dumps({
                "user_id": user_id,
                "created_at": datetime.utcnow().isoformat(),
                **session_data
            })
        )
        
        return session_id
    
    async def get_session(self, session_id: str) -> Optional[dict]:
        """Get session data"""
        import json
        
        session_key = f"session:{session_id}"
        data = await self.redis.get(session_key)
        
        if data:
            return json.loads(data)
        return None
    
    async def invalidate_session(self, session_id: str) -> None:
        """Invalidate session"""
        session_key = f"session:{session_id}"
        await self.redis.delete(session_key)
    
    async def extend_session(self, session_id: str, ttl: int = 3600) -> bool:
        """Extend session TTL"""
        session_key = f"session:{session_id}"
        return await self.redis.expire(session_key, ttl)


# Password utilities
class PasswordManager:
    """Password hashing and verification utilities"""
    
    def __init__(self):
        from passlib.context import CryptContext
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    def hash_password(self, password: str) -> str:
        """Hash password"""
        return self.pwd_context.hash(password)
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify password"""
        return self.pwd_context.verify(plain_password, hashed_password)
    
    def generate_password_reset_token(self, user_id: int) -> str:
        """Generate password reset token"""
        expire = datetime.utcnow() + timedelta(hours=1)  # 1 hour expiry
        
        to_encode = {
            "sub": str(user_id),
            "exp": expire,
            "type": "password_reset"
        }
        
        return jwt.encode(to_encode, settings.secret_key, algorithm="HS256")
    
    def verify_password_reset_token(self, token: str) -> Optional[int]:
        """Verify password reset token"""
        try:
            payload = verify_token(token)
            
            if payload.get("type") != "password_reset":
                return None
            
            user_id = payload.get("sub")
            return int(user_id) if user_id else None
            
        except AuthenticationError:
            return None


# Global instances
password_manager = PasswordManager()