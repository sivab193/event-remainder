import os
import json
import time
import datetime
import redis
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

# Connect to Redis
redis_host = os.getenv('REDIS_HOST', 'localhost')
r = redis.Redis(host=redis_host, port=6379, db=0)

# Initialize Firebase
cred_path = os.getenv('FIREBASE_CREDENTIALS', 'serviceAccountKey.json')
if os.path.exists(cred_path):
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
else:
    print(f"Warning: Firebase credentials not found at {cred_path}. Using mock mode.")
    db = None

def check_birthdays():
    print("Checking birthdays...")
    if not db:
        print("Mock mode: pushing mock events to queues.")
        mock_payload = json.dumps({"userId": "123", "name": "John Doe", "email": "test@example.com"})
        r.lpush("email_queue", mock_payload)
        r.lpush("telegram_queue", mock_payload)
        r.lpush("discord_queue", mock_payload)
        return

    today = datetime.datetime.now()
    current_month = today.month
    current_day = today.day

    users_ref = db.collection('users')
    users = users_ref.stream()

    for user_doc in users:
        user = user_doc.to_dict()
        user_id = user.get('userId')
        notifications = user.get('notifications', {})

        birthdays_ref = db.collection('birthdays').where('userId', '==', user_id).stream()
        for bday_doc in birthdays_ref:
            bday = bday_doc.to_dict()
            try:
                b_year, b_month, b_day = map(int, bday['birthdate'].split('-'))
                if b_month == current_month and b_day == current_day:
                    payload = json.dumps({
                        "userId": user_id,
                        "birthday": bday,
                        "user": user
                    })
                    
                    if notifications.get('email', {}).get('enabled'):
                        r.lpush("email_queue", payload)
                    if notifications.get('telegram', {}).get('enabled'):
                        r.lpush("telegram_queue", payload)
                    if notifications.get('discord', {}).get('enabled'):
                        r.lpush("discord_queue", payload)
                        
            except Exception as e:
                print(f"Error processing {bday}: {e}")

if __name__ == "__main__":
    while True:
        check_birthdays()
        # Run daily (or hourly depending on precision needed)
        time.sleep(86400)
