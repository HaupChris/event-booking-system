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

    subject = "5 Jahre Wiesenwahn - Du bist dabei!"

    html = f"""
    <html>
    <head>
    <style>
      body {{
        font-family: Arial, Helvetica, sans-serif;
        margin: 20px;
        color: #224e6b;
        background-color: #e8f5ff;
      }}
      .header {{
        background-color: #0093d1;
        color: #ffffff;
        padding: 20px;
        text-align: center;
        border-radius: 10px;
      }}
      .content {{
        margin-top: 20px;
        background-color: #a5d9f0;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
      }}
    </style>
    </head>
    <body>
      <div class="header">
        <h1>Willkommen zum Weiher Wald & Wiesenwahn!</h1>
        <p>29.08. - 01.09.2024</p>
      </div>
      <div class="content">
        Liebe/r <strong>{booking.first_name} {booking.last_name}</strong>,<br><br>
        Wie schön, dass du bei unserem 5 jährigen Jubiläum dabei bist! Hier die Zusammenfassung für deinen Besuch:<br><br>
        {booking_details_html}<br><br>
        Falls noch nicht geschehen, sende bitte deinen Beitrag an unser Paypal: 
        <a href="https://www.paypal.me/StephanHau">https://www.paypal.me/StephanHau</a><br>
        Betreff: <u>WW24 - {booking.first_name}, {booking.last_name} - {ticket_title} - {beverage_title} - {food_title}</u>
        <br><br>      
        Alle weiteren Informationen teilen wir dir rechtzeitig in der Whatsapp Gruppe mit.
        <br><br>
        Bis bald in Poppenwind!<br><br>
        &#127881; Dein Wiesenwahn Team &#127882;
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
