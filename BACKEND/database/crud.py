from sqlalchemy.orm import Session
from .models import Classify,Tea,Toppings
from .schemas import ClassifyCreate,TeaCreate,ToppingsCreate,TeaUpdate,ToppingsUpdate,ClassifyUpdate

# 分类
# 创建新分类信息
def create_classify(db: Session, classify: ClassifyCreate):
    db_classify = Classify(**classify.dict())
    db.add(db_classify)
    db.commit()
    db.refresh(db_classify)
    return db_classify

# 获取所有分类信息
def get_all_classify(db: Session):
    return db.query(Classify).all()

# 根据分类信息查询分类名称
def get_classify_by_id(db: Session, classify_id: int):
    return db.query(Classify.classifyName).filter(Classify.classifyId == classify_id).first()

# 删除一条分类记录
def delete_classify_by_id(db:Session,classify_id:int):
    classify = db.query(Classify).filter(Classify.classifyId == classify_id).first()
    if classify is None:
        return None
    db.delete(classify)
    db.commit()
    return classify

# 修改一条分类记录
def update_classify_by_id(db: Session, classify_id: int, classify_data: ClassifyUpdate):
    db_classify = db.query(Classify).filter(Classify.classifyId == classify_id).first()
    if db_classify is None:
        return None
    # 更新字段
    for key, value in classify_data.dict().items():
        setattr(db_classify, key, value)
    db.commit()
    db.refresh(db_classify)
    return db_classify

# 茶饮
# 创建新茶饮信息
def create_tea(db:Session, tea:TeaCreate):
    db_tea = Tea(**tea.dict())
    db.add(db_tea)
    db.commit()
    db.refresh(db_tea)
    return db_tea

# 获取所有茶饮信息
def get_all_tea(db:Session):
    return db.query(Tea).all()

# 删除一条茶饮记录
def delete_tea_by_id(db:Session,tea_id:int):
    tea = db.query(Tea).filter(Tea.teaId == tea_id).first()
    if tea is None:
        return None
    db.delete(tea)
    db.commit()
    return tea

# 修改一条茶饮记录
def update_tea_by_id(db: Session, tea_id: int, tea_data: TeaUpdate):
    """
    根据 teaId 更新一条茶饮记录
    """
    db_tea = db.query(Tea).filter(Tea.teaId == tea_id).first()
    if db_tea is None:
        return None

    # 更新字段
    for key, value in tea_data.dict().items():
        setattr(db_tea, key, value)

    db.commit()
    db.refresh(db_tea)
    return db_tea

# 小料
# 获取所有小料信息
def get_all_topping(db:Session):
    return db.query(Toppings).all()
# 创建小料信息
def create_topping(db:Session, toppings:ToppingsCreate):
    db_toppings = Toppings(**toppings.dict())
    db.add(db_toppings)
    db.commit()
    db.refresh(db_toppings)
    return db_toppings

# 删除一条小料记录
def delete_topping_by_id(db:Session,topping_id:int):
    topping = db.query(Toppings).filter(Toppings.toppingId == topping_id).first()
    if topping is None:
        return None
    db.delete(topping)
    db.commit()
    return topping

# 修改一条小料记录
def update_topping_by_id(db: Session, topping_id: int, topping_data: ToppingsUpdate):
    db_topping = db.query(Toppings).filter(Toppings.toppingId == topping_id).first()
    if db_topping is None:
        return None

    # 更新字段
    for key, value in topping_data.dict().items():
        setattr(db_topping, key, value)

    db.commit()
    db.refresh(db_topping)
    return db_topping