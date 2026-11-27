import os
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseModel):
    PROJECT_NAME: str = "ClimaGrid Command Operations Platform"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # AWS Bedrock Config
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    BEDROCK_MODEL_ID: str = os.getenv("BEDROCK_MODEL_ID", "anthropic.claude-3-5-sonnet-20240620-v1:0")

    # Center coordinates (Roorkee / Haridwar Ganga Basin)
    MAP_CENTER_LAT: float = 29.8543  # Roorkee
    MAP_CENTER_LNG: float = 77.8880
    
    # AAPDA Explainable Triage Weights
    WEIGHT_HAZARD: float = 0.35
    WEIGHT_MED_URGENCY: float = 0.35
    WEIGHT_VULNERABILITY: float = 0.20
    WEIGHT_TIME_DELAY: float = 0.10

settings = Settings()
