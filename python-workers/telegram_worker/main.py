import os
import json
import time
import requests
import redis

redis_host = os.getenv('REDIS_HOST', 'localhost')
r = redis.Redis(host=redis_host, port=6379, db=0)

BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')

def send_telegram(chat_id, text):
    if not BOT_TOKEN:
        print("Missing TELEGRAM_BOT_TOKEN")
        return
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    payload = {"chat_id": chat_id, "text": text, "parse_mode": "Markdown"}
    try:
        resp = requests.post(url, json=payload)
        resp.raise_for_status()
        print(f"Telegram sent to {chat_id}")
    except Exception as e:
        print(f"Telegram Error: {e}")

if __name__ == "__main__":
    print("Telegram worker listening...")
    while True:
        _, msg = r.brpop("telegram_queue")
        data = json.loads(msg)
        
        user = data.get('user', {})
        bday = data.get('birthday', {})
        
        chat_id = user.get('notifications', {}).get('telegram', {}).get('chatId')
        
        if chat_id:
            text = f"🎂 *Birthday Reminder*\n\nIt's time to wish *{bday.get('name')}* a happy birthday! 🎉\n🏢 Company: {bday.get('company')}\n📅 Date: {bday.get('birthdate')}"
            send_telegram(chat_id, text)
