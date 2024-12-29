from enum import Enum
from typing import Optional, Sequence
from blacksheep import Application
import jwt
from data.user import User
from app.settings import Settings
from blacksheep import Application, Request
from guardpost import AuthenticationHandler, AuthorizationContext, Identity, Policy, Requirement
from utils import get_logger, serializer_decrypt
from .config import AUTH_SECRET_KEY


class Role(Enum):
    admin = 0b1000
    special = 0b100
    user = 0b10
    guest = 0b1


class JWTAuthHandler(AuthenticationHandler):
    async def authenticate(self, context: Request) -> Optional[Identity]:
        authorization_value = context.get_first_header(b"Authorization")
        if authorization_value:
            if authorization_value.startswith(b"Bearer "):
                token = authorization_value[7:].decode()
            else:
                token = authorization_value.decode()
            try:
                ret = jwt.decode(token, AUTH_SECRET_KEY, algorithms='HS256')
            except Exception as err:
                get_logger().debug(f"decode fail:{err}")
            else:
                context.identity = Identity(ret, "JWT Bearer")
        else:
            context.identity = None
        return context.identity


class RoleAuthHandler(AuthenticationHandler):
    async def authenticate(self, context: Request) -> Optional[Identity]:
        token = context.get_cookie("token")
        if token:
            # decrypt token
            user: User = serializer_decrypt(token)
            return Identity(user, "ROLE")
        return context.identity


class RoleRequirement(Requirement):
    """Requires an authenticated user, with any of the required roles."""

    def __init__(self, *sufficient_roles: Sequence[str]) -> None:
        super().__init__()
        self.sufficient_roles = sum([r.value for r in sufficient_roles])

    def _has_role(self, identity) -> bool:
        role = identity.claims.get("role", 0)
        if role >= self.sufficient_roles:
            return True

        return False

    def handle(self, context: AuthorizationContext):
        identity = context.identity
        if identity and identity.is_authenticated() and self._has_role(identity):
            context.succeed(self)


def configure_authentication(app: Application, settings: Settings):
    """
    Configure authentication as desired. For reference:
    https://www.neoteroi.dev/blacksheep/authentication/
    """

    app.use_authentication().add(RoleAuthHandler())
    app.use_authentication().add(JWTAuthHandler())
    authorization = app.use_authorization()

    # enable authorization, and add a policy that requires an authenticated user
    authorization += Policy(Role.user, RoleRequirement(Role.user))
    authorization += Policy(Role.admin, RoleRequirement(Role.admin))
    authorization += Policy(Role.special, RoleRequirement(Role.special))
    # authorization.with_default_policy() # 所有的路由都走这个认证
