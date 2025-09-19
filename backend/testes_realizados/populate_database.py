"""
Script para popular o banco de dados Firebase com dados iniciais
"""

import asyncio
import sys
import os
from datetime import datetime, timedelta

# Adicionar o diretório backend ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config.firebase_config import initialize_firebase, get_db

# Dados de exemplo para popular o banco
sample_users = [
    {
        "id": "user_student_1",
        "name": "João Silva",
        "email": "joao.silva@ufmg.br",
        "phone": "(31) 99999-1111",
        "userType": "student",
        "university": "UFMG",
        "course": "Engenharia da Computação",
        "semester": "6º período",
        "bio": "Estudante de engenharia procurando moradia próxima à universidade.",
        "preferences": {
            "budget": "500-800",
            "roomType": "kitnet",
            "amenities": ["wifi", "garagem"]
        },
        "favoriteProperties": [],
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    },
    {
        "id": "user_student_2", 
        "name": "Maria Santos",
        "email": "maria.santos@pucminas.br",
        "phone": "(31) 99999-2222",
        "userType": "student",
        "university": "PUC Minas",
        "course": "Administração",
        "semester": "4º período",
        "bio": "Estudante de administração buscando quarto próximo ao campus.",
        "preferences": {
            "budget": "400-600",
            "roomType": "quarto",
            "amenities": ["wifi"]
        },
        "favoriteProperties": [],
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    },
    {
        "id": "user_advertiser_1",
        "name": "Carlos Proprietários",
        "email": "carlos@imoveispremium.com",
        "phone": "(31) 99999-3333",
        "userType": "advertiser",
        "companyName": "Imóveis Premium",
        "cnpj": "12.345.678/0001-90",
        "description": "Empresa especializada em imóveis para estudantes universitários.",
        "website": "https://imoveispremium.com",
        "address": "Rua das Flores, 123, Centro, Belo Horizonte - MG",
        "verified": True,
        "totalProperties": 0,
        "rating": 4.8,
        "properties": [],
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
]

sample_properties = [
    {
        "id": "prop_1",
        "title": "Kitnet moderna próxima à UFMG",
        "type": "kitnet",
        "price": 650,
        "location": "Pampulha, Belo Horizonte",
        "university": "UFMG",
        "distance": "500m",
        "amenities": ["wifi", "garagem"],
        "capacity": 1,
        "description": "Kitnet totalmente mobiliada com cozinha americana, banheiro privativo e área de estudos.",
        "images": [],
        "ownerId": "user_advertiser_1",
        "available": True,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    },
    {
        "id": "prop_2",
        "title": "Quarto individual com banheiro privativo",
        "type": "quarto",
        "price": 480,
        "location": "Savassi, Belo Horizonte",
        "university": "PUC Minas",
        "distance": "800m",
        "amenities": ["wifi"],
        "capacity": 1,
        "description": "Quarto individual em casa compartilhada, banheiro privativo, área comum com cozinha.",
        "images": [],
        "ownerId": "user_advertiser_1",
        "available": True,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    },
    {
        "id": "prop_3",
        "title": "Apartamento 2 quartos para compartilhar",
        "type": "apartamento",
        "price": 900,
        "location": "Funcionários, Belo Horizonte",
        "university": "UFMG",
        "distance": "1.2km",
        "amenities": ["wifi", "garagem"],
        "capacity": 2,
        "description": "Apartamento espaçoso para dividir com outro estudante, 2 quartos, sala, cozinha e garagem.",
        "images": [],
        "ownerId": "user_advertiser_1",
        "available": True,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    },
    {
        "id": "prop_4",
        "title": "Kitnet compacta e funcional",
        "type": "kitnet", 
        "price": 580,
        "location": "Centro, Belo Horizonte",
        "university": "PUC Minas",
        "distance": "600m",
        "amenities": ["wifi"],
        "capacity": 1,
        "description": "Kitnet compacta, ideal para estudantes, próxima ao transporte público.",
        "images": [],
        "ownerId": "user_advertiser_1",
        "available": True,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    },
    {
        "id": "prop_5",
        "title": "Quarto em casa compartilhada",
        "type": "quarto",
        "price": 420,
        "location": "Ouro Preto, Belo Horizonte",
        "university": "UFMG",
        "distance": "400m",
        "amenities": ["wifi", "garagem"],
        "capacity": 1,
        "description": "Quarto em casa com outros estudantes, ambiente familiar e seguro.",
        "images": [],
        "ownerId": "user_advertiser_1",
        "available": True,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
]

sample_listings = [
    {
        "id": "listing_1",
        "propertyId": "prop_1",
        "title": "Kitnet moderna próxima à UFMG - Disponível Imediatamente",
        "description": "Kitnet totalmente mobiliada, ideal para estudantes. Localização privilegiada a apenas 500m da UFMG.",
        "price": 650,
        "availableFrom": datetime.utcnow().isoformat(),
        "availableUntil": (datetime.utcnow() + timedelta(days=365)).isoformat(),
        "rules": [
            "Não é permitido fumar",
            "Não é permitido animais",
            "Horário de silêncio após 22h"
        ],
        "contact": {
            "phone": "(31) 99999-3333",
            "email": "carlos@imoveispremium.com",
            "whatsapp": "(31) 99999-3333"
        },
        "images": [],
        "ownerId": "user_advertiser_1",
        "active": True,
        "featured": True,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    },
    {
        "id": "listing_2",
        "propertyId": "prop_2",
        "title": "Quarto individual - Savassi - Próximo PUC Minas",
        "description": "Quarto com banheiro privativo em localização nobre da cidade. Perfeito para estudantes da PUC.",
        "price": 480,
        "availableFrom": datetime.utcnow().isoformat(),
        "availableUntil": (datetime.utcnow() + timedelta(days=365)).isoformat(),
        "rules": [
            "Não é permitido fumar",
            "Visitas até 22h",
            "Manutenção da limpeza das áreas comuns"
        ],
        "contact": {
            "phone": "(31) 99999-3333",
            "email": "carlos@imoveispremium.com",
            "whatsapp": "(31) 99999-3333"
        },
        "images": [],
        "ownerId": "user_advertiser_1",
        "active": True,
        "featured": False,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    },
    {
        "id": "listing_3",
        "propertyId": "prop_3",
        "title": "Apartamento para Dividir - Funcionários",
        "description": "Apartamento de 2 quartos para dividir com outro estudante. Excelente localização e infraestrutura.",
        "price": 900,
        "availableFrom": datetime.utcnow().isoformat(),
        "availableUntil": (datetime.utcnow() + timedelta(days=365)).isoformat(),
        "rules": [
            "Divisão igualitária das contas",
            "Respeito mútuo",
            "Não é permitido fumar"
        ],
        "contact": {
            "phone": "(31) 99999-3333",
            "email": "carlos@imoveispremium.com",
            "whatsapp": "(31) 99999-3333"
        },
        "images": [],
        "ownerId": "user_advertiser_1",
        "active": True,
        "featured": True,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
]

async def populate_database():
    #Popula o banco de dados com dados de exemplo
    
    print("🚀 Inicializando Firebase...")
    initialize_firebase()
    
    db = get_db()
    if not db:
        print("❌ Erro: Não foi possível conectar ao banco de dados")
        return
    
    print("✅ Conectado ao Firebase Firestore")
    print("\n📝 Populando banco de dados com dados de exemplo...")
    
    try:
        # 1. Adicionar usuários
        print("\n👥 Adicionando usuários...")
        for user in sample_users:
            user_id = user.pop('id')
            doc_ref = db.collection('users').document(user_id)
            doc_ref.set(user)
            print(f"   ✅ Usuário criado: {user['name']} ({user['userType']})")
        
        # 2. Adicionar propriedades
        print("\n🏠 Adicionando propriedades...")
        for prop in sample_properties:
            prop_id = prop.pop('id')
            doc_ref = db.collection('properties').document(prop_id)
            doc_ref.set(prop)
            print(f"   ✅ Propriedade criada: {prop['title']}")
        
        # 3. Adicionar listings
        print("\n📋 Adicionando anúncios...")
        for listing in sample_listings:
            listing_id = listing.pop('id')
            doc_ref = db.collection('listings').document(listing_id)
            doc_ref.set(listing)
            print(f"   ✅ Anúncio criado: {listing['title']}")
        
        # 4. Atualizar contador de propriedades do anunciante
        print("\n🔄 Atualizando contador de propriedades...")
        advertiser_ref = db.collection('users').document('user_advertiser_1')
        advertiser_ref.update({
            'totalProperties': len(sample_properties),
            'properties': [f"prop_{i+1}" for i in range(len(sample_properties))]
        })
        
        print("\n🎉 Banco de dados populado com sucesso!")
        print(f"   👥 {len(sample_users)} usuários adicionados")
        print(f"   🏠 {len(sample_properties)} propriedades adicionadas")
        print(f"   📋 {len(sample_listings)} anúncios adicionados")
        
        print("\n📊 Estrutura criada:")
        print("   ├── users/ (perfis de usuários)")
        print("   ├── properties/ (propriedades disponíveis)")
        print("   └── listings/ (anúncios ativos)")
        
    except Exception as e:
        print(f"Erro ao popular banco de dados: {e}")

def main():
    print("=" * 60)
    print("POPULADOR DE BANCO DE DADOS - UNIRESERVAS")
    print("=" * 60)
    
    # Executar a população do banco
    asyncio.run(populate_database())
    
    print("\nPronto!")
    print("Frontend: http://localhost:8080")
    print("Backend API: http://localhost:8000/docs")

if __name__ == "__main__":
    main()