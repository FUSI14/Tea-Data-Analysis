from fastapi import APIRouter,File, UploadFile
from fastapi.responses import JSONResponse
import os
from datetime import datetime

api_upload = APIRouter()
# 保存图片的目录
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@api_upload.post("/")
async def upload_image(file: UploadFile = File(...)):
    # 检查是否是图片
    if not file.content_type.startswith("image/"):
        return JSONResponse(status_code=400, content={"message": "只允许上传图片文件"})

    # 生成唯一文件名
    filename = datetime.now().strftime("%Y%m%d%H%M%S") + "_" + file.filename
    file_path = os.path.join(UPLOAD_DIR, filename)

    # 保存文件
    with open(file_path, "wb") as f:
        f.write(await file.read())

    # 构建访问路径（根据你部署服务器修改）
    image_url = f"/{UPLOAD_DIR}/{filename}"

    return {"image_url": image_url}