
const HOST = 'wss://www.dywdtw.com/wss';
/*
var socket = wx.connectSocket({
  url: HOST,
});
socket.onOpen(res => {
  console.log('%c -------------- socket 连接打开 -------------', 'color: #c3d');
});
socket.onMessage(res => {
  // console.log(res, '-------------- message -------------');
  let data = JSON.parse(res.data);
  if (data.type == 'init') {
    const app = getApp();
    app.globalData.clientID = data.client_id;
  }
});
socket.onError(res => {
  console.log('%c -------------- socket 连接异常 -------------', 'color: blue');
});
socket.onClose(res => {
  console.log('%c -------------- socket 连接断开 -------------', 'color: blue');
});
export default socket;
*/

class Socket {
  constructor(host) {
    this.host = host
    this.connected = false
    wx.connectSocket({
      url: this.host
    })
    // 监听连接成功
    wx.onSocketOpen((res) => {
      console.log('%c -------------- socket 连接打开 -------------', 'color: #c3d');
      this.connected = true;
      wx.onSocketMessage((e) => {
        // console.log(e);
        var data;
        try {
          data = JSON.parse(e.data);
        }
        catch (err){
          data = e.data;
        }
        if (data.type == 'init') {
          const app = getApp();
          app.globalData.clientID = data.client_id;
          // app.linkSocket();
        }
      })
    })
    // 监听连接断开
    wx.onSocketError((res) => {
      console.log('%c -------------- socket 连接异常 -------------', 'color: blue');
      this.connected = false
      wx.connectSocket({
        url: this.host
      })
    })

    // 监听连接关闭
    wx.onSocketClose((res) => {
      console.log('%c -------------- socket 连接断开 -------------', 'color: blue');
      this.connected = false
      wx.connectSocket({
        url: this.host
      })
    })

  }
  onError(callback = () => {}){      // 监听错误事件
    wx.onSocketError(res => {
      callback(res);
    })
  }
  sendMessage(data = '') {
    if (!this.connected) {
      console.log('not connected')
      return
    }
    // 发送事件
    wx.sendSocketMessage({
      data: JSON.stringify(data)
    })
  }
  onMessage(callback = () => {}) {                       // 监听服务器消息
    wx.onSocketMessage((res) => {
      const data = JSON.parse(res.data)
      callback(data)
    })
  }
  close(callback = () => {}){
    // 关闭连接
    wx.closeSocket();
  }
}

const socket = new Socket(HOST);
export default socket;
