from fastapi import APIRouter, Depends ,HTTPException
from sqlalchemy.orm import Session
from database.database import SessionLocal, engine
from database import models
from database import crud, schemas

models.Base.metadata.create_all(bind=engine)

api_classify = APIRouter()

# 获取 DB 会话
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 获取所有分类
@api_classify.get("/get")
def read_classify(db: Session = Depends(get_db)):
    return crud.get_all_classify(db)

# 添加分类
@api_classify.post("/add")
def add_classify(classify: schemas.ClassifyCreate, db: Session = Depends(get_db)):
    return crud.create_classify(db, classify)

# 根据分类编号查询分类
@api_classify.get("/id_filter/{classify_id}", response_model=schemas.ClassifyCreate)
def read_classify_name(classify_id: int, db: Session = Depends(get_db)):
    classify = crud.get_classify_by_id(db, classify_id)
    if classify is None:
        raise HTTPException(status_code=404, detail="分类不存在")
    return classify

# 删除分类
@api_classify.delete("/{classify_id}")
def del_classify(classify_id:int,db:Session = Depends(get_db)):
    deleted = crud.delete_classify_by_id(db,classify_id)
    if deleted is None:
        raise HTTPException(status_code=404,detail="未找到对应分类")
    return {"message":f"分类ID{classify_id}删除成功"}

# 修改分类
@api_classify.put("/{classify_id}")
def update_classify(classify_id: int, classify: schemas.ClassifyUpdate, db: Session = Depends(get_db)):
    updated = crud.update_classify_by_id(db, classify_id, classify)
    if updated is None:
        raise HTTPException(status_code=404, detail="分类记录不存在")
    return {"message": "更新成功", "data": updated}