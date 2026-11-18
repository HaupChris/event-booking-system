import json
import logging
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from html import escape

from dotenv import load_dotenv

from src.models.datatypes import ArtistBooking, Booking
from src.services.app_settings_service import get_payment_link, get_public_app_url

load_dotenv()

logger = logging.getLogger(__name__)


def _require_mail_credentials() -> tuple[str, str]:
    gmail_user = os.environ.get("GMAIL_USER")
    gmail_password = os.environ.get("GMAIL_PASS")

    if not gmail_user or not gmail_password:
        raise RuntimeError("Missing mail credentials: GMAIL_USER and GMAIL_PASS must be set")

    return str(gmail_user), str(gmail_password)


def _send_message(msg: MIMEMultipart, recipient: str) -> bool:
    gmail_user, gmail_password = _require_mail_credentials()
    msg["From"] = gmail_user
    msg["To"] = recipient

    try:
        server = smtplib.SMTP_SSL("smtp.gmail.com", 465)
        server.ehlo()
        server.login(gmail_user, gmail_password)
        server.sendmail(gmail_user, recipient, msg.as_string())
        server.close()
        return True
    except Exception as e:
        logger.error(f"Fehler beim Senden der E-Mail an {recipient}: {e}")
        return False


def _render_basic_html_email(body: str) -> str:
    escaped_body = escape(body).replace("\n", "<br>")
    return (
        "<html><body>"
        f'<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">{escaped_body}</div>'
        "</body></html>"
    )


def send_email(recipient: str, subject: str, body: str, html_body: str | None = None) -> bool:
    """Send a generic email with text and optional HTML body."""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject

    if body:
        msg.attach(MIMEText(body, "plain", "utf-8"))

    rendered_html = html_body if html_body is not None else _render_basic_html_email(body)
    if rendered_html:
        msg.attach(MIMEText(rendered_html, "html", "utf-8"))

    return _send_message(msg, recipient)


def get_booking_details(booking: Booking, form_content: dict) -> str:  # noqa: C901  # lint-baseline
    """
    Returns a human-readable textual summary of the booking in German.
    """
    # Retrieve ticket option
    ticket_option = next(
        (to for to in form_content["ticket_options"] if to["id"] == booking.ticket_id), None
    )
    ticket_info = (
        f"Ticket: {ticket_option['title']} - Preis: {ticket_option['price']}€"
        if ticket_option
        else "Ticket: Nicht gefunden"
    )

    # Retrieve beverage option
    beverage_option = next(
        (bo for bo in form_content["beverage_options"] if bo["id"] == booking.beverage_id), None
    )
    beverage_info = (
        f"Getränkeoption: {beverage_option['title']} - Preis: {beverage_option['price']}€"
        if beverage_option
        else "Getränkeoption: Nicht gefunden"
    )

    # Retrieve food option
    food_option = next(
        (fo for fo in form_content["food_options"] if fo["id"] == booking.food_id), None
    )
    food_info = (
        f"Essensoption: {food_option['title']} - Preis: {food_option['price']}€"
        if food_option
        else "Essensoption: Nicht gefunden"
    )

    requires_workshift = True
    if ticket_option is not None:
        requires_workshift = ticket_option.get("requires_workshift", True) is not False

    # Format timeslot info
    def format_timeslot_info(timeslot_id):
        for ws in form_content["work_shifts"]:
            for ts in ws["time_slots"]:
                if ts["id"] == timeslot_id:
                    return f"{ws['title']}, Zeitfenster: {ts['title']}, Von: {ts['start_time']}, Bis: {ts['end_time']}"
        return "Zeitfenster: Nicht gefunden"

    if requires_workshift:
        timeslot_info = "Du hast folgende Prioritäten für deine Supporterschicht gewählt:\n"
        for i, ts_id in enumerate(
            [booking.timeslot_priority_1, booking.timeslot_priority_2, booking.timeslot_priority_3]
        ):
            timeslot_info += f"Priorität {i + 1}: {format_timeslot_info(ts_id)}\n"

        timeslot_info += f"Du hast dich bereit erklärt, maximal {booking.amount_shifts} Schicht(en) zu übernehmen.\n"
    else:
        timeslot_info = "Für dieses Ticket ist kein Arbeitsdienst erforderlich.\n"

    # Materials
    if booking.material_ids:
        materials_info = "Du bringst mit:\n"
        for material in form_content["materials"]:
            if material["id"] in booking.material_ids:
                materials_info += f"- {material['title']}\n"
    else:
        materials_info = "Du bringst keine Materialien mit.\n"

    details = (
        f"{ticket_info}\n\n"
        f"{beverage_info}\n\n"
        f"{food_info}\n\n"
        f"{timeslot_info}\n"
        f"{materials_info}\n"
        f"Gesamtpreis: {booking.total_price}€"
    )
    return details


def send_confirmation_mail(
    booking: Booking, form_content: dict, profile_uuid: str | None = None
) -> None:
    """
    Sends a confirmation email to the user based on the booking details.

    Args:
        booking: The booking object
        form_content: Form content dictionary
        profile_uuid: Unique profile UUID for accessing profile page
    """
    base_url = get_public_app_url()
    payment_link = get_payment_link()

    booking_details_html = get_booking_details(booking, form_content).replace("\n", "<br>")

    # Ticket, beverage, and food title (for PayPal subject)
    ticket_option = next(
        (to for to in form_content["ticket_options"] if to["id"] == booking.ticket_id), None
    )
    beverage_option = next(
        (bo for bo in form_content["beverage_options"] if bo["id"] == booking.beverage_id), None
    )
    food_option = next(
        (fo for fo in form_content["food_options"] if fo["id"] == booking.food_id), None
    )

    ticket_title = ticket_option["title"] if ticket_option else "Ticket nicht gefunden"
    beverage_title = (
        beverage_option["title"] if beverage_option else "Getränkeoption nicht gefunden"
    )
    food_title = food_option["title"] if food_option else "Essensoption nicht gefunden"

    subject = "Zirkus Wiesenwahn - Deine Buchung ist bestätigt!"

    # Profile link section
    if profile_uuid:
        profile_url = f"{base_url}/profile/{profile_uuid}"
        profile_section = f"""
          <div class="details">
            <h3>🎪 Dein persönliches Profil</h3>
            <p>Zugriff auf dein Profil für Neuigkeiten, Schichteneinteilung und mehr:</p>
            <a href="{profile_url}" class="btn">ZUM PROFIL</a>
            <p style="font-size: 0.9em; color: #999; margin-top: 10px;">
              💡 Speichere diesen Link! Du brauchst ihn später für Updates zu deinen Schichten und Festival-Neuigkeiten.
            </p>
            <p style="font-size: 0.85em; color: #d1b67b; margin-top: 5px;">
              Link verloren? Fordere ihn erneut an unter: <a href="{base_url}/profile/recover" style="color: #f0c55f;">Profile wiederherstellen</a>
            </p>
          </div>
        """
    else:
        profile_section = ""

    html = f"""
    <html>
    <head>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Rye&display=swap');

      body {{
        font-family: 'Merriweather', Georgia, serif;
        margin: 0;
        padding: 0;
        color: #f4ead6;
        background: #170a10;
      }}

      h1, h2, h3 {{
        font-family: 'Rye', serif;
        color: #f7e9cf;
      }}

      .container {{
        max-width: 600px;
        margin: 20px auto;
        border: 1px solid #9a6c36;
      }}

      .header {{
        background-color: #2a111b;
        background-image: linear-gradient(145deg, #3f1b29, #251019);
        color: #f7e9cf;
        padding: 20px;
        text-align: center;
        border-bottom: 2px solid #d8b87a;
      }}

      .header h1 {{
        margin: 0;
        text-shadow: 0 2px 6px rgba(0, 0, 0, 0.45);
        letter-spacing: 2px;
      }}

      .content {{
        margin-top: 0;
        background-color: rgba(35, 16, 25, 0.95);
        padding: 20px;
        border-radius: 5px;
        box-shadow: 0 8px 20px rgba(0,0,0,0.45);
      }}

      .details {{
        background-color: rgba(216, 184, 122, 0.08);
        border: 1px solid rgba(216, 184, 122, 0.5);
        padding: 15px;
        border-radius: 5px;
        margin: 15px 0;
      }}

      .btn {{
        display: inline-block;
        background-color: #2e5e98;
        background-image: linear-gradient(180deg, #3c6fb1 0%, #2e5e98 100%);
        color: #ffffff;
        font-weight: 700;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 3px;
        border: 1px solid #9fc5f3;
        margin: 15px 0;
        text-align: center;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        transition: all 0.3s ease;
      }}

      .btn:hover {{
        background-color: #467fc9;
        background-image: linear-gradient(180deg, #4f8cdc 0%, #467fc9 100%);
        color: #ffffff;
      }}

      .footer {{
        margin-top: 20px;
        text-align: center;
        font-size: 0.9em;
        color: #d1b67b;
      }}

      .mission-data {{
        padding: 10px;
        background-color: rgba(216, 184, 122, 0.08);
        border-radius: 5px;
      }}

    </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ZIRKUS WIESENWAHN</h1>
          <p>DO, 13.08.2026 - SO, 16.08.2026</p>
        </div>

        <div class="content">
          <h2>Buchung bestätigt, {booking.first_name}!</h2>

          <p>Willkommen in der Manege! Wir haben deine Teilnahme am Zirkus Wiesenwahn erfolgreich registriert.</p>

          <div class="details mission-data">
            <h3>Deine Buchungsdaten:</h3>
            {booking_details_html}
          </div>

          <p>Für deine Teilnahme fehlt nur noch dein Beitrag:</p>

          <a href="{payment_link}" class="btn">BEITRAG JETZT ZAHLEN</a>

          <p>Betreff für die Zahlung:<br>
          <strong>WW26 - {booking.first_name}, {booking.last_name} - {ticket_title} - {beverage_title} - {food_title}</strong></p>

          <p>Weitere Informationen teilen wir dir rechtzeitig über deine <b>Profilseite</b> mit.</p>

          {profile_section}

          <p>Bis bald in Poppenwind!</p>

          <p>&#127914; Dein Zirkus Wiesenwahn Team &#127914;</p>
        </div>

        <div class="footer">
          Dies ist eine automatisch generierte Nachricht. Bei Fragen kontaktiere das Orga-Team.
        </div>
      </div>
    </body>
    </html>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject

    msg.attach(MIMEText(html, "html"))

    if _send_message(msg, booking.email):
        logger.info("Email erfolgreich versendet!")


def send_artist_confirmation_mail(
    booking: ArtistBooking, form_content: dict, profile_uuid: str | None = None
) -> None:
    """
    Sends a confirmation email to the artist based on the booking details.

    Args:
        booking: The artist booking object
        form_content: Form content dictionary
        profile_uuid: Unique profile UUID for accessing profile page
    """
    base_url = get_public_app_url()
    payment_link = get_payment_link()

    # Get booking details in HTML format
    booking_details_html = get_artist_booking_details(booking, form_content).replace("\n", "<br>")

    # Get ticket, beverage, and food titles for PayPal subject
    ticket_option = next(
        (to for to in form_content["ticket_options"] if to["id"] == booking.ticket_id), None
    )
    beverage_option = next(
        (bo for bo in form_content["beverage_options"] if bo["id"] == booking.beverage_id), None
    )
    food_option = next(
        (fo for fo in form_content["food_options"] if fo["id"] == booking.food_id), None
    )

    ticket_title = ticket_option["title"] if ticket_option else "Ticket nicht gefunden"
    beverage_title = (
        beverage_option["title"] if beverage_option else "Getränkeoption nicht gefunden"
    )
    food_title = food_option["title"] if food_option else "Essensoption nicht gefunden"

    subject = "Zirkus Wiesenwahn - Schön, dass du zu uns kommst!"

    # Profile link section
    if profile_uuid:
        profile_url = f"{base_url}/profile/{profile_uuid}"
        profile_section = f"""
          <div class="details">
            <h3>🎪 Dein persönliches Profil</h3>
            <p>Zugriff auf dein Profil für Neuigkeiten und Festival-Updates:</p>
            <a href="{profile_url}" class="btn">ZUM PROFIL</a>
            <p style="font-size: 0.9em; color: #999; margin-top: 10px;">
              💡 Speichere diesen Link! Du brauchst ihn später für Festival-Neuigkeiten und Updates.
            </p>
            <p style="font-size: 0.85em; color: #d1b67b; margin-top: 5px;">
              Link verloren? Fordere ihn erneut an unter: <a href="{base_url}/profile/recover" style="color: #f0c55f;">Profile wiederherstellen</a>
            </p>
          </div>
        """
    else:
        profile_section = ""

    html = f"""
    <html>
    <head>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Rye&display=swap');

      body {{
        font-family: 'Merriweather', Georgia, serif;
        margin: 0;
        padding: 0;
        color: #f4ead6;
        background: #170a10;
      }}

      h1, h2, h3 {{
        font-family: 'Rye', serif;
        color: #f7e9cf;
      }}

      .container {{
        max-width: 600px;
        margin: 20px auto;
        border: 1px solid #9a6c36;
      }}

      .header {{
        background-color: #2a111b;
        background-image: linear-gradient(145deg, #3f1b29, #251019);
        color: #f7e9cf;
        padding: 20px;
        text-align: center;
        border-bottom: 2px solid #d8b87a;
      }}

      .header h1 {{
        margin: 0;
        text-shadow: 0 2px 6px rgba(0, 0, 0, 0.45);
        letter-spacing: 2px;
      }}

      .content {{
        margin-top: 0;
        background-color: rgba(35, 16, 25, 0.95);
        padding: 20px;
        border-radius: 5px;
        box-shadow: 0 8px 20px rgba(0,0,0,0.45);
      }}

      .details {{
        background-color: rgba(216, 184, 122, 0.08);
        border: 1px solid rgba(216, 184, 122, 0.5);
        padding: 15px;
        border-radius: 5px;
        margin: 15px 0;
      }}

      .artist-badge {{
        display: inline-block;
        background-color: rgba(216, 184, 122, 0.2);
        border: 1px solid rgba(216, 184, 122, 0.65);
        color: #f4ead6;
        padding: 5px 10px;
        border-radius: 4px;
        font-weight: bold;
        margin-bottom: 10px;
      }}

      .btn {{
        display: inline-block;
        background-color: #2e5e98;
        background-image: linear-gradient(180deg, #3c6fb1 0%, #2e5e98 100%);
        color: #ffffff;
        font-weight: 700;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 3px;
        border: 1px solid #9fc5f3;
        margin: 15px 0;
        text-align: center;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        transition: all 0.3s ease;
      }}

      .btn:hover {{
        background-color: #467fc9;
        background-image: linear-gradient(180deg, #4f8cdc 0%, #467fc9 100%);
        color: #ffffff;
      }}

      .footer {{
        margin-top: 20px;
        text-align: center;
        font-size: 0.9em;
        color: #d1b67b;
      }}

      .mission-data {{
        padding: 10px;
        background-color: rgba(216, 184, 122, 0.08);
        border-radius: 5px;
      }}

    </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ZIRKUS WIESENWAHN</h1>
          <p>DO, 13.08.2026 - SO, 16.08.2026</p>
        </div>

        <div class="content">
          <div class="artist-badge">KÜNSTLER</div>
          <h2>Anmeldung bestätigt, {booking.first_name}!</h2>

          <p>Willkommen! Wir freuen uns, dass du uns als Künstler*in beim Zirkus Wiesenwahn bereicherst!</p>

          <div class="details mission-data">
            <h3>Deine Buchungsdaten:</h3>
            {booking_details_html}
          </div>

          {
        booking.total_price > 0
        and f'''
          <p>Für deine Buchung ist noch ein Beitrag erforderlich:</p>

          <a href="{payment_link}" class="btn">BEITRAG JETZT ÜBERWEISEN</a>

          <p>Betreff für die Überweisung:<br>
          <strong>WWWW ARTIST - {booking.first_name}, {booking.last_name} - {ticket_title} - {beverage_title} - {food_title}</strong></p>
          '''
        or "<p>Für dich als Künstler*in fallen keine Kosten an.</p>"
    }

          <p>Weitere Informationen zu deinem Auftritt besprechen wir rechtzeitig vor dem Festival. Dazu werden wir dich zu einer WhatsApp-Gruppe hinzufügen.</p>

          <p>Bei Fragen zu deinem Auftritt, Technik oder Ablauf kannst du uns jederzeit kontaktieren.</p>

          {profile_section}

          <p>Wir freuen uns auf dich!</p>

          <p>&#127914; Dein Zirkus Wiesenwahn Team &#127914;</p>
        </div>

        <div class="footer">
          Dies ist eine automatisch generierte Nachricht. Bei Fragen kontaktiere uns.
        </div>
      </div>
    </body>
    </html>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject

    msg.attach(MIMEText(html, "html"))

    if _send_message(msg, booking.email):
        logger.info("Artist email sent successfully!")


def get_artist_booking_details(booking: ArtistBooking, form_content: dict) -> str:
    """
    Returns a human-readable textual summary of the artist booking in German.
    """
    # Retrieve ticket option
    ticket_option = next(
        (to for to in form_content["ticket_options"] if to["id"] == booking.ticket_id), None
    )
    ticket_info = (
        f"Ticket: {ticket_option['title']} - Preis: {ticket_option['price']}€"
        if ticket_option
        else "Ticket: Nicht gefunden"
    )

    # Retrieve beverage option
    beverage_option = next(
        (bo for bo in form_content["beverage_options"] if bo["id"] == booking.beverage_id), None
    )
    beverage_info = (
        f"Getränkeoption: {beverage_option['title']} - Preis: {beverage_option['price']}€"
        if beverage_option
        else "Getränkeoption: Nicht gefunden"
    )

    # Retrieve food option
    food_option = next(
        (fo for fo in form_content["food_options"] if fo["id"] == booking.food_id), None
    )
    food_info = (
        f"Essensoption: {food_option['title']} - Preis: {food_option['price']}€"
        if food_option
        else "Essensoption: Nicht gefunden"
    )

    # Format performance details
    performance_info = "Auftrittsinformationen:\n"
    if booking.performance_details:
        try:
            details = json.loads(booking.performance_details)
            if details.get("preferredDay"):
                performance_info += f"Bevorzugter Tag: {details['preferredDay']}\n"
            if details.get("preferredTime"):
                performance_info += f"Bevorzugte Zeit: {details['preferredTime']}\n"
            if details.get("duration"):
                performance_info += f"Dauer: {details['duration']} Minuten\n"
            if details.get("genre"):
                performance_info += f"Genre: {details['genre']}\n"
        except (TypeError, ValueError, json.JSONDecodeError):
            performance_info += "Auftrittsinformationen sind formatiert als JSON gespeichert und können hier nicht angezeigt werden.\n"
    else:
        performance_info += "Keine Auftrittsinformationen angegeben.\n"

    # Materials
    if booking.artist_material_ids:
        materials_info = "Du bringst mit:\n"
        for material_id in booking.artist_material_ids:
            material = next(
                (m for m in form_content["artist_materials"] if m["id"] == material_id), None
            )
            if material:
                materials_info += f"- {material['title']}\n"
    else:
        materials_info = "Du bringst keine Materialien mit.\n"

    equipment_info = f"Technische Anforderungen: {booking.equipment or 'Keine angegeben'}\n"
    special_requests_info = f"Besondere Anfragen: {booking.special_requests or 'Keine angegeben'}\n"

    details = (
        f"{ticket_info}\n\n"
        f"{beverage_info}\n\n"
        f"{food_info}\n\n"
        f"{performance_info}\n"
        f"{equipment_info}\n"
        f"{special_requests_info}\n"
        f"{materials_info}\n"
        f"Gesamtpreis: {booking.total_price}€"
    )
    return details


def send_profile_recovery_mail(email: str, profiles: list) -> None:
    """
    Sends a profile recovery email with links to all profiles associated with the email.

    Args:
        email: The email address to send to
        profiles: List of dicts with 'profile_uuid', 'name', 'booking_type', 'timestamp'
    """
    base_url = get_public_app_url()

    # Build profile links HTML
    profile_links_html = ""
    for profile in profiles:
        profile_url = f"{base_url}/profile/{profile['profile_uuid']}"
        booking_type_label = "Künstler" if profile["booking_type"] == "artist" else "Regular"
        profile_links_html += f"""
          <div class="profile-item">
            <h4>{profile["name"]} ({booking_type_label})</h4>
            <p style="font-size: 0.9em; color: #999;">Buchung vom: {profile["timestamp"][:10]}</p>
            <a href="{profile_url}" class="btn">PROFIL ÖFFNEN</a>
          </div>
        """

    subject = "Zirkus Wiesenwahn - Deine Profil-Links"

    html = f"""
    <html>
    <head>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Rye&display=swap');

      body {{
        font-family: 'Merriweather', Georgia, serif;
        margin: 0;
        padding: 0;
        color: #f4ead6;
        background: #170a10;
      }}

      h1, h2, h3, h4 {{
        font-family: 'Rye', serif;
        color: #f7e9cf;
      }}

      .container {{
        max-width: 600px;
        margin: 20px auto;
        border: 1px solid #9a6c36;
      }}

      .header {{
        background-color: #2a111b;
        background-image: linear-gradient(145deg, #3f1b29, #251019);
        color: #f7e9cf;
        padding: 20px;
        text-align: center;
        border-bottom: 2px solid #d8b87a;
      }}

      .header h1 {{
        margin: 0;
        text-shadow: 0 2px 6px rgba(0, 0, 0, 0.45);
        letter-spacing: 2px;
      }}

      .content {{
        background-color: rgba(35, 16, 25, 0.95);
        padding: 20px;
        border-radius: 5px;
      }}

      .profile-item {{
        background-color: rgba(216, 184, 122, 0.08);
        border: 1px solid rgba(216, 184, 122, 0.5);
        padding: 15px;
        border-radius: 5px;
        margin: 15px 0;
      }}

      .profile-item h4 {{
        margin-top: 0;
        color: #e5cf9f;
      }}

      .btn {{
        display: inline-block;
        background-color: #2e5e98;
        background-image: linear-gradient(180deg, #3c6fb1 0%, #2e5e98 100%);
        color: #ffffff;
        font-weight: 700;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 3px;
        border: 1px solid #9fc5f3;
        margin: 10px 0;
        text-align: center;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        transition: all 0.3s ease;
      }}

      .btn:hover {{
        background-color: #467fc9;
        background-image: linear-gradient(180deg, #4f8cdc 0%, #467fc9 100%);
        color: #ffffff;
      }}

      .footer {{
        margin-top: 20px;
        text-align: center;
        font-size: 0.9em;
        color: #d1b67b;
        padding: 15px;
      }}
    </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ZIRKUS WIESENWAHN</h1>
          <p>DO, 13.08.2026 - SO, 16.08.2026</p>
        </div>

        <div class="content">
          <h2>🔑 Deine Profil-Links</h2>

          <p>Du hast deine Profil-Links angefordert. Hier findest du alle Profile, die mit dieser E-Mail-Adresse verbunden sind:</p>

          {profile_links_html}

          <p style="margin-top: 20px; padding: 15px; background-color: rgba(216, 184, 122, 0.12); border-left: 3px solid #d8b87a; border-radius: 3px;">
            💡 <strong>Tipp:</strong> Speichere diese Links, um später auf dein Profil, Schichteinteilungen und Festival-Neuigkeiten zuzugreifen.
          </p>

          <p>Bei Fragen kontaktiere uns jederzeit.</p>

          <p>&#127914; Dein Zirkus Wiesenwahn Team &#127914;</p>
        </div>

        <div class="footer">
          Dies ist eine automatisch generierte Nachricht. Bei Fragen kontaktiere das Orga-Team.
        </div>
      </div>
    </body>
    </html>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject

    msg.attach(MIMEText(html, "html"))

    if _send_message(msg, email):
        logger.info(f"Profile recovery email sent successfully to {email}!")
