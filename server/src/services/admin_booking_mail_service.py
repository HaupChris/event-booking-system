import re
from typing import Literal, TypedDict

from src.services.app_settings_service import get_payment_link, get_public_app_url
from src.services.artist_service import get_all_artist_bookings, get_up_to_date_artist_form_content
from src.services.booking_service import get_all_bookings, get_up_to_date_form_content
from src.services.mail_service import send_email
from src.utils.logger import get_logger

logger = get_logger(__name__)

BookingType = Literal["regular", "artist"]
CUSTOM_MAIL_TOKEN_NAMES: tuple[str, ...] = (
    "first_name",
    "last_name",
    "full_name",
    "email",
    "profile_url",
    "booking_type",
    "ticket_title",
    "payment_link",
)
PREVIEW_SAMPLE_LIMIT = 3
TOKEN_PATTERN = re.compile(r"{{\s*([a-z_]+)\s*}}")


class SelectedBookingRecipient(TypedDict):
    booking_id: int
    booking_type: BookingType


class CustomMailPreviewItem(TypedDict):
    booking_id: int
    booking_type: BookingType
    recipient_name: str
    recipient_email: str
    subject: str
    body: str


def normalize_selected_booking_recipients(
    raw_recipients: object,
) -> list[SelectedBookingRecipient]:
    """Validate and normalize a recipient selection payload."""
    if not isinstance(raw_recipients, list) or len(raw_recipients) == 0:
        raise ValueError("selected_bookings must be a non-empty list")

    normalized: list[SelectedBookingRecipient] = []
    seen_keys: set[tuple[BookingType, int]] = set()

    for item in raw_recipients:
        if not isinstance(item, dict):
            raise ValueError("selected_bookings entries must be objects")

        booking_type_raw = str(item.get("booking_type", "")).strip().lower()
        if booking_type_raw not in {"regular", "artist"}:
            raise ValueError("booking_type must be either 'regular' or 'artist'")

        booking_type: BookingType = "artist" if booking_type_raw == "artist" else "regular"

        try:
            booking_id = int(item.get("booking_id"))
        except (TypeError, ValueError):
            raise ValueError("booking_id must be an integer") from None

        key = (booking_type, booking_id)
        if key in seen_keys:
            continue

        seen_keys.add(key)
        normalized.append({"booking_id": booking_id, "booking_type": booking_type})

    if len(normalized) == 0:
        raise ValueError("selected_bookings must contain at least one valid booking")

    return normalized


def extract_custom_mail_tokens(template: str) -> set[str]:
    return {match.group(1) for match in TOKEN_PATTERN.finditer(template or "")}


def validate_custom_mail_templates(subject_template: str, body_template: str) -> None:
    """Ensure templates are non-empty and only use supported tokens."""
    if not subject_template.strip():
        raise ValueError("subject_template must not be empty")

    if not body_template.strip():
        raise ValueError("body_template must not be empty")

    used_tokens = extract_custom_mail_tokens(subject_template) | extract_custom_mail_tokens(
        body_template
    )
    unknown_tokens = sorted(used_tokens.difference(CUSTOM_MAIL_TOKEN_NAMES))
    if unknown_tokens:
        supported_tokens = ", ".join(CUSTOM_MAIL_TOKEN_NAMES)
        raise ValueError(
            f"Unsupported template tokens: {', '.join(unknown_tokens)}. Supported tokens: {supported_tokens}"
        )


def render_custom_mail_template(template: str, context: dict[str, str]) -> str:
    """Render supported {{token}} placeholders with booking-specific values."""
    return TOKEN_PATTERN.sub(lambda match: context.get(match.group(1), ""), template)


def _resolve_ticket_title(ticket_id: int, form_content: dict) -> str:
    for option in form_content.get("ticket_options", []):
        if int(option.get("id", -1)) == ticket_id:
            return str(option.get("title", "")).strip()
    return ""


def _build_custom_mail_context(
    booking, booking_type: BookingType, form_content: dict, public_app_url: str, payment_link: str
) -> dict[str, str]:
    first_name = str(getattr(booking, "first_name", "") or "").strip()
    last_name = str(getattr(booking, "last_name", "") or "").strip()
    full_name = f"{first_name} {last_name}".strip()
    profile_uuid = str(getattr(booking, "profile_uuid", "") or "").strip()

    return {
        "first_name": first_name,
        "last_name": last_name,
        "full_name": full_name,
        "email": str(getattr(booking, "email", "") or "").strip(),
        "profile_url": f"{public_app_url}/profile/{profile_uuid}" if profile_uuid else "",
        "booking_type": booking_type,
        "ticket_title": _resolve_ticket_title(int(getattr(booking, "ticket_id", -1)), form_content),
        "payment_link": payment_link,
    }


def _load_booking_mail_sources() -> (
    tuple[dict[int, object], dict[int, object], dict, dict, str, str]
):
    regular_bookings = {booking.id: booking for booking in get_all_bookings()}
    artist_bookings = {booking.id: booking for booking in get_all_artist_bookings()}
    regular_form_content = get_up_to_date_form_content()
    artist_form_content = get_up_to_date_artist_form_content()
    return (
        regular_bookings,
        artist_bookings,
        regular_form_content,
        artist_form_content,
        get_public_app_url(),
        get_payment_link(),
    )


def _resolve_selected_booking_contexts(
    selected_bookings: list[SelectedBookingRecipient],
) -> list[tuple[SelectedBookingRecipient, dict[str, str]]]:
    (
        regular_bookings,
        artist_bookings,
        regular_form_content,
        artist_form_content,
        public_app_url,
        payment_link,
    ) = _load_booking_mail_sources()

    resolved_contexts: list[tuple[SelectedBookingRecipient, dict[str, str]]] = []
    missing_bookings: list[str] = []

    for selected_booking in selected_bookings:
        booking_type = selected_booking["booking_type"]
        booking_id = selected_booking["booking_id"]

        if booking_type == "artist":
            booking = artist_bookings.get(booking_id)
            form_content = artist_form_content
        else:
            booking = regular_bookings.get(booking_id)
            form_content = regular_form_content

        if booking is None:
            missing_bookings.append(f"{booking_type}:{booking_id}")
            continue

        resolved_contexts.append(
            (
                selected_booking,
                _build_custom_mail_context(
                    booking, booking_type, form_content, public_app_url, payment_link
                ),
            )
        )

    if missing_bookings:
        raise ValueError(f"Selected bookings not found: {', '.join(missing_bookings)}")

    return resolved_contexts


def preview_custom_booking_mails(
    subject_template: str, body_template: str, selected_bookings: list[SelectedBookingRecipient]
) -> dict:
    """Render preview samples for a custom admin booking mail."""
    validate_custom_mail_templates(subject_template, body_template)
    resolved_contexts = _resolve_selected_booking_contexts(selected_bookings)

    previews: list[CustomMailPreviewItem] = []
    for selected_booking, context in resolved_contexts[:PREVIEW_SAMPLE_LIMIT]:
        previews.append(
            {
                "booking_id": selected_booking["booking_id"],
                "booking_type": selected_booking["booking_type"],
                "recipient_name": context["full_name"],
                "recipient_email": context["email"],
                "subject": render_custom_mail_template(subject_template, context),
                "body": render_custom_mail_template(body_template, context),
            }
        )

    logger.info(
        "Rendered custom mail preview for %s recipients (%s sample(s))",
        len(resolved_contexts),
        len(previews),
    )

    return {
        "total_recipient_count": len(resolved_contexts),
        "preview_count": len(previews),
        "truncated": len(resolved_contexts) > len(previews),
        "previews": previews,
    }


def send_custom_booking_mails(
    subject_template: str, body_template: str, selected_bookings: list[SelectedBookingRecipient]
) -> dict:
    """Render and send personalized custom emails to selected bookings."""
    validate_custom_mail_templates(subject_template, body_template)
    resolved_contexts = _resolve_selected_booking_contexts(selected_bookings)

    sent_count = 0
    failures: list[str] = []

    for selected_booking, context in resolved_contexts:
        subject = render_custom_mail_template(subject_template, context)
        body = render_custom_mail_template(body_template, context)

        if send_email(context["email"], subject, body):
            sent_count += 1
            continue

        failures.append(
            f"{selected_booking['booking_type']}:{selected_booking['booking_id']} ({context['email']})"
        )

    logger.info(
        "Finished custom booking mail send: %s sent, %s failed",
        sent_count,
        len(failures),
    )

    return {
        "total_recipient_count": len(resolved_contexts),
        "sent": sent_count,
        "failed": len(failures),
        "failures": failures,
    }
