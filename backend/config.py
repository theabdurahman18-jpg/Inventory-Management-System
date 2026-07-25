import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'inventory_mgmt_super_secret_key_2026')
    FIREBASE_CREDENTIALS_PATH = os.environ.get('FIREBASE_CREDENTIALS_PATH', 'serviceAccountKey.json')
    DEBUG = os.environ.get('FLASK_DEBUG', 'True').lower() in ['true', '1', 't']
    PORT = int(os.environ.get('PORT', 5000))
