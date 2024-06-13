import os
from typing import Optional

from booking_manager import BookingManager
from mail import send_confirmation_mail
from views import Booking


def get_booking_by_name(first_name: str, last_name: str, booking_manager: BookingManager) -> Optional[Booking]:
    bookings = booking_manager.get_all_bookings()
    for booking in bookings:
        if booking.first_name == first_name and booking.last_name == last_name:
            return booking
    return None


if __name__ == "__main__":
    script_dir = os.path.dirname(__file__)
    booking_manager = BookingManager(json_path=os.path.join(script_dir,  '../form_content.json'),
                                     db_dir=os.path.join(script_dir, '../db'))
    booking = get_booking_by_name("Chris", "Ha", booking_manager)
    form_content_dict = booking_manager.get_up_to_date_form_content()

    send_confirmation_mail(booking, form_content_dict)
