from fastapi import FastAPI
# 静态文件引入
from fastapi.staticfiles import StaticFiles
# 跨域问题
from fastapi.middleware.cors import CORSMiddleware

# web服务器
import uvicorn

# 导入子文件
from api.classify import api_classify
from api.tea import api_tea
from api.upload import api_upload
from api.topping import api_toppings
from api.login import api_login
from api.order import api_order
from api.analysis import api_analysis

app = FastAPI()

# 跨域问题
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React 前端运行地址
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有方法，如 GET/POST/DELETE
    allow_headers=["*"],  # 允许所有请求头
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.include_router(api_classify,prefix="/classify",tags=["茶饮分类"])
app.include_router(api_tea,prefix="/tea",tags=["茶饮"])
app.include_router(api_upload,prefix="/upload",tags=["图片上传"])
app.include_router(api_toppings,prefix="/toppings",tags=["小料"])
app.include_router(api_login,prefix="/login",tags=["微信用户登录"])
app.include_router(api_order,prefix="/order",tags=["接收订单"])
app.include_router(api_analysis,prefix="/analysis",tags=["数据分析"])

@app.get('/')
async def root():
    return {"message":"hello world"}

@app.get('/hello')
async def rdon():
    return {"message":"I don't want to hello world"}


# 主文件负责接分发路由
if __name__ == '__main__':
    uvicorn.run("app:app",host="127.0.0.1",port=8090,reload=True)