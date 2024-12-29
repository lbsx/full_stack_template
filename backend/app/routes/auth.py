from typing import Literal, Optional
import jwt
import orjson
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from blacksheep import Content, Cookie, FromJSON, FromText, Response, auth, get, post, Request, json, unauthorized
from guardpost import Identity

from app.config import AUTH_SECRET_KEY
from app.data_type import ApiResponse, LoginData
from data import User
from utils import password_encrypt, secret_serializer
from app.auth import Role


@auth(Role.special)
@get("/api/auth/special")
async def special_auth(user: Identity):
    return ApiResponse(0, 'authenticated')


@auth(Role.user)
@get("/api/auth/user")
async def user_auth(user: Identity):
    return ApiResponse(0, 'authenticated')


@post("/api/login")
async def login(req: FromJSON[LoginData], session: AsyncSession):
    data = req.value
    message = 'query fail'
    async with session:
        result = await session.execute(select(User).filter_by(username=data.username, status=User.ACTIVE))
        user: User = result.scalar()
        if not user:
            message = "user does not exist"
        elif password_encrypt(data.password) != user.password:
            message = "incorrect password"
        else:
            token = jwt.encode(user.info(), AUTH_SECRET_KEY)
            res = ApiResponse(code=0, message='success', data=user.info())
            response = Response(200, content=Content(
                b"application/json", orjson.dumps(res.model_dump())))

            response.set_header(
                b"Authorization", b"Bearer " + token.encode("utf8"))
            response.set_cookie(
                Cookie("token", secret_serializer.dumps(user.info()), path='/', same_site=1))
            return response
    return ApiResponse(code=1, message=message)
