"""
Configuration for model tier settings.
Handles local/cloud endpoints and model names.
"""

# Model configuration
MODEL_TIER = "local"  # Options: "local", "cloud"
MODEL_NAME = "gpt-4"

# Endpoint configuration
LOCAL_ENDPOINT = "http://localhost:8000"
CLOUD_ENDPOINT = "https://api.openai.com/v1"

# Other configuration options can be added here
