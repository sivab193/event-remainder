import os
import json
import time
import requests
import redis

redis_host = os.getenv('REDIS_HOST', 'localhost')
r = redis.Redis(host=redis_host, port=6379, db=0)

def send_discord(webhook_url, bday):
    message = {
        "content": "🎂 **Birthday Reminder**",
        "embeds": [{
            "title": f"Wish {bday.get('name')} a Happy Birthday! 🎉",
            "fields": [
                {"name": "Company", "value": bday.get('company', ''), "inline": True},
                {"name": "Date", "value": bday.get('birthdate', ''), "inline": True}
            ],
            "color": 0x667eea
        }]
    }
    try:
        resp = requests.post(webhook_url, json=message)
        resp.raise_for_status()
        print("Discord notification sent")
    except Exception as e:
        print(f"Discord Error: {e}")

if __name__ == "__main__":
    print("Discord worker listening...")
    while True:
        _, msg = r.brpop("discord_queue")
        data = json.loads(msg)
        
        user = data.get('user', {})
        bday = data.get('birthday', {})
        
        webhook_url = user.get('notifications', {}).get('discord', {}).get('webhookUrl')
        
        if webhook_url:
            send_discord(webhook_url, bday)
