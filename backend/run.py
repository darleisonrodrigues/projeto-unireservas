"""
Script para executar o servidor UniReservas
"""

import uvicorn

if __name__ == "__main__":
    print("Iniciando servidor UniReservas...")
    print("Documentação: http://localhost:8000/docs")
    print("Health Check: http://localhost:8000/health")
    print("-" * 50)
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )