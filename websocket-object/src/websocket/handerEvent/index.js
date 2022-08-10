
import {LOGIN_SUCCESS,CHAT_ONE,LOGIN_FAIL, HEADER_IMAGE, PASSWORD_ERROR, JOIN, USER_LOGIN_OUT, CHAT_ROOM } from "@/websocket/constant"
import Vrouter from "@/router"
import Vstore from "@/store"
 

const handerEvent = (data) => {
  
  // const route = Vrouter.currentRoute.value
  const router = Vrouter
  let receiveMessage = {};

  switch (data.event) {
    case HEADER_IMAGE:
      Vstore.commit("userHeaderImageChange",data['url'])
      break;

    case PASSWORD_ERROR:
      alert(data.message)
      break;

    case LOGIN_SUCCESS:
      Vstore.commit("userHeaderImageChange",data['HeaderImageUrl'])
      Vstore.commit("userNameChange",data['username'])
      Vstore.commit("userListUpdate",data['alluser'])
      router.push({name:"chat"})
      break;

    case JOIN:
      Vstore.commit("userListUpdate",data['user'])
      break;

    case CHAT_ONE:
      receiveMessage.headerImageUrl = data["HeaderImageUrl"];
      receiveMessage.userName = data["fromUser"];
      receiveMessage.message = data['message'];
      receiveMessage.isRead = data['isRead'];
      receiveMessage.type = data['type'];
      receiveMessage.isOther = true;
      Vstore.commit('messageListChangeOne',receiveMessage);
      break;

    case CHAT_ROOM:
      receiveMessage.headerImageUrl = data["HeaderImageUrl"];
      receiveMessage.userName = data["fromUser"];
      receiveMessage.message = data['message'];
      receiveMessage.isOther = true;
      receiveMessage.isRead = data['isRead'];
      receiveMessage.type = data['type'];
      Vstore.commit('messageListChangeRoom',receiveMessage);
      break;

    case LOGIN_FAIL:
      Vrouter.push({name:"login"})
      break;
    case 'pong':
      break;

    case USER_LOGIN_OUT:
      Vstore.commit("userListDelete",data['username'])
      break;

    default:
      alert('event is error')
      break;

  }
}

export default handerEvent