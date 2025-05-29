# 建立模型
from sqlalchemy import Column, Integer, String, Numeric
from .database import Base

class Classify(Base):
    __tablename__ = "classify"

    classifyId = Column(Integer, primary_key=True, index=True)
    classifyName = Column(String(100), nullable=False)

class Tea(Base):
    __tablename__="tea"
    teaId = Column(Integer, primary_key=True, index=True)
    teaName = Column(String(100), nullable=False)
    classifyId = Column(Integer, nullable=False)
    fixedAddons = Column(String(100), nullable=False)
    teaImage = Column(String(100), nullable=False)
    teaBase = Column(String(100), nullable=False)
    price = Column(Numeric(10, 2), nullable=False)

class Toppings(Base):
    __tablename__ = "toppings"
    toppingId = Column(Integer, primary_key=True, index=True)
    toppingName = Column(String(100), nullable=False)
    toppingPrice = Column(Numeric(10, 2), nullable=False)

class Order(Base):
    __tablename__ = "order"
    orderId = Column(Integer, primary_key=True, index=True)
    userId = Column(String(100), nullable=False) 
    totalPrice = Column(Numeric(10, 2), nullable=False)

class OrderTea(Base):
    __tablename__ = "ordertea"
    orderTeaId=Column(Integer, primary_key=True, index=True)
    orderId=Column(Integer,nullable=False)
    teaId=Column(Integer,nullable=False)
    temperature=Column(String(100), nullable=False) 
    sugarLevel=Column(String(100), nullable=False) 
    thePrice=Column(Numeric(10, 2), nullable=False)

class Addon(Base):
    __tablename__ = "addon"
    orderTeaId=Column(Integer, primary_key=True, index=True)
    toppingId=Column(Integer,primary_key=True, index=True)