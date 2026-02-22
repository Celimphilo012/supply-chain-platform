from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import forecast, health

app = FastAPI(
    title='Supply Chain AI Service',
    description='Demand forecasting microservice',
    version='1.0.0'
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:3001', 'http://localhost:3000'],
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(health.router)
app.include_router(forecast.router, prefix='/forecast')
