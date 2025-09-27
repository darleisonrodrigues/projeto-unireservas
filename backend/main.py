
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
from config.firebase_config import initialize_firebase
from config.settings import settings


# Inicializar Firebase na importação
print("Iniciando Backend...")
initialize_firebase()

# Importar rotas após inicialização do Firebase
from routers import properties, listings, profiles, auth, auth_firebase, rentals, reservations, chat

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Backend inicializado com sucesso!")
    yield


app = FastAPI(
    title="UniReservas API",
    description="API para sistema de reservas universitárias",
    version="1.0.0",
    lifespan=lifespan
)

# Incluir rotas
print("Registrando rotas...")
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication JWT"]) # rota desativada
print("Rota JWT registrada")
app.include_router(auth_firebase.router, prefix="/api/auth-firebase", tags=["Authentication Firebase"])
print("Rota Firebase registrada")
app.include_router(properties.router, prefix="/api/properties", tags=["Properties"])
print("Rota Properties registrada")
app.include_router(listings.router, prefix="/api/listings", tags=["Listings"])
print("Rota Listings registrada")
app.include_router(profiles.router, prefix="/api/profiles", tags=["Profiles"])
print("Rota Profiles registrada")
app.include_router(rentals.router, prefix="/api/rentals", tags=["Rentals"])
print("Rota Rentals registrada")
app.include_router(reservations.router, prefix="/api/reservations", tags=["Reservations"])
print("Rota Reservations registrada")
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
print("Rota Chat registrada")

# Configuração CORS
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:8080",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:8081",
    "http://127.0.0.1:8082",
    "http://127.0.0.1:8083",
    "https://site-unireservas.onrender.com/",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Libera tudo no desenvolvimento
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

@app.get("/debug/firebase")
async def debug_firebase():
    import firebase_admin
    from config.firebase_config import get_firestore_client
    try:
        apps = len(firebase_admin._apps)
        db = get_firestore_client()
        return {
            "firebase_apps": apps,
            "firestore_client": str(type(db)),
            "status": "ok" if db else "error"
        }
    except Exception as e:
        return {"error": str(e), "status": "error"}


if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False
    )