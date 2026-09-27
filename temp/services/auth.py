import os

import jwt
from fastapi import HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jwt import PyJWKClient
from dotenv import load_dotenv

load_dotenv()

security = HTTPBearer()

SUPABASE_JWKS_URL = os.getenv(
    "SUPABASE_JWKS_URL"
)

jwks_client = PyJWKClient(
    SUPABASE_JWKS_URL
)


def get_current_user(
    credentials: HTTPAuthorizationCredentials =
        security,
):
    token = credentials.credentials

    try:

        signing_key = jwks_client.get_signing_key_from_jwt(
            token
        )

        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256", "ES256"],
            audience="authenticated",
        )

        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
            )

        return user_id

    except jwt.PyJWTError:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )