from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.database import Base, engine
from app.routers import auth as auth_router
from app.routers import profiles as profiles_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Profile Service",
    description="Manages user accounts, authentication, and fitness profiles for FitAI.",
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(auth_router.router)
app.include_router(profiles_router.router)


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "works"}
