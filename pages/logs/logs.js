//logs.js
const util = require('../../utils/util.js')

Page({
  data: {
    logs: []
  },
  onLoad: function () {
    util.setNavTitle({
      title: '启动日志',
      bgColor: '#3cd',
      color: '#fff',
      backShow: true
    })
    // this.setData({
    //   logs: (wx.getStorageSync('logs') || []).map(log => {
    //     return util.formatTime(new Date(log))
    //   })
    // })
  },
  
})
