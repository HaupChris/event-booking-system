import base64
import binascii
import os
import sqlite3

MAX_SIGNATURE_BYTES = int(os.environ.get("MAX_SIGNATURE_BYTES", "262144"))
ALLOWED_SIGNATURE_MIME_TYPES = {"image/png", "image/jpeg", "image/webp"}


def decode_signature_to_blob(signature: str) -> bytes:
    """
    Decode a base64 signature payload to raw bytes with strict validation.

    Accepts either:
    - data URL format: data:image/png;base64,...
    - raw base64 payload
    """
    signature_value = (signature or "").strip()
    if not signature_value:
        raise ValueError("Signature is required")

    payload = signature_value
    if "," in signature_value:
        header, payload = signature_value.split(",", 1)
        header = header.strip().lower()
        if not (header.startswith("data:") and header.endswith(";base64")):
            raise ValueError("Signature must be base64 encoded")

        mime_type = header[5:-7]
        if mime_type not in ALLOWED_SIGNATURE_MIME_TYPES:
            raise ValueError("Signature image type is not allowed")

    estimated_max_base64_chars = ((MAX_SIGNATURE_BYTES + 2) // 3) * 4 + 4
    if len(payload) > estimated_max_base64_chars:
        raise ValueError("Signature is too large")

    try:
        decoded = base64.b64decode(payload, validate=True)
    except (ValueError, binascii.Error) as exc:
        raise ValueError("Signature payload is not valid base64") from exc

    if not decoded:
        raise ValueError("Signature is empty")

    if len(decoded) > MAX_SIGNATURE_BYTES:
        raise ValueError("Signature is too large")

    return decoded


def encode_signature_blob(signature_blob: bytes | str | None) -> str:  # noqa: PLR0911  # lint-baseline
    """
    Normalize DB signature values to a data URL string for compatibility.

    This is mainly used for backward-compatible responses during migration.
    """
    if signature_blob is None:
        return ""

    if isinstance(signature_blob, str):
        signature_value = signature_blob.strip()
        if not signature_value:
            return ""

        if signature_value.startswith("data:image/"):
            return signature_value

        try:
            raw_bytes = decode_signature_to_blob(signature_value)
            return f"data:image/png;base64,{base64.b64encode(raw_bytes).decode('ascii')}"
        except ValueError:
            return ""

    if isinstance(signature_blob, bytes):
        if not signature_blob:
            return ""
        return f"data:image/png;base64,{base64.b64encode(signature_blob).decode('ascii')}"

    return ""


def migrate_signatures_to_blob(conn: sqlite3.Connection) -> None:
    """
    Convert legacy text/base64 signatures to binary BLOB values in-place.
    """
    cursor = conn.cursor()

    for table_name in ("Bookings", "ArtistBookings"):
        cursor.execute(f"SELECT id, signature FROM {table_name} WHERE signature IS NOT NULL")  # noqa: S608  # lint-baseline
        rows = cursor.fetchall()

        for row_id, signature_value in rows:
            if isinstance(signature_value, bytes):
                continue

            if not isinstance(signature_value, str):
                continue

            signature_text = signature_value.strip()
            if not signature_text:
                continue

            try:
                signature_blob = decode_signature_to_blob(signature_text)
            except ValueError:
                continue

            cursor.execute(
                f"UPDATE {table_name} SET signature = ? WHERE id = ?",  # noqa: S608  # lint-baseline
                (sqlite3.Binary(signature_blob), row_id),
            )

    conn.commit()
