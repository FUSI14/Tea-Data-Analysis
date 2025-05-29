# 请求模型验证
from pydantic import BaseModel
from decimal import Decimal
from typing import List

class ClassifyCreate(BaseModel):
    # classifyId: int  # 如果数据库是自增ID，可以不写这一行
    classifyName: str

class TeaCreate(BaseModel):
    # teaId: int  # 如果数据库是自增ID，可以不写这一行
    teaName: str
    classifyId:int
    fixedAddons:str
    teaImage:str
    teaBase:str
    price:Decimal

# 茶饮更新模型
class TeaUpdate(BaseModel):
    teaName: str
    fixedAddons: str
    teaImage: str
    teaBase: str
    price: Decimal  # 使用 Decimal 保证金额精度

class ToppingsCreate(BaseModel):
    # classifyId: int  # 如果数据库是自增ID，可以不写这一行
    toppingName: str
    toppingPrice: Decimal

# 小料更新模型
class ToppingsUpdate(BaseModel):
    toppingName: str
    toppingPrice: Decimal

# 分类更新模型
class ClassifyUpdate(BaseModel):
    classifyName: str

# 订单茶饮表
class OrderItem(BaseModel):
    teaName: str
    temperature: str
    sweetness: str
    toppings: str  # "红豆, 芋圆"
    finalPrice: Decimal

# 订单表
class OrderCreate(BaseModel):
    openID: str
    totalPrice: Decimal
    items: List[OrderItem]