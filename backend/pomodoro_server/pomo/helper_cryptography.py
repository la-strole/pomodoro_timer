"""
Helper module for cryptographic operations
"""

import logging

from cryptography.fernet import Fernet

LOGGER = logging.getLogger(name="cryptography")

# FERNET_KEY: str | None = os.getenv(key="FERNET_KEY")
# TODO remove this in production
FERNET_KEY = Fernet.generate_key()

if not FERNET_KEY:
    message = "Can not find FERNET_KEY in environment variables"
    LOGGER.error(msg=message)
    raise ValueError(message)


def genereate_key() -> bytes:
    """
    Generates a cryptographic key for use in cryptographic operations.
    """
    return Fernet.generate_key()


def encrypt(plaintext: str, key=FERNET_KEY) -> bytes:
    """
    Encrypts the given plaintext using the given cryptographic key.
    """
    fernet = Fernet(key=key)
    token: bytes = fernet.encrypt(data=plaintext.encode(encoding="utf-8"))
    return token


def decrypt(token: bytes, key=FERNET_KEY) -> str:
    """
    Decrypts the given encrypted token using the given cryptographic key.
    """
    fernet = Fernet(key=key)
    plain_text: bytes = fernet.decrypt(token=token)
    result: str = plain_text.decode(encoding="utf-8")
    return result
