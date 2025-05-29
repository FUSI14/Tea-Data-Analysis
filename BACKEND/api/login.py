from fastapi import APIRouter, HTTPException, Query
import httpx
import os

api_login = APIRouter()
# 你的微信小程序的 AppID 和 AppSecret
WECHAT_APPID = "wxa5facccc4c6d3180"
WECHAT_SECRET = "4a46124fd0d39412e49f84e127d1f92c"

@api_login.get("/")
async def wx_login(code: str = Query(..., description="微信登录临时凭证code")):
    """
    接收微信前端传来的 code，换取 openid 和 session_key
    """
    url = (
        f"https://api.weixin.qq.com/sns/jscode2session"
        f"?appid={WECHAT_APPID}&secret={WECHAT_SECRET}"
        f"&js_code={code}&grant_type=authorization_code"
    )

    async with httpx.AsyncClient() as client:
        resp = await client.get(url)
        data = resp.json()

    if "errcode" in data and data["errcode"] != 0:
        raise HTTPException(status_code=400, detail=f"微信登录失败: {data}")

    openid = data.get("openid")
    session_key = data.get("session_key")

    # 你可以在这里保存 openid 到数据库，或生成你自己的 token
    return {
        "openid": openid,
        "session_key": session_key,
        "msg": "登录成功"
    }