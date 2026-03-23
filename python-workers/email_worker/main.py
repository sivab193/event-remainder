import os
import json
import time
import resend
import redis

redis_host = os.getenv('REDIS_HOST', 'localhost')
r = redis.Redis(host=redis_host, port=6379, db=0)

resend.api_key = os.getenv('RESEND_API_KEY')

def send_email(email, bday):
    if not resend.api_key:
        print("Missing RESEND_API_KEY")
        return

    html = f"""
    <div style="font-family: sans-serif; text-align: center;">
      <h2>🎂 Birthday Reminder</h2>
      <p>It's time to wish <strong>{bday.get('name')}</strong> a happy birthday!</p>
      <p>Company: {bday.get('company')}<br>Date: {bday.get('birthdate')}</p>
    </div>
    """

    try:
        r = resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": email,
            "subject": f"🎂 Birthday Reminder: {bday.get('name')}",
            "html": html
        })
        print(f"Email sent to {email}")
    except Exception as e:
        print(f"Email Error: {e}")

if __name__ == "__main__":
    print("Email worker listening...")
    while True:
        _, msg = r.brpop("email_queue")
        data = json.loads(msg)
        
        user = data.get('user', {})
        bday = data.get('birthday', {})
        
        email = user.get('notifications', {}).get('email', {}).get('address')
        if not email:
            email = user.get('email')
            
        if email:
            send_email(email, bday)
