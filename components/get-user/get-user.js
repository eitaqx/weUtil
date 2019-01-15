// components/get-user-info/get-user-info.js
const util = getApp().util;
var timer;
/*
  该组件支持属性
  user-info-status        弹窗状态
  refurbish               是否刷新当前页面
  request                 第一次授权后请求的地址
*/
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    userInfoStatus: {
      type: Boolean,
      value: false
    },
    refurbish: {
      type: Boolean,
      value: true
    },
    request: String
  },
  attached() {
    const _this = this;
    this._checkUserInfo();
  },
  pageLifetimes: {
    load(options){
      console.log(options, '-------111')
    },
    show(){
      console.log('--------------')
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    _checkUserInfo() {
      const _this = this;
      wx.getSetting({
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            _this.setData({
              userInfoStatus: false
            });
          }
          else {
            _this.setData({
              userInfoStatus: true
            })
          }

          let pages = getCurrentPages();
          // 获取当前栈
          if (pages.length === 1) util.getUserInfo(e => {
            console.log(e);
            if (e.wxInfo)
              _this.setData({
                userInfoStatus: false
              });
              // 刷新当前栈
            
          })
          // 非必须授权
          else {
            _this.setData({
              userInfoStatus: false
            });
          }
        }
      })
    },
    cancel() {
      this.setData({
        userInfoStatus: false
      })
      // setTimeout(() => {
      //   this.setData({
      //     userInfoStatus: true
      //   })
      // }, 200)
    },
    _updateUserInfo(result) {
      // console.log(result)
      wx.clearStorage();
      if (!result.detail.encryptedData) {
        wx.showToast({
          icon: 'none',
          title: '授权失败，请重新授权!'
        })
        return;
      }
      // 授权后刷新当前栈
      if (_this.data.refurbish) {
        var pages = getCurrentPages();
        var newPages = pages[pages.length - 1];
        if (newPages.data && newPages.data.options) newPages.onLoad(newPages.data.options);
        else newPages.onLoad();
        newPages.onShow();
        newPages.onReady();
      }
      this._checkUserInfo();
    },
    _empty() { }
  }
})
