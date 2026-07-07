from typing import Optional

from fastapi import Header, HTTPException


def get_client_id(
    x_client_id: Optional[str] = Header(default=None, alias="X-Client-Id"),
) -> str:
    """Anonymous per-browser scoping: every POST and history GET must send a
    client-generated UUID in the X-Client-Id header. This is the entire "auth"
    story — not tamper-proof, just convenience scoping for history."""
    if not x_client_id:
        raise HTTPException(status_code=400, detail="Missing X-Client-Id header")
    return x_client_id
