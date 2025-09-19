"""
Script para limpar usuários do banco de dados
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.config.firebase_config import initialize_firebase, get_db

def clear_users():
    print("Limpando usuários do banco")
    initialize_firebase()
    db = get_db()
    
    users = list(db.collection('users').stream())
    print(f"Encontrados {len(users)} usuários")

    for user in users:
        print(f"Deletando usuário: {user.id}")
        db.collection('users').document(user.id).delete()
    
    print("Todos os usuários foram removidos!")

if __name__ == "__main__":
    clear_users()