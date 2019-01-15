//app.js
import Utils from 'utils/util';
import Watch from 'utils/watch';
App({
  util: Utils,
  onLaunch: function () {
    // console.log(Utils);
    class watchCurrent extends getCurrentPages {
      constructor(o, t){
        super(o)
        console.log(o, t)
      }
    }
    new watchCurrent('123')
    Utils.getPosition(res => {
      console.log(res)
    })
  },
  globalData: {
    userInfo: null
  }
})