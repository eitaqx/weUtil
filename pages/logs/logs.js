//logs.js
const app = getApp()
Page({
  data: {
    logs: []
  },
  onLoad: function (options) {
    app.util.getPosition(res => {
      console.log(res)
    })
    let pages = getCurrentPages()
    class watchCurrent extends getCurrentPages {
      constructor(o, t) {
        super(o)
        console.log(o, t)
      }
    }
    new watchCurrent()
    console.log(options, pages[pages.length - 1])
    app.util.setNavTitle({
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
