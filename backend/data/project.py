from sqlalchemy import Boolean, Column, Integer, SmallInteger, String
from .dbmodel import ETagMixin, Base


class Project(ETagMixin, Base):
    __tablename__ = "project"

    name = Column(String(50), nullable=False)
    status = Column(Boolean, default=ETagMixin.DISABLE)


class UserProject(ETagMixin, Base):
    __tablename__ = "user_project"

    user_id = Column(Integer, nullable=False)
    project_id = Column(Integer, nullable=False)
