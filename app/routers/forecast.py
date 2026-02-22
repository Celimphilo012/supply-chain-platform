from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import pandas as pd
from prophet import Prophet
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


class HistoricalDataPoint(BaseModel):
    date: str
    quantity: float


class ForecastRequest(BaseModel):
    product_id: str
    historical_data: List[HistoricalDataPoint]
    forecast_days: int = 30
    include_history: bool = False


class ForecastPoint(BaseModel):
    date: str
    predicted_quantity: float
    lower_bound: float
    upper_bound: float


class ForecastResponse(BaseModel):
    product_id: str
    forecast_days: int
    forecasts: List[ForecastPoint]
    model_version: str = "prophet-v1"
    data_points_used: int
    status: str = "success"


@router.post("/", response_model=ForecastResponse)
async def generate_forecast(request: ForecastRequest):
    if len(request.historical_data) < 7:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient data. Need at least 7 data points, got {len(request.historical_data)}"
        )

    try:
        df = pd.DataFrame([
            {"ds": point.date, "y": point.quantity}
            for point in request.historical_data
        ])
        df["ds"] = pd.to_datetime(df["ds"])
        df["y"] = df["y"].clip(lower=0)

        model = Prophet(
            yearly_seasonality=len(df) > 60,
            weekly_seasonality=len(df) > 14,
            daily_seasonality=False,
            interval_width=0.95,
            changepoint_prior_scale=0.05,
        )

        model.fit(df)

        future = model.make_future_dataframe(
            periods=request.forecast_days,
            freq="D",
            include_history=request.include_history
        )
        forecast = model.predict(future)

        if not request.include_history:
            last_date = df["ds"].max()
            forecast = forecast[forecast["ds"] > last_date]

        forecasts = [
            ForecastPoint(
                date=row["ds"].strftime("%Y-%m-%d"),
                predicted_quantity=max(0, round(row["yhat"], 2)),
                lower_bound=max(0, round(row["yhat_lower"], 2)),
                upper_bound=max(0, round(row["yhat_upper"], 2)),
            )
            for _, row in forecast.iterrows()
        ]

        return ForecastResponse(
            product_id=request.product_id,
            forecast_days=request.forecast_days,
            forecasts=forecasts,
            data_points_used=len(df),
        )

    except Exception as e:
        logger.error(f"Forecast failed for product {request.product_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Forecast generation failed: {str(e)}"
        )


@router.post("/batch")
async def batch_forecast(requests: List[ForecastRequest]):
    results = []
    for req in requests:
        try:
            result = await generate_forecast(req)
            results.append(result)
        except HTTPException as e:
            results.append({
                "product_id": req.product_id,
                "status": "failed",
                "error": e.detail
            })
    return {"results": results, "total": len(results)}