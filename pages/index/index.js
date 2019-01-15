//index.js
//获取应用实例
const app = getApp()
import Watch from '../../utils/watch';
var watch;
Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    bgColors: ['white', 'primary', 'secondary', 'success', 'info', 'warning', 'danger', 'light', 'dark', 'white']
  },
  show(){
    this.setData({
      show: !this.data.show
    })
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  watch: {
    setNavigationStyle: function(val, oVal){
      console.log(val, '-----', oVal);
    }
  },
  onLoad: function () {
    watch = new Watch(this);
    app.util.setNavTitle({
      title: 'HOME',
      bgColor: '#3cd',
      color: '#fff'
    });
    setTimeout(() => {
      this.setData({
        title: 'HOME2',
        bgColor: '#3cd',
        color: '#fff'
      })
    }, 2300)

    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
