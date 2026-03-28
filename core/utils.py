import threading
from twilio.rest import Client
from django.conf import settings

# ==========================================
# 📱 1. CORE ENGINE: REAL TWILIO SMS SENDER
# ==========================================
def send_real_sms_alert(phone_number, message):
    """
    Background mein Real SMS bhejega taaki server hang na ho.
    """
    def send():
        try:
            # Phone number formatting (India +91)
            formatted_phone = str(phone_number)
            if not formatted_phone.startswith('+'):
                formatted_phone = '+91' + formatted_phone

            client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            response = client.messages.create(
                body=message,
                from_=settings.TWILIO_PHONE_NUMBER,
                to=formatted_phone
            )
            print(f"✅ REAL SMS SENT to {formatted_phone}! SID: {response.sid}")
        except Exception as e:
            print(f"❌ Twilio SMS Failed: {e}")

    # Asynchronous Threading lagayi hai taaki API fast chale
    threading.Thread(target=send).start()
    return True


# ==========================================
# 💰 2. FEE DUES ALERT (For Parents)
# ==========================================
def send_fee_alert(student_name, parent_phone, balance):
    """
    Pending fees ka reminder message.
    """
    msg = f"Shivadda Portal Alert: Dear Parent, fees of Rs.{balance} for {student_name} is pending. Please submit it on time."
    print(f"⏳ Triggering Fee Alert SMS for {parent_phone}...")
    
    # Upar wale Core Engine ko call kar diya
    return send_real_sms_alert(parent_phone, msg)


# ==========================================
# 🔔 3. GENERAL NOTIFICATION ALERT
# ==========================================
def send_notification_alert(phone_number, message):
    """
    Exam results, attendance, ya koi aur custom message ke liye.
    """
    print(f"⏳ Triggering General SMS for {phone_number}...")
    
    # Prefix laga kar bhejenge taaki official lage
    final_msg = f"Shivadda Update: {message}"
    return send_real_sms_alert(phone_number, final_msg)