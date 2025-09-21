"""
Configuração do Firebase Firestore
"""

import firebase_admin
from firebase_admin import credentials, firestore, storage # 1. Adicionar 'storage'
from config.settings import settings
import json
import os

#Inicializa a conexão com o Firebase
def initialize_firebase():
    if not firebase_admin._apps:
        try:
            # Usar o arquivo de credenciais do Firebase Admin SDK
            cred_path = os.path.join(os.path.dirname(__file__), '..', 'uni-reservas-firebase-adminsdk-fbsvc-8a0171475a.json')

            if os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
                print(f"Usando credenciais do arquivo: {cred_path}")
            else:
                # Logica de variáveis de ambiente
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
            
            # Adicionar a configuração do Storage Bucket
            firebase_admin.initialize_app(cred, {
                'storageBucket': f"{settings.FIREBASE_PROJECT_ID}.firebasestorage.app"
            })
            print("Firebase inicializado com sucesso!")
        except Exception as e:
            print(f"Erro ao inicializar Firebase: {e}")
            raise e

#Retorna o cliente do Firestore
def get_firestore_client():
    try:
        if not firebase_admin._apps:
            initialize_firebase()
        return firestore.client()
    except Exception as e:
        print(f"Erro ao obter cliente Firestore: {e}")
        return None

#Adicionar uma funçao para obter o bucket do storage
def get_storage_bucket():
    """Retorna a instância do bucket do Firebase Storage."""
    try:
        if not firebase_admin._apps:
            initialize_firebase()
        return storage.bucket()
    except Exception as e:
        print(f"Erro ao obter storage bucket: {e}")
        return None

# Instancia global do cliente Firestore
db = None

#Retorna a instancia do banco de dados
def get_db():
    global db
    if db is None:
        db = get_firestore_client()
    return db