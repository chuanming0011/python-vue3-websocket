import {
  createStore
} from "vuex";
import VueWebSocket from "@/websocket"
import { hasOwnProperty } from "@/commonJS/common"


const mutations = {
  initWebSocket(state) {
    state.VueWebSocket = new VueWebSocket();
  },
  webSocketSend(state, data) {
    state.VueWebSocket.sendMessage(data);
  },
  messageListChangeOne(state, data) {

    if(!hasOwnProperty(data,"toUser")){
      data['toUser'] =  data['userName']
    }
    
    if(!hasOwnProperty(state.messageList,data['toUser'])){
      state.messageList[data['toUser']] = []
    }
    state.messageList[data['toUser']].push(data)
    state.userList.forEach((user,i) =>{
      if(user.username === data['toUser']){
        console.log(state.userList[i]);
        if(data['type'] == 'text'){
          state.userList[i].lastMessage = data['message']
        }else{
          state.userList[i].lastMessage = '[图片]'
        }
      }
    })
  },
  messageListChangeRoom(state, data) {
    if(!hasOwnProperty(state.messageList,"group")){
      state.messageList['group'] = []
    }
    state.messageList['group'].push(data)
    if(data['type'] == 'text'){
      state.groupLastMessage = data['message']
    }else{
      state.groupLastMessage = '[图片]'
    }
  },
  messageRead(state, name) {
    if(hasOwnProperty(state.messageList,name)){
      state.messageList[name].forEach((_,index) =>{
        state.messageList[name][index].isRead = true
      })
    }
  },
  userNameChange(state, data) {
    state.userName = data
    document.title = data
  },
  userHeaderImageChange(state, data) {
    state.userHeaderImage = data
  },
  userListUpdate(state, data) {
    for (let i of data) {
      i.ischoose = false;
      state.userList.push(i);
    }
  },
  userListDelete(state, name) {
    for (let i = 0; i < state.userList.length; i++) {
      if (state.userList[i].username == name) {
        state.userList.splice(i, 1)
        break;
      }
    }
  },
  globalEventChange(state, data) {
    state.globalEvent = data
  }
}

// store.dispatch('increment')
const actions = {
  initWebSocket(context) {
    context.commit('initWebSocket');
  },
  webSocketSend(context, data) {
    context.commit('webSocketSend', data);
  },
}
const state = {
  vueWebSocket: null,   //全局的websocket
  messageList: {},      //所有聊天记录
  userName: "",        //登录的账户名
  userHeaderImage: "", //登录的头像
  userList: [],        //在线的用户列表
  globalEvent:"",      //发送给群聊还是单独用户
  groupLastMessage:"", //群的最近消息
}

// 创建一个store实例
const store = createStore({
  mutations,
  actions,
  state,
})


export default store;