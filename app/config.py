import os
from dotenv import load_dotenv
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
MODEL_VISION = os.getenv("MODEL_VISION","gpt-4o")
MODEL_TEXT = os.getenv("MODEL_TEXT","gpt-4o-mini")
MAX_SLIDES = int(os.getenv("MAX_SLIDES","60"))
TIMEOUT = int(os.getenv("TIMEOUT","120"))
