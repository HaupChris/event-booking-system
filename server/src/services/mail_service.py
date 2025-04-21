import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

from src.models.datatypes import Booking
from typing import Dict

load_dotenv()

def get_booking_details(booking: Booking, form_content: Dict) -> str:
    """
    Returns a human-readable textual summary of the booking in German.
    """
    # Retrieve ticket option
    ticket_option = next((
        to for to in form_content["ticket_options"]
        if to["id"] == booking.ticket_id
    ), None)
    ticket_info = f"Ticket: {ticket_option['title']} - Preis: {ticket_option['price']}€" if ticket_option else "Ticket: Nicht gefunden"

    # Retrieve beverage option
    beverage_option = next((
        bo for bo in form_content['beverage_options']
        if bo['id'] == booking.beverage_id
    ), None)
    beverage_info = f"Getränkeoption: {beverage_option['title']} - Preis: {beverage_option['price']}€" if beverage_option else "Getränkeoption: Nicht gefunden"

    # Retrieve food option
    food_option = next((
        fo for fo in form_content['food_options']
        if fo['id'] == booking.food_id
    ), None)
    food_info = f"Essensoption: {food_option['title']} - Preis: {food_option['price']}€" if food_option else "Essensoption: Nicht gefunden"

    # Format timeslot info
    def format_timeslot_info(timeslot_id):
        for ws in form_content['work_shifts']:
            for ts in ws['time_slots']:
                if ts['id'] == timeslot_id:
                    return f"{ws['title']}, Zeitfenster: {ts['title']}, Von: {ts['start_time']}, Bis: {ts['end_time']}"
        return "Zeitfenster: Nicht gefunden"

    timeslot_info = "Du hast folgende Prioritäten für deine Supporterschicht gewählt:\n"
    for i, ts_id in enumerate([
        booking.timeslot_priority_1,
        booking.timeslot_priority_2,
        booking.timeslot_priority_3
    ]):
        timeslot_info += f"Priorität {i+1}: {format_timeslot_info(ts_id)}\n"

    timeslot_info += f"Du hast dich bereit erklärt, maximal {booking.amount_shifts} Schicht(en) zu übernehmen.\n"

    # Materials
    if booking.material_ids:
        materials_info = "Du bringst mit:\n"
        for material in form_content['materials']:
            if material['id'] in booking.material_ids:
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


def send_confirmation_mail(booking: Booking, form_content: Dict) -> None:
    """
    Sends a confirmation email to the user based on the booking details.
    """
    gmail_user = os.environ.get("GMAIL_USER")
    gmail_password = os.environ.get("GMAIL_PASS")

    booking_details_html = get_booking_details(booking, form_content).replace('\n', '<br>')

    # Ticket, beverage, and food title (for PayPal subject)
    ticket_option = next((to for to in form_content["ticket_options"] if to["id"] == booking.ticket_id), None)
    beverage_option = next((bo for bo in form_content['beverage_options'] if bo['id'] == booking.beverage_id), None)
    food_option = next((fo for fo in form_content['food_options'] if fo['id'] == booking.food_id), None)

    ticket_title = ticket_option['title'] if ticket_option else "Ticket nicht gefunden"
    beverage_title = beverage_option['title'] if beverage_option else "Getränkeoption nicht gefunden"
    food_title = food_option['title'] if food_option else "Essensoption nicht gefunden"

    subject = "Weiher Wald & Weltall-Wahn - Deine Mission ist bestätigt!"

    html = f"""
    <html>
    <head>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');

      body {{
        font-family: 'Helvetica', sans-serif;
        margin: 0;
        padding: 0;
        color: #C0C0C0;
        background-color: #0d0d0d;
        background-image: 
          radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 40px),
          radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 30px),
          radial-gradient(white, rgba(255,255,255,.1) 2px, transparent 40px);
        background-size: 550px 550px, 350px 350px, 250px 250px;
        background-position: 0 0, 40px 60px, 130px 270px;
      }}

      h1, h2, h3 {{
        font-family: 'Orbitron', sans-serif;
        color: white;
      }}

      .container {{
        max-width: 600px;
        margin: 20px auto;
        border: 1px solid #333;
      }}

      .header {{
        background-color: #1a1a1a;
        background-image: linear-gradient(145deg, #222222, #1a1a1a);
        color: #ffffff;
        padding: 20px;
        text-align: center;
        border-bottom: 2px solid #C0C0C0;
        position: relative;
        overflow: hidden;
      }}

      .header::before {{
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: 
          radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px);
        background-size: 15px 15px;
        z-index: 0;
      }}

      .header h1 {{
        position: relative;
        margin: 0;
        text-shadow: 0 0 10px rgba(192, 192, 192, 0.8);
        letter-spacing: 2px;
      }}

      .content {{
        margin-top: 0;
        background-color: rgba(26, 26, 26, 0.9);
        padding: 20px;
        border-radius: 5px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.5);
      }}

      .details {{
        background-color: rgba(0, 0, 0, 0.3);
        border: 1px solid #333;
        padding: 15px;
        border-radius: 5px;
        margin: 15px 0;
      }}

      .btn {{
        display: inline-block;
        background: linear-gradient(145deg, #222222, #1a1a1a);
        color: #C0C0C0;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 3px;
        border: 1px solid #C0C0C0;
        margin: 15px 0;
        text-align: center;
        box-shadow: 0 0 6px #C0C0C0;
        transition: all 0.3s ease;
      }}

      .btn:hover {{
        box-shadow: 0 0 12px #FFFFFF;
        color: #FFFFFF;
      }}

      .footer {{
        margin-top: 20px;
        text-align: center;
        font-size: 0.9em;
        color: #777;
      }}

      .mission-data {{
        padding: 10px;
        background-color: rgba(50, 50, 50, 0.3);
        border-radius: 5px;
      }}

    </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>WEIHER WALD & WELTALL-WAHN</h1>
          <p>DO, 28.08.2025 - SO, 31.08.2025</p>
        </div>

        <div class="content">
          <h2>Mission bestätigt, Astronaut {booking.first_name}!</h2>

          <p>Willkommen an Bord! Die Flugleitung hat deine Teilnahme an der interstellaren Mission "Weiher Wald & Weltall-Wahn" registriert.</p>

          <div class="details mission-data">
            <h3>Missionsdaten:</h3>
            {booking_details_html}
          </div>

          <p>Für den Start deiner Mission ist noch ein Treibstofftransfer erforderlich:</p>

          <a href="https://www.paypal.me/StephanHau" class="btn">TREIBSTOFFTRANSFER STARTEN</a>

          <p>Betreff für den Transfer:<br>
          <strong>WW26 - {booking.first_name}, {booking.last_name} - {ticket_title} - {beverage_title} - {food_title}</strong></p>

          <p>Weitere Missionsdaten werden über den Kommunikationskanal "WhatsApp" übermittelt.</p>

          <p>Countdown läuft! Wir sehen uns im Orbit über Poppenwind!</p>

          <p>&#128640; Dein Weltall-Wahn Missionskontrollteam &#x1F680;</p>
        </div>

        <div class="footer">
          Dies ist eine automatisch generierte Nachricht. Bei Fragen kontaktiere die Missionszentrale.
        </div>
      </div>
    </body>
    </html>
    """

    msg = MIMEMultipart('alternative')
    msg['From'] = gmail_user
    msg['To'] = booking.email
    msg['Subject'] = subject

    msg.attach(MIMEText(html, 'html'))

    try:
        server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        server.ehlo()
        server.login(gmail_user, gmail_password)
        server.sendmail(gmail_user, booking.email, msg.as_string())
        server.close()
        print("Email erfolgreich gesendet!")
    except Exception as e:
        print(f"Fehler beim Senden der E-Mail: {e}")