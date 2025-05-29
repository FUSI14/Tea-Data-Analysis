from database import models,crud,schemas
from database.database import engine,SessionLocal
from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session

models.Base.metadata.create_all(bind=engine)

api_toppings = APIRouter()

# 获取DB会话
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 获取所有小料
@api_toppings.get("/get")
def read_toppings(db:Session = Depends(get_db)):
    return crud.get_all_topping(db)
# 创建小料信息
@api_toppings.post("/add")
def add_topping(toppings:schemas.ToppingsCreate,db:Session = Depends(get_db)):
    return crud.create_topping(db,toppings)

# 删除小料
@api_toppings.delete("/{topping_id}")
def del_topping(topping_id:int,db:Session = Depends(get_db)):
    deleted = crud.delete_topping_by_id(db,topping_id)
    if deleted is None:
        raise HTTPException(status_code=404,detail="未找到对应小料")
    return {"message":f"小料ID{topping_id}删除成功"}

# 修改小料
@api_toppings.put("/{topping_id}")
def update_topping(topping_id: int, topping: schemas.ToppingsUpdate, db: Session = Depends(get_db)):
    updated = crud.update_topping_by_id(db, topping_id, topping)
    if updated is None:
        raise HTTPException(status_code=404, detail="小料记录不存在")
    return {"message": "更新成功", "data": updated}