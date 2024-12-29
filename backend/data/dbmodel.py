from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.orm import registry  # type: ignore
from sqlalchemy.sql import expression, func

mapper_registry = registry()
metadata = mapper_registry.metadata

Base = mapper_registry.generate_base()


class UTCNow(expression.FunctionElement):
    type = DateTime()  # type: ignore


@compiles(UTCNow, "postgresql")
def pg_utcnow(element, compiler, **kw):
    return "TIMEZONE('utc', CURRENT_TIMESTAMP)"


@compiles(UTCNow, "sqlite")
def sqlite_utcnow(element, compiler, **kw):
    return "CURRENT_TIMESTAMP"


class ETagMixin:
    ACTIVE = 1
    DISABLE = 0
    id = Column(Integer, primary_key=True)
    created_at = Column(DateTime, server_default=UTCNow(), nullable=False)
    updated_at = Column(DateTime, server_default=UTCNow(), nullable=False, onupdate=func.now())
    etag = Column(String(50), server_default=UTCNow(), nullable=False)