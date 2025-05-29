// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    const server = this.globalData.server;
    console.log(server)
    // 登录
    wx.login({
      success(res) {
        if (res.code) {
          wx.request({
            url: server+'/login/',
            method: 'GET',
            data: { code: res.code },
            success: function (resp) {
              // console.log("登录成功", resp.data)
              // 可保存 openid 到全局或本地
              wx.setStorageSync('openid', resp.data.openid)
              getApp().globalData.openID = resp.data.openid
            }
          })
        }
      }
    })
    
  },
  globalData: {
    userInfo: null,
    server:"http://127.0.0.1:8090",
    // server:"http://tea.voyabot.xyz",
    openID:""
  }
})
