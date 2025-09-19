"""
Teste endpoint de registro
"""

import requests
import json

# Dados de teste que o frontend enviaria
test_data = {
    "name": "João Teste",
    "email": "joao.teste@example.com",
    "password": "123456789",
    "userType": "student",
    "university": "UFMG"
}

try:
    response = requests.post(
        "http://localhost:8000/api/auth/register",
        json=test_data,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("Registro funcionando!")
    else:
        print("Erro no registro")
        
except Exception as e:
    print(f"Erro na conexão: {e}")