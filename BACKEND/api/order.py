from fastapi import APIRouter, Depends,HTTPException
from sqlalchemy.orm import Session
from database.database import SessionLocal, engine
from database import models
from database import crud, schemas

models.Base.metadata.create_all(bind=engine)

api_order = APIRouter()

# 获取 DB 会话
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@api_order.post("/add")
def order_post(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    print(order.dict())
    new_order = models.Order(userId=order.openID, totalPrice=order.totalPrice)
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    for item in order.items:
        tea = db.query(models.Tea).filter(models.Tea.teaName == item.teaName).first()
        if not tea:
            continue

        order_tea = models.OrderTea(
            orderId=new_order.orderId,
            teaId=tea.teaId,
            temperature=item.temperature,
            sugarLevel=item.sweetness,
            thePrice=item.finalPrice
        )
        db.add(order_tea)
        db.commit()
        db.refresh(order_tea)

        topping_names = [t.strip() for t in item.toppings.split(",") if t.strip()]
        for topping_name in topping_names:
            topping = db.query(models.Toppings).filter(models.Toppings.toppingName == topping_name).first()
            if topping:
                link = models.Addon(
                    toppingId=topping.toppingId,
                    orderTeaId=order_tea.orderTeaId
                )
                db.add(link)

    db.commit()
    return {"message": "下单成功", "orderId": new_order.orderId}


@api_order.get("/user/{user_id}", summary="获取用户所有订单详情")
def get_user_orders(user_id: str, db: Session = Depends(get_db)):
    orders = db.query(models.Order).filter(models.Order.userId == user_id).all()

    if not orders:
        raise HTTPException(status_code=404, detail="无订单记录")

    result = []
    for order in orders:
        order_teas = db.query(models.OrderTea).filter(models.OrderTea.orderId == order.orderId).all()
        tea_items = []
        for ot in order_teas:
            tea = db.query(models.Tea).filter(models.Tea.teaId == ot.teaId).first()
            # 获取小料
            addon_rows = db.query(models.Addon).filter(models.Addon.orderTeaId == ot.orderTeaId).all()
            topping_names = []
            for addon in addon_rows:
                topping = db.query(models.Toppings).filter(models.Toppings.toppingId == addon.toppingId).first()
                if topping:
                    topping_names.append(topping.toppingName)
            tea_items.append({
                "teaName": tea.teaName if tea else "未知茶饮",
                "temperature": ot.temperature,
                "sugarLevel": ot.sugarLevel,
                "thePrice": float(ot.thePrice),
                "toppings": topping_names
            })

        result.append({
            "orderId": order.orderId,
            "totalPrice": float(order.totalPrice),
            "orderTeas": tea_items
        })
    return result    