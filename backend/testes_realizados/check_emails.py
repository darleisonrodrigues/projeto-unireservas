import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.config.firebase_config import initialize_firebase, get_db

initialize_firebase()
db = get_db()
users = list(db.collection('users').stream())

print('Emails já cadastrados:')
for user in users:
    user_data = user.to_dict()
    email = user_data.get('email', 'N/A')
    user_type = user_data.get('user_type', 'N/A')
    print(f'  - {email} ({user_type})')

print(f'\nTotal: {len(users)} usuários no banco')