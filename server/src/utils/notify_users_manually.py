import os

from src.booking_manager import BookingManager
from src.mail import send_confirmation_mail
from src.views import Booking


def get_booking_by_name(first_name: str, last_name: str, bm: BookingManager) -> Booking | None:
    bookings = bm.get_all_bookings()
    for booking in bookings:
        if booking.first_name == first_name and booking.last_name == last_name:
            return booking
    return None


def send_confirmation_mails(names: list[tuple[str, str]], bm: BookingManager):
    for name in names:
        booking = get_booking_by_name(name[0], name[1], bm)
        form_content_dict = bm.get_up_to_date_form_content()
        send_confirmation_mail(booking, form_content_dict)


script_dir = os.path.dirname(__file__)
bm = BookingManager(
    json_path=os.path.join(script_dir, "form_content.json"), db_dir=os.path.join(script_dir, "db")
)
name_list = [
    ("Hans", "Test"),
]
send_confirmation_mails(name_list, bm)
