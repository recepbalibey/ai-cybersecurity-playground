import os
import tempfile

import pytest  # noqa: F401

# Point the database at a throwaway file BEFORE main.py imports app.database
import app.database as db
db.DB_PATH = os.path.join(tempfile.mkdtemp(), "test.db")

from fastapi.testclient import TestClient  # noqa: E402
from main import app  # noqa: E402


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c