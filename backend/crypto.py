import os
from cryptography.fernet import Fernet
from dotenv import load_dotenv

load_dotenv()

# We encode the string to bytes, which Fernet requires
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")
if not ENCRYPTION_KEY:
    raise ValueError("Missing ENCRYPTION_KEY environment variable")

cipher_suite = Fernet(ENCRYPTION_KEY.encode())

def encrypt_token(token: str) -> str | None:
    if not token:
        return None
    # Encrypt the token and decode it back to a string for database storage
    return cipher_suite.encrypt(token.encode()).decode()

def decrypt_token(encrypted_token: str) -> str | None:
    if not encrypted_token:
        return None
    return cipher_suite.decrypt(encrypted_token.encode()).decode()