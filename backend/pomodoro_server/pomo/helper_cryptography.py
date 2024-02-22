"""
Helper module for cryptographic operations.
"""

import logging
import os

from cryptography.fernet import Fernet

LOGGER = logging.getLogger(name="cryptography")

try:
    FERNET_KEY = str.encode(os.getenv(key="FERNET_KEY"))
    assert len(FERNET_KEY) > 0
except (TypeError, AssertionError) as e:
    MSG = f"Unable to locate the FERNET_KEY in the environment variables. {e}"
    LOGGER.error(MSG)
    raise e


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
