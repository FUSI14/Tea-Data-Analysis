// pages/buy/buy.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    classifyItem: [
      { classifyId: 1, classifyName: "柠檬茶" },
      { classifyId: 2, classifyName: "奶茶" },
      { classifyId: 3, classifyName: "纯茶" }
    ],
    selectedId: 1,
    teaItem: [
      {
        teaId: 1,
        teaName: "棒打柠檬茶",
        classifyId: 1,
        teaImage: null,
        fixedAddons: "柠檬",
        teaBase: "绿茶"
      },
      {
        teaId: 2,
        teaName: "红豆奶茶",
        classifyId: 2,
        teaImage: null,
        fixedAddons: "红豆",
        teaBase: "红茶"
      },
      {
        teaId: 3,
        teaName: "姜汁撞奶",
        classifyId: 2,
        teaImage: null,
        fixedAddons: "",
        teaBase: "无"
      },
      {
        teaId: 4,
        teaName: "乌龙茶",
        classifyId: 3,
        teaImage: null,
        fixedAddons: "无",
        teaBase: "乌龙茶"
      }
    ],
    // 弹窗控制与规格选项
    showPopup: false,
    selectedTeaData: {},
    selectedTeaId: null,
    temperatures: ['热', '常温', '去冰'],
    sweetnessLevels: ['全糖','五分糖','三分糖','无糖' ],
    selectedToppings: [],
    selectedTemperature: '热',
    selectedSweetness: '全糖',
    // 可选小料
    toppings: [
      { toppingName: '珍珠', checked: false },
      { toppingName: '椰果', checked: false },
      { toppingName: '红豆', checked: false },
      { toppingName: '芋圆', checked: false }
    ],
    // 购物车信息
    cartList: [], // 购物车商品项
    showCartPopup: false, // 控制购物车弹窗
    totalPrice: 0,
    // 订单确认
    ifSubmitOrder: false,
  },

  // 显示弹窗
  showSpecPopup(e) {
    const teadata = e.currentTarget.dataset.tea;
    // console.log(teadata)
    const resetToppings = this.data.toppings.map(item => ({ ...item, checked: false }));
    this.setData({
      showPopup: true,
      selectedTeaData: teadata,
      selectedTeaId: teadata.teaId,
      selectedTemperature: '热',
      selectedSweetness: '全糖',
      selectedToppings: [],
      toppings: resetToppings
    });
  },

  // 关闭弹窗
  closeSpecPopup() {
    this.setData({
      showPopup: false
    });
  },
  handleClose() {
    const resetToppings = this.data.toppings.map(item => ({
      ...item,
      checked: false
    }));

    this.setData({
      showPopup: false,
      selectedTeaData: {},
      selectedTemperature: '热',
      selectedSweetness: '全糖',
      selectedToppings: [],
      toppings: resetToppings
    });

  },


  // 阻止弹窗内部点击冒泡关闭
  stopTap() { },

  // 温度选择
  onTemperatureChange(e) {
    this.setData({
      selectedTemperature: e.detail.value
    });
  },

  // 糖度选择
  onSweetnessChange(e) {
    this.setData({
      selectedSweetness: e.detail.value
    });
  },

  // 小料选择
  onToppingsChange(e) {
    const selected = e.detail.value;
    // console.log(selected)
    const updatedToppings = this.data.toppings.map(item => {
      return {
        ...item,
        checked: selected.includes(item.toppingName)
      }
    });
    this.setData({
      selectedToppings: selected,
      toppings: updatedToppings
    });
  },


  // 判断某小料是否被选中
  isToppingSelected(name) {
    return this.data.selectedToppings.includes(name);
  },


  // 点击确定
  confirmSpec() {
    const {
      selectedTeaId,
      selectedTeaData,
      selectedTemperature,
      selectedSweetness,
      selectedToppings,
      cartList,
      toppings
    } = this.data;

    // 获取茶饮基础价格
    const teaPrice = selectedTeaData.price || 0;

    // 获取选中小料的价格总和
    const selectedToppingPrices = toppings
      .filter(t => selectedToppings.includes(t.toppingName))
      .reduce((sum, item) => sum + (item.toppingPrice || 0), 0);

    const finalPrice = (teaPrice + selectedToppingPrices).toFixed(2); // 保留两位小数

    const newItem = {
      id: new Date().getTime(), // 简单生成唯一 id
      teaName: selectedTeaData.teaName,
      teaImage: selectedTeaData.teaImage,
      temperature: selectedTemperature,
      sweetness: selectedSweetness,
      toppings: selectedToppings.join(", "),
      finalPrice: finalPrice
    };

    this.setData({
      cartList: cartList.concat(newItem),
      showPopup: false
    });
    this.calculateTotalPrice();
  },
  // 计算总价
  calculateTotalPrice() {
    const total = this.data.cartList.reduce((sum, item) => {
      return sum + Number(item.finalPrice || 0);
    }, 0);

    this.setData({
      totalPrice: total.toFixed(2)  // 保留两位小数
    });
  },


  // 弹出购物车
  toggleCartPopup() {
    this.setData({
      showCartPopup: !this.data.showCartPopup
    });
  },

  // 移除购物车中商品
  removeCartItem(e) {
    const id = e.currentTarget.dataset.id;
    const newList = this.data.cartList.filter(item => item.id !== id);
    this.setData({
      cartList: newList
    });
    this.calculateTotalPrice();
  },
  // 订单确认弹出框
  setIfSubmitOrder() {
    this.setData({
      ifSubmitOrder: true
    });
  },
  cancelIfSubmitOrder() {
    this.setData({
      ifSubmitOrder: false
    });
  },
  submitOrder() {
    const { cartList, totalPrice } = this.data;

    if (cartList.length === 0) {
      wx.showToast({
        title: '购物车为空',
        icon: 'none'
      });
      return;
    }

    const app = getApp();
    const openID = app.globalData.openID;
    const server = app.globalData.server;
    const postData = {
      openID: openID,
      totalPrice: Number(totalPrice),
      items: cartList
    };
    console.log('提交订单的数据：', postData);
    wx.request({
      url: `${server}/order/add`,
      method: 'POST',
      data: {
        openID: openID,
        totalPrice: Number(totalPrice),
        items: cartList
      },
      success: (res) => {
        if (res.statusCode === 200) {
          wx.showToast({
            title: '订单提交成功',
            icon: 'success'
          });

          // 清空购物车
          this.setData({
            cartList: [],
            totalPrice: '0.00',
            ifSubmitOrder: false,
            showCartPopup: false
          });
        } else {
          wx.showToast({
            title: '提交失败',
            icon: 'error'
          });
        }
      },
      fail: (err) => {
        // console.log(data)
        console.error('提交失败', err);
        wx.showToast({
          title: '网络错误',
          icon: 'error'
        });
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    var that = this;
    const app = getApp();
    const server = app.globalData.server;
    const openID = app.globalData.openID;
    // console.log(openID)
    // 获取分类信息
    wx.request({
      url: server + "/classify/get",
      method: "GET",
      success(res) {
        var data = res.data;
        // console.log(data);
        that.setData({
          classifyItem: data
        })
      }
    })
    // 获取茶饮信息
    wx.request({
      url: server + "/tea/get",
      method: "GET",
      success(res) {
        var data = res.data;
        // console.log(res.data)
        that.setData({
          teaItem: data
        })
      }
    })
    // 获取小料信息
    wx.request({
      url: server + "/toppings/get",
      method: "GET",
      success(res) {
        var data = res.data;
        // console.log(res.data)
        that.setData({
          toppings: data
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  //更换分类
  switchClassify: function (e) {
    const classifyId = e.currentTarget.dataset.classifyid;
    // console.log(e.currentTarget.dataset);
    this.setData({
      selectedId: classifyId
    })
  }
})