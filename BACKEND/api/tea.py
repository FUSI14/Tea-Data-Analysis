from fastapi import APIRouter, Depends,HTTPException
from sqlalchemy.orm import Session
from database.database import SessionLocal, engine
from database import models
from database import crud, schemas

models.Base.metadata.create_all(bind=engine)

api_tea = APIRouter()

# 获取 DB 会话
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 获取所有茶饮
@api_tea.get("/get")
async def read_tea(db:Session=Depends(get_db)):
    return crud.get_all_tea(db)

# 新建茶饮
@api_tea.post("/add")
def add_tea(tea:schemas.TeaCreate,db:Session=Depends(get_db)):
    return crud.create_tea(db,tea)

# 删除茶饮
@api_tea.delete("/{tea_id}")
def del_tea(tea_id:int,db:Session = Depends(get_db)):
    deleted = crud.delete_tea_by_id(db,tea_id)
    if deleted is None:
        raise HTTPException(status_code=404,detail="未找到对应茶饮")
    return {"message":f"茶饮ID{tea_id}删除成功"}

# 修改茶饮
@api_tea.put("/{tea_id}")
def update_tea(tea_id: int, tea: schemas.TeaUpdate, db: Session = Depends(get_db)):
    updated = crud.update_tea_by_id(db, tea_id, tea)
    if updated is None:
        raise HTTPException(status_code=404, detail="茶饮记录不存在")
    return {"message": "更新成功", "data": updated}

