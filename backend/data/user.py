from sqlalchemy import Boolean, Column, DateTime, Integer, SmallInteger, String
from .dbmodel import ETagMixin, Base


class User(ETagMixin, Base):
    __tablename__ = "user"

    username = Column(String(50), nullable=False)
    password = Column(String(20), nullable=False)
    email = Column(String(20), nullable=True)
    phone = Column(String(20), nullable=True)
    status = Column(Boolean, default=ETagMixin.DISABLE)
    # 二进制 1111  admin,specil,user, guest
    role = Column(SmallInteger, default=1)

    def info(self):
        return {'id': self.id, 'username': self.username, 'email': self.email, 'phone': self.phone, 'role': self.role}

    def detail(self):
        data = self.info()
        data['status'] = self.status
        data['id'] = self.id
        return data
