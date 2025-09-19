import requests
import json

data = {
    "name": "Lucas Teste",
    "email": "lucas.teste@example.com", 
    "password": "12345678",
    "userType": "student",
    "university": "UFMG"
}

try:
    response = requests.post("http://localhost:8000/api/auth/register", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Erro: {e}")