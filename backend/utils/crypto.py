import hashlib
from blacksheep.server.dataprotection import get_serializer
from essentials.exceptions import UnauthorizedException
import jwt


def decrypt(token: str, secret_key, algorithms: list = ['HS256']):
    try:
        ret = jwt.decode(token, secret_key, algorithms=algorithms)
        return ret
    except jwt.exceptions.ExpiredSignatureError as err:
        return str(err)


def encrypt(payload: dict, secret_key, algorithms: list = 'HS256'):
    token = jwt.encode(payload, key=secret_key, algorithm=algorithms)
    return token


def password_encrypt(plaintext):
    sha256_hash = hashlib.sha256()
    sha256_hash.update(plaintext.encode('utf-8'))
    return sha256_hash.hexdigest()[20:]


secret_serializer = get_serializer("test", purpose="pages")


def serializer_decrypt(s: str):
    try:
        return secret_serializer.loads(s)
    except:
        raise UnauthorizedException()
