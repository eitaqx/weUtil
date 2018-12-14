// components/refurbish-load/refurbish-load.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    upperThreshold: {                   // 距离顶部多少时 触发 upper
      type: Number,
      value: 50
    },
    lowerThreshold: {                   // 距离底部多少时 触发 lower
      type: Number,
      value: 50
    },
    angle: {                            // 指定角度内可以移动
      type: Number,
      value: .5
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    refurbish: true,                        // 是否开启下拉刷新 true 是 false 否
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _start: function (e) {                 // 记录开始位置
      // console.log(e, '_start');
      this.data.startClientX = Math.abs(e.changedTouches[0].clientX);
      this.data.startClientY = Math.abs(e.changedTouches[0].clientY);
    },
    _move: function (e) {                  // 是否进行移动
      // console.log(e, '_move');
      if (this.data.refurbish) {
        var clientX = Math.abs(e.changedTouches[0].clientX),
            clientY = Math.abs(e.changedTouches[0].clientY),
            startClientX = this.data.startClientX,
            startClientY = this.data.startClientY,
            upperThreshold = this.data.upperThreshold,
            defaultAngle = this.data.angle;
        var angle = (clientX - startClientX) / (clientY - startClientY);
        if (Math.abs(angle) < defaultAngle){
          let moveDistance = (clientY - startClientY) <= 0 ? 0 : (clientY - startClientY) / 2;
          if (moveDistance < 0) return false;             // 阻止反向滑出
          this.setData({
            translateY: moveDistance,
            animateStatus: false
          })
        }
      }
    },
    _end: function (e) {                    // 手势是否离开界面
      // console.log(e, '_end');
      let translateY = this.data.translateY;
      if (translateY > 50) this.triggerEvent('scrolltoupper');
      this.setData({
        animateStatus: translateY > 50,
        translateY: translateY > 50 ? 50 : 0
      })
      if (translateY > 50) setTimeout(() => {
        this.setData({
          translateY: 0,
          animateStatus: true,
        })
      }, 1500)
    },
    _upper: function(e){                    // 滚动到顶部触发
      // console.log(e, '_upper');
      this.data.refurbish = true;
    },
    _lower: function(e){                    // 滚动到底部触发
      // console.log(e, '_lower');
      this.triggerEvent('scrolltolower');
    },
    _scroll: function(e){                     // 是否滚动到顶部
      // console.log(e, '_scroll');
      var upperThreshold = this.data.upperThreshold;
      if (e.detail.scrollTop < upperThreshold) this.data.refurbish = true;
      else this.data.refurbish = false;
    }
  }
})
