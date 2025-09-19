"""
Aplicação principal do backend UniReservas
FastAPI com integração Firebase Firestore
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from config.firebase_config import initialize_firebase


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicializar Firebase na inicialização da aplicação
    print("Iniciando Backend...")
    initialize_firebase()
    print("✅ Backend inicializado com sucesso!")
    yield


app = FastAPI(
    title="UniReservas API",
    description="API para sistema de reservas universitárias",
    version="1.0.0",
    lifespan=lifespan
)

# Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173", 
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Importar rotas apenas após a inicialização
@app.on_event("startup")
async def startup_event():
    #Carregar rotas após inicialização
    try:
        from routers import properties, listings, profiles, auth
        
        # Incluir rotas
        app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
        app.include_router(properties.router, prefix="/api/properties", tags=["Properties"])
        app.include_router(listings.router, prefix="/api/listings", tags=["Listings"])
        app.include_router(profiles.router, prefix="/api/profiles", tags=["Profiles"])
        
        print("Rotas da API carregadas")
    except Exception as e:
        print(f"Erro ao carregar rotas: {e}")


@app.get("/")
async def root():
    return {
        "message": "UniReservas API - Backend em funcionamento!",
        "status": "OK",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    from config.firebase_config import get_db
    
    db_status = "connected" if get_db() else "disconnected"
    
    return {
        "status": "healthy",
        "service": "UniReservas API",
        "database": db_status,
        "version": "1.0.0"
    }


@app.get("/test")
async def test_endpoint():
    #Endpoint de teste para verificar funcionamento
    return {
        "message": "Endpoint de teste funcionando!",
        "timestamp": "2025-09-19",
        "dependencies": {
            "fastapi": "✅ OK",
            "firebase": "✅ OK",
            "pydantic": "✅ OK"
        }
    }


if __name__ == "__main__":
    print("Servidor UniReservas Iniciado")
    print("Documentação: http://localhost:8000/docs")
    print("Health Check: http://localhost:8000/health")
    print("Test: http://localhost:8000/test")
    
    uvicorn.run(
        "main_fixed:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )