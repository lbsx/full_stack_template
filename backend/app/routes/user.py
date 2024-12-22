from blacksheep import FromHeader, FromJSON, FromQuery, delete, get, post, bad_request, status_code, file, auth, Request
from guardpost import Identity
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.data_type import ApiResponse, CreateUser, PaginationData, SearchParams, UpdateUser
from utils import password_encrypt, parse_query_params

from data.dbmodel import User
from app.auth import Role


class AcceptLanguage(FromHeader[str]):
    name = "accept-language"


@post("/api/user")
async def create_user(data: FromJSON[CreateUser], session: AsyncSession):
    data: CreateUser = data.value
    data.password = password_encrypt(data.password)
    async with session:
        result = await session.execute(select(User).filter_by(username=data.username))
        if result.scalar():
            return ApiResponse(1, 'username is already in use')
        session.add(User(**data.model_dump()))
        await session.commit()
    return ApiResponse(0, 'success')


@auth(Role.user)
@post("/api/user/{userid}")
async def update_user(userid: int, data: FromJSON[UpdateUser], session: AsyncSession, user: Identity):
    login_user = user.claims
    if Role.admin.value & login_user.get('role', 0) == 0 and userid != login_user.get('id', 0):
        return ApiResponse(1, 'permission denied')
    data: UpdateUser = data.value
    async with session:
        result = await session.execute(select(User).filter_by(id=userid))
        user = result.scalar()
        if not user:
            return ApiResponse(1, 'user not exist')
        for attr in ['username', 'phone', 'email', 'status', 'role']:
            setattr(user, attr, getattr(data, attr))
        session.add(user)
        await session.commit()
    return ApiResponse(0, 'success')


@auth(Role.admin)
@delete("/api/user/{userid}")
async def delete_user(userid: int, session: AsyncSession):
    async with session:
        result = await session.execute(select(User).filter_by(id=userid))
        user = result.scalar()
        if user:
            await session.delete(user)
            await session.commit()
        else:
            return ApiResponse(1, 'user not exist')
    return ApiResponse(0, 'success')


@auth(Role.admin)
@get("/api/users")
async def get_users(session: AsyncSession, req: Request):
    search_params = SearchParams(parse_query_params(req.query))
    page = search_params.page
    page_size = search_params.pageSize
    data = PaginationData()
    data.page = page
    data.page_size = page_size
    async with session:

        query = select(User)
        if search_params.filters:
            role = search_params.filters.role
            if role:
                query = query.where(User.role.in_(role))
            status = search_params.filters.status
            if status:
                query = query.where(User.status.in_(status))
        if search_params.sortField:
            order = getattr(User, search_params.sortField)
            if search_params.sortOrder == "descend":
                order = desc(order)
            query = query.order_by(order)
        total_query = select(func.count("*")).select_from(query.subquery())
        data.total = await session.scalar(total_query)
        result = await session.execute(query.offset((page - 1) * page_size).limit(page_size))
        users = list()
        for user in result.scalars().all():
            users.append(user.detail())
        data.data = users

    return ApiResponse(code=0, message="success", data=data.model_dump())
