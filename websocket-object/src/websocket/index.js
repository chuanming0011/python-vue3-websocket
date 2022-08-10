import {
  WS_IP,
  WS_PORT,
  WS_PROTOCOL
} from "./constant";
import handerEvent from "./handerEvent"


export default class VueWebSocket {

  ping = null;

  constructor() {

    this.url = WS_PROTOCOL + '://' + WS_IP + ':' + WS_PORT;
    this.initConnect();
  }
  initConnect() {
    this.websocket = new WebSocket(this.url)
    this.pingFuc();


    this.websocket.onopen = () => {
      let day = new Date();
      console.log('**************');
      console.log(day.toLocaleString(), `链接成功！！！！！`);
      console.log('**************');
    }

    this.websocket.onmessage = e => {
      let data = typeof e.data == 'string' ? JSON.parse(e.data) : e.data;
      console.log(data);
      this.messageHandler(data);
    }

    this.websocket.onclose = () => {
      console.log("链接关闭");
      clearInterval(this.ping)
      if (this.websocket.readyState != 1) {
        setTimeout(() => {
          console.log('重新链接!!!');
          this.initConnect();
        }, 2000);
      }

    }

    this.websocket.onerror = (e) => {
      console.log(e);
    }

  }
  // 判断socket返回事件
  messageHandler(data) {
    handerEvent(data)
  }

  sendMessage(data) {
    data = JSON.stringify(data);
    this.websocket.send(data)
  }

  pingFuc() {
    this.ping = setInterval(() => {
      let data = {
        message: "心跳",
        event: "ping"
      }
      this.sendMessage(data)
    }, 30 * 1000)
  }



}