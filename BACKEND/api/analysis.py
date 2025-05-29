from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, join
from database.database import SessionLocal, engine
from database.models import Tea, Toppings, Order, OrderTea, Addon,Base
import pandas as pd
from sklearn.cluster import KMeans
from mlxtend.frequent_patterns import apriori,association_rules
from mlxtend.preprocessing import TransactionEncoder
from collections import defaultdict
import numpy as np

Base.metadata.create_all(bind=engine)

api_analysis = APIRouter()

# 获取 DB 会话
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@api_analysis.get("/summary")
def get_data_summary(db: Session = Depends(get_db)):
    # 1. 热销茶饮排行
    hot_teas = (
        db.query(OrderTea.teaId, Tea.teaName, func.count(OrderTea.teaId).label("count"))
        .join(Tea, Tea.teaId == OrderTea.teaId)
        .group_by(OrderTea.teaId)
        .order_by(func.count(OrderTea.teaId).desc())
        .limit(5)
        .all()
    )

    # 2. 热门小料排行
    hot_toppings = (
        db.query(Addon.toppingId, Toppings.toppingName, func.count(Addon.toppingId).label("count"))
        .join(Toppings, Toppings.toppingId == Addon.toppingId)
        .group_by(Addon.toppingId)
        .order_by(func.count(Addon.toppingId).desc())
        .limit(5)
        .all()
    )

    # 3. 分类销量排行
    classify_sales = (
        db.query(Tea.classifyId, func.count(OrderTea.teaId).label("count"))
        .join(OrderTea, Tea.teaId == OrderTea.teaId)
        .group_by(Tea.classifyId)
        .order_by(func.count(OrderTea.teaId).desc())
        .all()
    )

    # 4. 总销售额
    total_income = db.query(func.sum(Order.totalPrice)).scalar() or 0

    # 5. 不同茶饮基底销量
    tea_base_sales = (
        db.query(Tea.teaBase, func.count(OrderTea.teaId).label("count"))
        .join(OrderTea, Tea.teaId == OrderTea.teaId)
        .group_by(Tea.teaBase)
        .order_by(func.count(OrderTea.teaId).desc())
        .all()
    )

    return {
        "hotTeas": [{"teaId": t.teaId, "teaName": t.teaName, "count": t.count} for t in hot_teas],
        "hotToppings": [{"toppingId": t.toppingId, "toppingName": t.toppingName, "count": t.count} for t in hot_toppings],
        "classifySales": [{"classifyId": c.classifyId, "count": c.count} for c in classify_sales],
        "totalIncome": float(total_income),
        "teaBaseSales": [{"teaBase": b.teaBase, "count": b.count} for b in tea_base_sales]
    }



# ====================== 频繁项集挖掘 ======================
@api_analysis.get("/apriori")
def apriori_analysis(db: Session = Depends(get_db)):
    # 查询所有茶饮名
    order_teas = (
        db.query(OrderTea.orderTeaId, Tea.teaName)
        .join(Tea, Tea.teaId == OrderTea.teaId)
        .all()
    )
    tea_map = {ot.orderTeaId: ot.teaName for ot in order_teas}

    # 查询所有小料名
    addons = (
        db.query(Addon.orderTeaId, Toppings.toppingName)
        .join(Toppings, Toppings.toppingId == Addon.toppingId)
        .all()
    )

    # 构建事务数据：orderTeaId -> [茶饮名, 小料名1, 小料名2]
    transactions = {}
    for orderTeaId, teaName in tea_map.items():
        transactions[orderTeaId] = [teaName]

    for orderTeaId, toppingName in addons:
        if orderTeaId in transactions:
            transactions[orderTeaId].append(toppingName)

    # 转为列表格式
    transaction_list = list(transactions.values())

    # One-hot 编码
    te = TransactionEncoder()
    te_ary = te.fit(transaction_list).transform(transaction_list)
    df = pd.DataFrame(te_ary, columns=te.columns_)

    # Apriori 算法分析
    frequent_itemsets = apriori(df, min_support=0.05, use_colnames=True)
    rules = association_rules(frequent_itemsets, metric="lift", min_threshold=1.0)

    # 防止 JSON 序列化错误（inf、NaN）
    rules.replace([np.inf, -np.inf, np.nan], None, inplace=True)

    # ======== 构造分析总结 ========
    summary = {
        "total_transactions": len(transaction_list),
        "frequent_itemsets_count": len(frequent_itemsets),
        "association_rules_count": len(rules),
    }

    if not rules.empty:
        summary.update({
            "max_support": round(rules["support"].max(), 4),
            "avg_support": round(rules["support"].mean(), 4),
            "max_confidence": round(rules["confidence"].max(), 4),
            "avg_confidence": round(rules["confidence"].mean(), 4),
            "max_lift": round(rules["lift"].max(), 4),
            "avg_lift": round(rules["lift"].mean(), 4),
        })
        description = ""  # 初始化变量
        top_rule = rules.sort_values("lift", ascending=False).iloc[0]
        antecedents = "、".join(top_rule["antecedents"])
        consequents = "、".join(top_rule["consequents"])
        description += (
            f"其中最强的关联规则为：如果顾客选择了「{antecedents}」，那么他们很可能还会选择「{consequents}」，"
            f"该规则的支持度为 {round(top_rule['support'] * 100, 2)}%，"
            f"置信度为 {round(top_rule['confidence'] * 100, 2)}%，提升度达到 {round(top_rule['lift'], 2)}，"
            "说明这是一条非常有价值的推荐关系。"
        )
    else:
        description = "未发现有效的关联规则，可能是因为数据过少或未形成明显的消费搭配。"
    summary["description"] = description
    return {
        "frequent_itemsets": frequent_itemsets.to_dict(orient="records"),
        "association_rules": rules.to_dict(orient="records"),
        "summary": summary
    }



# ====================== 用户聚类分析 ======================
@api_analysis.get("/cluster")
def user_cluster(db: Session = Depends(get_db)):
    # 1. 构建 orderId → userId 映射
    orders = db.query(Order).all()
    order_map = {o.orderId: o.userId for o in orders}

    # 2. 统计每个用户的茶饮数量
    user_data = {}
    order_teas = db.query(OrderTea.orderId).all()
    for order_id, in order_teas:
        if order_id in order_map:
            user = order_map[order_id]
            user_data.setdefault(user, {"tea_count": 0, "topping_count": 0})
            user_data[user]["tea_count"] += 1

    # 3. 统计每个用户的小料数量
    addons = (
        db.query(Addon.orderTeaId, OrderTea.orderId)
        .join(OrderTea, OrderTea.orderTeaId == Addon.orderTeaId)
        .all()
    )
    for _, order_id in addons:
        if order_id in order_map:
            user = order_map[order_id]
            user_data.setdefault(user, {"tea_count": 0, "topping_count": 0})
            user_data[user]["topping_count"] += 1

    # 4. 构建 DataFrame
    df = pd.DataFrame.from_dict(user_data, orient="index")
    if len(df) < 3:
        return {"error": "用户数量不足，无法聚类"}

    # 5. 聚类
    kmeans = KMeans(n_clusters=3, random_state=42)
    df["cluster"] = kmeans.fit_predict(df)

    # 将聚类结果转换为 JSON 可序列化格式，并增加中文自然语言总结
    results = []
    cluster_summary = {0: [], 1: [], 2: []}

    for user_id, row in df.iterrows():
        cluster_id = int(row["cluster"])  # 转为原生 Python int
        tea_count = int(row["tea_count"])
        topping_count = int(row["topping_count"])
        cluster_summary[cluster_id].append((tea_count, topping_count))

        results.append({
            "user_id": user_id,
            "tea_count": tea_count,
            "topping_count": topping_count,
            "cluster": cluster_id
        })

    # 生成中文总结
    summaries = []
    for cluster_id, users in cluster_summary.items():
        total_users = len(users)
        if total_users == 0:
            continue
        avg_tea = sum(x[0] for x in users) / total_users
        avg_topping = sum(x[1] for x in users) / total_users
        summaries.append(f"第 {cluster_id + 1} 类用户：平均购买茶饮 {avg_tea:.1f} 杯，平均添加小料 {avg_topping:.1f} 次，共 {total_users} 人。")

    # 最终返回结构
    return {
        "data": results,
        "summary": summaries
    }
