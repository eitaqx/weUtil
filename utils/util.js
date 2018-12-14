// 用户配置信息
import config from './config';
const utils = {
  // 用户配置信息
  config: config,
  /*
  * @param {Object}
  * url('map_address')
  */
  url: function (map = '') {
    let userInfo = wx.getStorageSync('userInfo');
    let session = '';
    if (userInfo) session = '&plum_session_applet=' + userInfo.plum_session_applet + '&';
    return config.url + 'suid=' + config.suid + (map ? '&map=' + map : '') + session;
  },
  /*
  * login
  * @param {Object}
  * getUserInfo(callBack)
  */
  getUserInfo: function (fn = () => { }) {       // 登录
    const _this = this;
    wx.login({                          // 获取 code
      success: login => {
        if (!login.code) {
          _this.toast('获取用户登录状态失败！');
          return false;
        }
        wx.request({
          url: _this.url(),
          data: {
            map: 'applet_member_info',
            code: login.code,
            slient: 1,
          },
          success: info => {
            if (info.data && info.data.ec == 200) {
              let data = info.data.data;
              if (!data.avatar) data.avatar = 'http://tiandiantong.oss-cn-beijing.aliyuncs.com/images/icon_photo.png';
              if (!data.nickname) data.nickname = '用户昵称';
              wx.setStorageSync('userInfo', data);
              // fn(data);
              _this.getWxInfo(fn, data);
            }
            // else _this.toast('登录失败！');
          }
        })
      },
      fail: function (err) {
        // _this.toast('%c 用户code获取失败！' + err.errMsg);
      }
    })
  },
  /*
  * @param {Object}
  * getWxInfo(callBack, userInfo)
  */
  getWxInfo: function (fn = () => { }, userInfo) {            // 同步用户信息
    const _this = this;
    // console.log(userInfo);
    if (wx.canIUse('getUserInfo')) {                  // 授权是否可用
      wx.getUserInfo({
        withCredentials: true,
        success: function (wxInfo) {
          // console.log(wxInfo);
          wx.request({
            url: _this.url(),
            data: {
              map: 'applet_update_member_info',
              avatar: wxInfo.userInfo.avatarUrl,
              nickname: wxInfo.userInfo.nickName,
              sex: wxInfo.userInfo.gender == 2 ? '女' : '男',
              city: wxInfo.userInfo.city,
              province: wxInfo.userInfo.province
            },
            success: res => {
              if (res.data.ec == 200) {
                wx.setStorageSync('userInfo', { userInfo: userInfo, wxInfo: wxInfo.userInfo });
                fn({ userInfo: userInfo, wxInfo: wxInfo.userInfo });
              }
              else {
                _this.toast('获取用户信息失败，正在重新获取');
              }
            }
          })
        },
        fail: function () {
          fn({ userInfo: userInfo });
        }
      })
    }
    else {
      fn({ userInfo: userInfo });
      console.log('%c 您未同意授权', 'color: blue');
    }
  },
  /*
  * @param {Object}
  * request('storageName', {map: '', query: ''}, res => {}, s)
  * request({map: '', query: ''}, res => {})
  */
  request: function(n, d, f, s = 1){
    if(typeof n === 'object'){
      s = f;
      f = d;
      d = n;
      n = '';
    }
    wx.request({
      url: this.url,
      data: d,
      success: res => {
        if(s && typeof n === 'string') wx.setStorage({
          key: n,
          data: res.data,
          success: e => {
            f(res.data);
          }
        });
        else f(res.data);
      },
      fail: err => {
        f(err);
      }
    })
  },
  /*
  * @param {Object} 
  * setNavTitle({title: 'title', bgColor: '#3cd', color: '#fff', backShow: true})
  */
  setNavTitle: function(o){
    if(typeof o === 'string') o = {
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
  },
  /*
  * @param {Object}
  * toast('提示', 2000, 'success');
  */
  toast: function(title = 'Toast', time = 2000, icon = 'none'){
    wx.showToast({
      icon: icon,
      title: title,
      duration: time
    });
    setTimeout(() => {
      wx.hideToast();
    }, time);
  },
  /*
  * @param {Object}
  * arrSplit(arr, num)
  */
  arrSplit: function(arr, num){
    var newArr = [];
    while(newArr.length != 0){
      newArr.push(arr.splice(0, num));
    }
    return newArr;
  },
  /*
  * @param {Object}
  * upImageFile({url: 'test.com', filePath: ['1.png', '2.png'], name: 'image', success: res => {}, fail: err => {} })
  */
  uploadFile: function (obj, i = 0, fileUrl = [], err = 0) {
    if (typeof obj.filePath === 'string') obj.filePath = [obj.filePath];
    wx.uploadFile({
      url: obj.url,
      filePath: obj.filePath[i],
      name: obj.name || "image",
      success: res => {
        var resData = res.data;
        try {
          resData = JSON.parse(resData);
        }
        catch (err) {
          resData = JSON.parse(resData.substring(1));
        }
        if (resData.ec === 200) {                       // 判断上传是否成功，根据后台返回的状态判定
          i++;
          fileUrl.push(resData.data.path);              // 后台返回图片路径
          if (i === obj.filePath.length) {
            if (obj.success) obj.success({ msg: 'uploadFile:ok', data: fileUrl, statusCode: res.statusCode });
          }
          else {
            this.uploadFile(obj, i, fileUrl);
          }
        }
        else {
          err++;
          if (err <= 3) this.uploadFile(obj, i, fileUrl, err);
          else {
            console.log('%c 返回信息：', 'color: #f00', resData)
            console.log('%c 请注意: 请求成功时，后台返回的信息可能与此函数中的配置不一致，注意修改', 'color: blue');
          }
        }
      },
      fail: err => {
        err++;
        if (err <= 3) this.uploadFile(obj, i, fileUrl, err);
        else {
          var errObj = { err, i, fileUrl };
          if (obj.fail) obj.fail(errObj);
          console.log('%c 图片上传失败，请注意检查...', 'color: #f00', errObj);
        }
      }
    })
  }
}
module.exports = utils;
