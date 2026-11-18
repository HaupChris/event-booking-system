#!/usr/bin/env python3
"""Enforce the maximum file length (code lines, without blank lines and comments).

Files that already exceeded the limit when the check was introduced are listed in
tools/file_length_allowlist.txt together with their line count at that time. They may
shrink but not grow. Once a listed file is below the limit, its entry must be removed.

Usage:
    python tools/check_file_length.py            # check
    python tools/check_file_length.py --update   # rewrite the allowlist (only after shrinking!)
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

MAX_LINES = 300
REPO_ROOT = Path(__file__).resolve().parent.parent
ALLOWLIST = REPO_ROOT / "tools" / "file_length_allowlist.txt"

SOURCES = [
    ("server", ("*.py",)),
    ("frontend/src", ("*.ts", "*.tsx")),
]
EXCLUDED_PARTS = {".venv", "venv", "node_modules", "__pycache__", "build", "dist"}


def count_code_lines(path: Path) -> int:
    is_python = path.suffix == ".py"
    count = 0
    in_block_comment = False
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line:
            continue
        if is_python:
            if not line.startswith("#"):
                count += 1
            continue
        if in_block_comment:
            in_block_comment = "*/" not in line
            continue
        if line.startswith("//"):
            continue
        if line.startswith("/*"):
            in_block_comment = "*/" not in line
            continue
        count += 1
    return count


def iter_source_files() -> list[Path]:
    files = [
        path
        for base, patterns in SOURCES
        for pattern in patterns
        for path in (REPO_ROOT / base).rglob(pattern)
        if not EXCLUDED_PARTS.intersection(path.relative_to(REPO_ROOT).parts)
    ]
    return sorted(files)


def read_allowlist() -> dict[str, int]:
    entries: dict[str, int] = {}
    if not ALLOWLIST.exists():
        return entries
    for raw_line in ALLOWLIST.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if line and not line.startswith("#"):
            path, count = line.rsplit(maxsplit=1)
            entries[path] = int(count)
    return entries


def write_allowlist(counts: dict[str, int]) -> None:
    header = (
        "# Files exceeding the code line limit (see tools/check_file_length.py).\n"
        "# Format: <path> <max allowed code lines>. Entries may only shrink or be removed.\n"
    )
    body = "".join(f"{path} {count}\n" for path, count in sorted(counts.items()))
    ALLOWLIST.write_text(header + body, encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--update", action="store_true", help="rewrite the allowlist")
    args = parser.parse_args()

    counts = {
        str(path.relative_to(REPO_ROOT)): count_code_lines(path) for path in iter_source_files()
    }
    too_long = {path: count for path, count in counts.items() if count > MAX_LINES}

    if args.update:
        write_allowlist(too_long)
        print(f"Allowlist updated: {len(too_long)} files.")
        return 0

    allowlist = read_allowlist()
    errors: list[str] = []
    for path, count in sorted(too_long.items()):
        allowed = allowlist.get(path)
        if allowed is None:
            errors.append(f"{path}: {count} code lines (max {MAX_LINES})")
        elif count > allowed:
            errors.append(f"{path}: grew to {count} code lines (allowlisted at {allowed})")
    errors.extend(
        f"{path}: now within the limit, remove it from {ALLOWLIST.name}"
        for path in sorted(set(allowlist) - set(too_long))
    )

    for error in errors:
        print(error)
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
