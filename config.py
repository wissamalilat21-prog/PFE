import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

DATABASE_PATH = os.path.join(BASE_DIR, 'medical.db')

SECRET_KEY = 'mediscan-secret-2024-change-in-production'

DEBUG = True

HOST = '0.0.0.0'
PORT = 5000
