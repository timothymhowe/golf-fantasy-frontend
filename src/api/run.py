from dotenv import load_dotenv
import os

# Debug environment loading
print("Current working directory:", os.getcwd())
print("Loading environment variables...")
load_dotenv()
print("Environment loaded. FIREBASE_ADMIN_SDK_KEY exists:", bool(os.getenv('FIREBASE_ADMIN_SDK_KEY')))

from app import create_app

# Create the application instance
app = create_app()

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8000)