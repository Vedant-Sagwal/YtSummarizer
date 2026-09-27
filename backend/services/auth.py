import os

import jwt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient


load_dotenv()


security = HTTPBearer()


SUPABASE_URL = os.getenv("SUPABASE_URL")

if not SUPABASE_URL:
    raise RuntimeError(
        "SUPABASE_URL is not configured"
    )


SUPABASE_URL = SUPABASE_URL.rstrip("/")

JWKS_URL = (
    f"{SUPABASE_URL}"
    "/auth/v1/.well-known/jwks.json"
)

SUPABASE_ISSUER = (
    f"{SUPABASE_URL}/auth/v1"
)


jwks_client = PyJWKClient(JWKS_URL)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        security
    ),
):
    token = credentials.credentials

    try:
        # -----------------------------------------
        # Get the public key corresponding to the
        # `kid` in the JWT header.
        # -----------------------------------------

        signing_key = (
            jwks_client.get_signing_key_from_jwt(
                token
            )
        )

        # -----------------------------------------
        # Verify JWT signature and claims
        # -----------------------------------------

        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256"],
            audience="authenticated",
            issuer=SUPABASE_ISSUER,
        )

        # -----------------------------------------
        # Return decoded Supabase user information
        # -----------------------------------------

        return payload["sub"]

    except jwt.ExpiredSignatureError:
        print("JWT verification failed: token expired")

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )

    except jwt.InvalidIssuerError:
        print("JWT verification failed: invalid issuer")

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token issuer",
        )

    except jwt.InvalidAudienceError:
        print("JWT verification failed: invalid audience")

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token audience",
        )

    except jwt.InvalidTokenError as e:
        print(
            f"JWT verification failed: {e}"
        )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        )

    except Exception as e:
        print(
            f"JWT verification error: {e}"
        )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not verify authentication token",
        )