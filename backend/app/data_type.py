from dataclasses import dataclass
from typing import Any, Optional
from pydantic import BaseModel
from locales import _


class LoginData(BaseModel):
    username: str
    password: str


class ApiResponse(BaseModel):
    code: int  # 0 正确，1错误
    message: str
    data: Optional[Any] = None

    def __init__(self, code: str, message: str, data: Any = None, **kwargs):
        super().__init__(code=code, message=_(message), data=data, **kwargs)


class PaginationData(BaseModel):
    page: int = 0
    page_size: int = 0
    total: int = 0
    data: list = 0


class CreateUser(BaseModel):
    username: str
    password: str
    email: str
    phone: str


class UpdateUser(BaseModel):
    username: str
    email: str
    phone: str
    id: int
    status: int
    role: int

@dataclass
class FilterFields:
    status: list[int]
    role: list[int]

@dataclass
class SearchParams:
    page: int
    pageSize: int
    filters: Optional[FilterFields]
    sortOrder: Optional[str]
    sortField: Optional[str]
    def __init__(self, d: dict):
        
        self.page = int(d.get('page', 1))
        self.pageSize = int(d.get("pageSize", 10))
        self.sortOrder = d.get("sortOrder")
        self.sortField = d.get("sortField")
        filters = d.get("filters")
        if filters:
            status = filters.get("status")
            if status:
                status = [i == 'true' for i in status]
            role = filters.get("role")
            if role:
                role = [int(i) for i in role]
            filters = FilterFields(status=status, role=role)
        self.filters = filters
