
import config from './config'
var QQMapWX = require('./qqmap-wx-jssdk.min.js');
var qqmapsdk = new QQMapWX({
  key: config.mapKey
});
class Util {
  /*
  * 默认执行
  */
  constructor() {
    // 配置信息
    this.config = config
    this.globalData = {}
    // 设置导航
    wx.setNavigationBarTitle({
      title: config.title || ''
    })
  }
  /*
  * 后台地址
  * @param {String}
  */
  url(map) {
    // let userInfo = wx.getStorageSync('userInfo')
    // return `${config.url}?suid=${config.suid}&appid=${config.appid}${userInfo ? `&plum_session_applet=${userInfo.plum_session_applet}` : ''}${map ? `&map=${map}` : ''}`
    return `${config.url}?suid=${config.suid}&appid=${config.appid}${config.session ? `&plum_session_applet=${config.session}` : ''}${map ? `&map=${map}` : ''}`
  }
  /*
  * 登录
  * @param {Function}
  */
  getUserInfo(cb = () => { }) {
    wx.login({
      success: res => {
        wx.setStorageSync('userInfo', res)
        wx.request({
          url: this.url('applet_member_info'),
          data: {
            code: res.code,
            slient: 1
          },
          success: e => {
            // console.log(e)
            if (e.data.ec === 200) {
              let data = e.data.data
              wx.setStorageSync('userInfo', data)
              config.session = data.plum_session_applet
              this.getWxInfo(cb, data)
            }
            else {
              this.toast('微信登录失败，请重试')
            }
          }
        })
      },
      fail: err => {
        this.toast('微信登录失败，请重试')
      }
    })
  }
  /*
  * 获取用户信息
  * @param {Function}
  */
  getWxInfo(cb = () => { }, info) {
    // 获取用户信息
    wx.getSetting({
      success: res => {
        const app = getApp()
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: res => {
              if (res.errMsg === 'getUserInfo:ok') {
                info.nickName = res.userInfo.nickName
                info.avatarUrl = res.userInfo.avatarUrl
                info.gender = res.userInfo.gender
                wx.setStorageSync('userInfo', info)
                cb({ userInfo: info, wxInfo: res.userInfo })
              }
              else cb({ userInfo: info })
              app.globalData.userInfo = info
            }
          })
        }
        else {
          cb({ userInfo: info })
          app.globalData.userInfo = info
        }
      }
    })
  }
  /*
  * 后台交互
  * @param {String, Object, Function, Boolean}
  * @param {Object, Function, Boolean}
  * @param {String, Function, Boolean}    // 暂无
  * @param {Object, Boolean}              // 暂无
  */
  request(s, o, f, b = true) {
    // let userInfo = wx.getStorageSync('userInfo')
    if(!config.session){                // 如果每次进入都更新用户信息
    // if (!userInfo) {                    // 有缓存的信息，则不需要更新用户信息
      if (this.temporaryStorageRequestParam) this.temporaryStorageRequestParam.push({ s, o, f, b })
      else {
        this.temporaryStorageRequestParam = [{ s, o, f, b }]
        this.getUserInfo(res => {
          for (let i of this.temporaryStorageRequestParam) {
            this.request(i.s, i.o, i.f, i.b)
          }
        })
      }
      return false
    }
    if (typeof s === 'object') {
      b = typeof f === 'function' || typeof f === 'undefined'
      f = o
      o = s
      s = ''
    }
    if (b) {
      wx.showLoading({
        title: '加载中...'
      })
      wx.showNavigationBarLoading()
    }
    wx.request({
      url: this.url(),
      data: o,
      success(res) {
        if (s) {
          wx.setStorageSync(s, res.data)
          f(res.data)
        }
        else {
          f(res.data)
        }
      },
      fail(err) {
        let data = wx.getStorageSync(s)
        if (s && data) {
          if (typeof data === 'object') data.err = 'request:fail'
          f(data)
        }
      },
      complete(com) {
        if (b) {
          wx.hideLoading()
          wx.hideNavigationBarLoading()
        }
      }
    })
  }
  /*
  * 设置导航title 和 color
  * @param {Object} 
  * Object => {title: 'title', bgColor: '#3cd', color: '#fff', backShow: true}
  */
  setNavTitle(o) {
    if (typeof o === 'string') o = {
      title: o
    }
    wx.setNavigationBarTitle({
      title: o.title
    });
    const pages = getCurrentPages();
    const pageThis = pages[pages.length - 1];
    pageThis.setData({
      setNavigationStyle: o
    })
  }

  /*
  * 提示信息
  * @param {String, Number, String}
  * @param {String, String}
  */
  toast(title = 'Toast', duration = 2000, icon = 'none') {
    if (isNaN(parseInt(duration))) {
      icon = duration
      duration = 2000
    }
    wx.showToast({
      icon: icon,
      title: title,
      duration: duration
    })
  }
  /*
  * 一维数组转化为多维数组
  * @param {Array, Number}
  */
  arrSplice(arr, num = 99) {
    if (!num) console.log('%c arrSplce: num is undefined', 'color: #f00;line-height: 36px;')
    let newArr = []
    // 防止改变原数组
    let copyArr = this.deepCopy(arr)
    while (copyArr.length != 0) {
      newArr.push(copyArr.splice(0, num));
    }
    return newArr;
  }
  /*
  * 深拷贝
  * @param {Object / Array}
  */
  deepCopy(obj) {
    let o = Array.isArray(obj) ? [] : {}
    if (obj && typeof obj === 'object') {
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (obj[key] && typeof obj[key] === 'object')
            o[key] = this.deepCopy(obj[key])
          else
            o[key] = obj[key]
        }
      }
    }
    return o
  }
  /*
  * 多图片上传
  * @param {Object}
  * Object 参数参考 微信API https://developers.weixin.qq.com/miniprogram/dev/api/wx.uploadFile.html
  */
  uploadFile(obj, i = 0, fileUrl = [], err = 0) {
    if (typeof obj.filePath === 'string') obj.filePath = [obj.filePath]
    wx.uploadFile({
      url: obj.url,
      filePath: obj.filePath[i],
      name: obj.name || "image",
      header: obj.header || {},
      formData: obj.formData || {},
      success: res => {
        let resData = res.data
        try {
          resData = JSON.parse(resData)
        }
        catch (err) {
          resData = JSON.parse(resData.substring(1))
        }
        // 判断上传是否成功，根据后台返回的状态判定
        if (resData.ec === 200) {
          i++
          // 后台返回图片路径
          fileUrl.push(resData.data.path)
          if (i === obj.filePath.length) {
            if (obj.success) obj.success({ msg: 'uploadFile:ok', data: fileUrl, statusCode: res.statusCode })
          }
          else {
            this.upImageFile(obj, i, fileUrl)
          }
        }
        else {
          err++
          if (err <= 3) this.upImageFile(obj, i, fileUrl, err)
          else {
            console.log('%c 返回信息：', 'color: #f00; line-height: 36px;', resData)
            console.log('%c 请注意: 请求成功时，后台返回的信息可能与此函数中的配置不一致，注意修改', 'color: blue;line-height: 36px;')
          }
        }
      },
      fail: err => {
        err++
        if (err <= 3) this.upImageFile(obj, i, fileUrl, err)
        else {
          let errObj = { err, i, fileUrl }
          if (obj.fail) obj.fail(errObj)
          console.log('%c uploadFile:fail', 'color: #f00', errObj)
        }
      },
      complete: com => {
        if (obj.complete) obj.complete(com)
      }
    })
  }
  /*
  * 地址逆解析
  * @param {Function, Boolean}
  */
  getPosition(cb = () => { }, b = 1) {
    let position = this.globalData.position
    if (position && b) {
      cb(position)
      return;
    }
    wx.getLocation({
      success: res => {
        qqmapsdk.reverseGeocoder({//根据坐标获取位置详细信息
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          complete: e => {
            let data = {
              lat: res.latitude,
              lng: res.longitude,
            }
            if (e.status === 0) {
              data.result = e.result
              data.status = 0
            }
            this.globalData.position = data
            cb(data)
          }
        })
      },
      fail: err => {
        this.toast('获取位置信息失败')
      }
    })
  }
}

export default new Util()
