"""
Script para executar o servidor UniReservas
"""

import uvicorn

if __name__ == "__main__":
    print("Iniciando servidor UniReservas...")
    print("Documentação: https://backend-unireservas.onrender.com/docs")
    print("Health Check: https://backend-unireservas.onrender.com/health")
    print("-" * 50)
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )