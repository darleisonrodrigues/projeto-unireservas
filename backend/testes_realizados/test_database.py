"""
Script para testar a conexão com o banco de dados Firebase Firestore
"""

import sys
import os

# Adicionar o diretório backend ao path
backend_path = os.path.join(os.path.dirname(__file__))
sys.path.append(backend_path)

from config.firebase_config import initialize_firebase, get_db
from datetime import datetime
import uuid


def test_firebase_connection():
    print("Testando conexao com Firebase Firestore...")
    
    try:
        # Inicializar Firebase
        initialize_firebase()
        print("Firebase inicializado com sucesso!")
        
        # Obter cliente do banco
        db = get_db()
        if db is None:
            print("Erro: Nao foi possível obter cliente do banco")
            return False
        
        print("Cliente Firestore obtido com sucesso!")
        return True
        
    except Exception as e:
        print(f"Erro na conexao: {e}")
        return False


def test_database_operations():
    print("\nTestando operações no banco de dados...")
    
    try:
        db = get_db()
        if not db:
            print("Banco não disponível")
            return False
        
        # Teste 1: Criar um documento de teste
        test_collection = "test_connection"
        test_doc_id = f"test_{uuid.uuid4().hex[:8]}"
        
        test_data = {
            "id": test_doc_id,
            "message": "Teste de conexão UniReservas",
            "timestamp": datetime.utcnow(),
            "status": "success"
        }
        
        print(f"Criando documento de teste: {test_doc_id}")
        db.collection(test_collection).document(test_doc_id).set(test_data)
        print("Documento criado com sucesso!")
        
        # Teste 2: Ler o documento
        print("Lendo documento de teste...")
        doc = db.collection(test_collection).document(test_doc_id).get()
        
        if doc.exists:
            data = doc.to_dict()
            print(f"Documento lido: {data['message']}")
        else:
            print("Documento não encontrado")
            return False
        
        # Teste 3: Atualizar o documento
        print("Atualizando documento...")
        db.collection(test_collection).document(test_doc_id).update({
            "status": "updated",
            "updated_at": datetime.utcnow()
        })
        print("Documento atualizado com sucesso!")
        
        # Teste 4: Verificar atualização
        updated_doc = db.collection(test_collection).document(test_doc_id).get()
        if updated_doc.exists:
            updated_data = updated_doc.to_dict()
            if updated_data.get("status") == "updated":
                print("Atualização verificada!")
            else:
                print("Atualização não aplicada")
                return False
        
        # Teste 5: Deletar o documento
        print("Deletando documento de teste...")
        db.collection(test_collection).document(test_doc_id).delete()
        print("Documento deletado com sucesso!")
        
        # Teste 6: Verificar deleção
        deleted_doc = db.collection(test_collection).document(test_doc_id).get()
        if not deleted_doc.exists:
            print("Deleçao verificada!")
        else:
            print("Documento ainda existe")
            return False
        
        return True
        
    except Exception as e:
        print(f"Erro nas operaçoes: {e}")
        return False


def test_collections_structure():
    print("\nTestando estrutura das coleçoes...")
    
    try:
        db = get_db()
        if not db:
            return False
        
        # Listar coleções existentes
        collections = db.collections()
        collection_names = [col.id for col in collections]
        
        print(f"Coleções existentes: {collection_names}")
        
        # Verificar se conseguimos acessar as coleções principais
        main_collections = ["users", "properties", "listings"]
        
        for collection_name in main_collections:
            try:
                collection_ref = db.collection(collection_name)
                # Tentar obter uma amostra (máximo 1 documento)
                docs = list(collection_ref.limit(1).stream())
                count = len(docs)
                print(f"Coleçao '{collection_name}': acessivel (documentos encontrados: {count})")
            except Exception as e:
                print(f"Coleçao '{collection_name}': erro ao acessar - {e}")
        
        return True
        
    except Exception as e:
        print(f"Erro ao testar estrutura: {e}")
        return False


def main():
    print("TESTE DE CONEXÃO FIREBASE FIRESTORE")
    print("=" * 50)
    
    # Teste 1: Conexão básica
    if not test_firebase_connection():
        print("Falha na conexão básica - interrompendo testes")
        return
    
    # Teste 2: Operações CRUD
    if not test_database_operations():
        print("Falha nas operações - mas conexão está OK")
    
    # Teste 3: Estrutura das coleções
    if not test_collections_structure():
        print("Falha ao verificar estrutura")
    
    print("\n" + "=" * 50)
    print("TESTES CONCLUÍDOS!")
    print("Se todos os testes passaram, o banco está bom pra usar")


if __name__ == "__main__":
    main()