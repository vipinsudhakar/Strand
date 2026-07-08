import os
import pathlib
import tempfile

# Point the app at a throwaway SQLite file BEFORE app modules import settings.
_TEST_DB = pathlib.Path(tempfile.gettempdir()) / "strand_test.db"
if _TEST_DB.exists():
    _TEST_DB.unlink()
os.environ["DATABASE_URL"] = f"sqlite:///{_TEST_DB.as_posix()}"

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as test_client:
        yield test_client


def pytest_sessionfinish(session, exitstatus):
    # Dispose the engine so SQLite releases the file handle (Windows can't
    # delete an open file), then best-effort remove the throwaway db.
    from app.db import engine

    engine.dispose()
    try:
        _TEST_DB.unlink(missing_ok=True)
    except PermissionError:
        pass
