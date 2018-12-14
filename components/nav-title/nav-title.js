// components/nav-title/nav-title.js
Component({
  options: {
    multipleSlots: true               // 使用多个插槽
  },

  externalClasses: ['my-class'],      // 接受外部传入的样式类

  properties: {                       // 组件的属性列表
    title: {
      type: String,
      value: ''
    },
    bgColor: {
      type: String,
      value: '#fff'
    },
    color: String,
    backShow: {
      type: Boolean,
      value: true
    }
  },

  created: function () {              // 实例刚刚被创建时
    const _this = this;
    wx.getSystemInfo({                // 获取手机信息
      success: function(res) {
        _this.screenInfo = res;
        _this.screenInfo.statusBarShow = Number(res.version.replace(/\./g, "")) >= 660;  // 版本是否支持自定义导航
        _this.screenInfo.statusBackShow = getCurrentPages().length === 1;                 // 栈长度为 1 时隐藏返回键
      },
    })
  },
  attached: function () {               // 组件实例进入页面
    const _this = this;
    this.setData({
      screenInfo: _this.screenInfo
    })
  },
  ready: function () {                    // 组件布局完成后
    const title = this.data.title;
    if(title) return false;
    const pages = getCurrentPages();
    const pageThis = pages[pages.length - 1];
    const setNavigationStyle = pageThis.data.setNavigationStyle;
    if (setNavigationStyle) 
      this.setData(setNavigationStyle);
  },
  data: {                             // 组件的初始数据

  },

  methods: {                          // 组件的方法列表
    _goBack: function(){              // 返回上页
      wx.navigateBack({
        delta: 1
      });
    },
    scrolltoupper: function (e) {
      console.log('%c 你触发了下拉刷新！', 'color: blue');
      wx.showToast({
        icon: 'none',
        title: '你触发了下拉刷新',
        duration: 2000
      })
    },
    scrolltolower: function(){
      console.log('%c 你触发了上拉加载！', 'color: blue');
      wx.showToast({
        icon: 'none',
        title: '你触发了上拉加载',
        duration: 2000
      })
    }
  }
})
