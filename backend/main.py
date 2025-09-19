"""
Aplicação principal do backend
FastAPI com integração Firebase Firestore
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from config.firebase_config import initialize_firebase
from config.settings import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicializar Firebase na inicialização da aplicação
    print("Iniciando Backend...")
    initialize_firebase()
    
    # Importar rotas após inicialização do Firebase
    from routers import properties, listings, profiles, auth
    
    # Incluir rotas
    app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
    app.include_router(properties.router, prefix="/api/properties", tags=["Properties"])
    app.include_router(listings.router, prefix="/api/listings", tags=["Listings"])
    app.include_router(profiles.router, prefix="/api/profiles", tags=["Profiles"])
    
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
    allow_origins=settings.get_origins_list(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "UniReservas API - Backend em funcionamento!"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "UniReservas API"}


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )