"""
Configuração do Firebase Firestore
"""

import firebase_admin
from firebase_admin import credentials, firestore
from config.settings import settings
import json
import os

#Inicializa a conexão com o Firebase
def initialize_firebase():
    if not firebase_admin._apps:
        try:
            # Verifica se tem arquivo de credenciais ou usa variáveis de ambiente
            cred_path = os.path.join(os.path.dirname(__file__), '..', 'firebase-credentials.json')
            
            if os.path.exists(cred_path):
                # Usar arquivo de credenciais
                cred = credentials.Certificate(cred_path)
            else:
                # Usar variáveis de ambiente
                firebase_config = {
                    "type": "service_account",
                    "project_id": settings.FIREBASE_PROJECT_ID,
                    "private_key_id": settings.FIREBASE_PRIVATE_KEY_ID,
                    "private_key": settings.FIREBASE_PRIVATE_KEY.replace("\\n", "\n"),
                    "client_email": settings.FIREBASE_CLIENT_EMAIL,
                    "client_id": settings.FIREBASE_CLIENT_ID,
                    "auth_uri": settings.FIREBASE_AUTH_URI,
                    "token_uri": settings.FIREBASE_TOKEN_URI,
                    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                    "client_x509_cert_url": settings.FIREBASE_CLIENT_X509_CERT_URL
                }
                cred = credentials.Certificate(firebase_config)
            
            firebase_admin.initialize_app(cred)
            print("✅ Firebase inicializado com sucesso!")
        except Exception as e:
            print(f"❌ Erro ao inicializar Firebase: {e}")
            # Para desenvolvimento, continue sem Firebase
            pass

    #Retorna o cliente do Firestore
def get_firestore_client():
    try:
        if not firebase_admin._apps:
            initialize_firebase()
        return firestore.client()
    except Exception as e:
        print(f"❌ Erro ao obter cliente Firestore: {e}")
        return None


# Instância global do cliente Firestore
db = None

#Retorna a instância do banco de dados
def get_db():
    global db
    if db is None:
        db = get_firestore_client()
    return db