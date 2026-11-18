"""Send booking confirmation mails and record the outcome in the booking's event history."""

from src.models.datatypes import ArtistBooking, Booking
from src.services.booking_events_service import record_profile_event
from src.services.mail_service import send_artist_confirmation_mail, send_confirmation_mail
from src.utils.logger import get_logger

logger = get_logger(__name__)


def send_confirmation(
    booking: Booking | ArtistBooking, form_content: dict, profile_uuid: str
) -> bool:
    """Send the confirmation mail. A failure never fails the booking; it is recorded instead."""
    try:
        if isinstance(booking, ArtistBooking):
            sent = send_artist_confirmation_mail(booking, form_content, profile_uuid)
        else:
            sent = send_confirmation_mail(booking, form_content, profile_uuid)
    except Exception as error:
        logger.exception("confirmation_mail_error", error_type=type(error).__name__)
        sent = False
    record_profile_event(
        profile_uuid, "confirmation_mail_sent" if sent else "confirmation_mail_failed"
    )
    return sent
