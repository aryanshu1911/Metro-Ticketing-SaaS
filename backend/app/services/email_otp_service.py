import smtplib
import random
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from datetime import datetime, timedelta

EMAIL_HOST = os.getenv("EMAIL_HOST")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")

def generate_otp():
    return str(random.randint(100000, 999999))

def send_email_otp(to_email: str):
    otp = generate_otp()
    
    # Compose email
    message = MIMEMultipart()
    message['From'] = EMAIL_USER
    message['To'] = to_email
    message['Subject'] = 'Your Metro Ticketing OTP'
    message.attach(MIMEText(f'Your OTP for Metro Ticketing is: {otp}', 'plain'))
    
    # Send email
    try:
        server = smtplib.SMTP(EMAIL_HOST, EMAIL_PORT)
        server.starttls()
        server.login(EMAIL_USER, EMAIL_PASS)
        server.sendmail(EMAIL_USER, to_email, message.as_string())
        server.quit()
        return otp
    except Exception as e:
        print("Failed to send email OTP:", e)
        return None