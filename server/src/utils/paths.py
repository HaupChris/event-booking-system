"""Filesystem locations of the SQLite database and the static data files.

Single place for path resolution (previously duplicated in every service).
`DB_FILE_PATH` can be set in the environment to use a different database,
e.g. in tests.
"""

import os
from pathlib import Path

SERVER_DIR = Path(__file__).resolve().parents[2]


def in_docker() -> bool:
    return os.environ.get("IN_DOCKER", "False").lower() == "true"


def get_db_file_path() -> str:
    override = os.environ.get("DB_FILE_PATH", "").strip()
    if override:
        return override
    if in_docker():
        return "/app/user_data/bookings.db"
    return str(SERVER_DIR / "db" / "bookings.db")


def get_data_dir() -> Path:
    return Path("/app/data") if in_docker() else SERVER_DIR / "data"


def get_log_dir() -> Path:
    override = os.environ.get("LOG_DIR", "").strip()
    if override:
        return Path(override)
    return Path("/app/logs") if in_docker() else SERVER_DIR / "logs"
