import httpx
from fastapi import HTTPException

from app.config import get_settings

settings = get_settings()

# ESMFold folds can take a while; give the upstream generous headroom.
_TIMEOUT = httpx.Timeout(120.0)


async def fold_sequence(sequence: str) -> str:
    """Proxy a single sequence to the public ESMFold endpoint and return the
    raw PDB text. The browser never talks to api.esmatlas.com directly."""
    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
            response = await client.post(settings.esmfold_url, content=sequence)
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="ESMFold request timed out")
    except httpx.HTTPError:
        raise HTTPException(status_code=502, detail="ESMFold upstream error")

    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="ESMFold upstream error")

    return response.text
