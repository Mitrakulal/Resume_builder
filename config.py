"""
Configuration for model tier settings.
Handles local/cloud endpoints and model names.
"""

import os
from dotenv import load_dotenv

load_dotenv()

# Model configuration
MODEL_TIER = os.getenv("MODEL_TIER", "local")  # Options: "local", "cloud"
MODEL_NAME = os.getenv("MODEL_NAME", "gpt-4")

# Endpoint configuration
LOCAL_ENDPOINT = os.getenv("LOCAL_ENDPOINT", "http://localhost:8000")
CLOUD_ENDPOINT = os.getenv("CLOUD_ENDPOINT", "https://api.openai.com/v1")

# Other configuration options can be added here
