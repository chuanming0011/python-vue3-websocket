<template>
  <div class="center-part">
    <div class="search-box">
    <input type="text" placeholder="搜索" v-model.trim="keywords" />
  </div>
    <div class="userlist">
      <div class="item group" v-show="ingroup" :class="{'on':ongroup}" @click="intoChatRoom(0)">
        <img src="/avatar/group-icon.png" alt="" />
        <div class="item-userinfo">
          <div class="item-username">{{groupName}}</div>
          <div class="item-message">{{groupLastMessage}}</div>
          <span class="tips">{{sum('group')}}</span>
        </div>
      </div>
      <div class="item" v-for="(item, index) in userlist" :key="index" :class="{'on':item.ischoose}" @click="intoChatRoom(1,item)">
        <img :src="item.HeaderImageUrl" alt="" />
        <div class="item-userinfo">
          <div class="item-username">{{ item.username }}</div>
          <div class="item-message">{{item.lastMessage}}</div>
          <span class="tips">{{sum(item.username)}}</span>
        </div>
      </div>
    </div>
  </div>
  <audio :src="audiourl" ref="audio"></audio>
</template>
<script>
import { useStore } from "vuex";
import {  ref,computed,watch, inject, nextTick } from "vue";

import { hasOwnProperty } from "@/commonJS/common"

export default {
  name: "UserList",
  setup() {
    let store = useStore();
    let audiourl = `${process.env.BASE_URL}mp3/8400.mp3`
    let audio = ref(null)
    let keywords = ref("")
    let groupName = ref("群聊")
    let ingroup =ref(true)         //搜索是否显示群
    let ongroup = ref(false)
    let chatType = ref("")
    let groupLastMessage = computed(()=>{
      return store.state.groupLastMessage
    })


    let userlist = computed(()=>{
      let arr =[]
      store.state.userList.forEach(item=>{
        if(item.username.indexOf(keywords.value) !== -1){
          arr.push(item)
        }
      })
      return arr
    })

    watch(userlist,(newval,oldval)=>{
      console.log(newval,oldval);
    })

    let sum = computed(()=>(name)=>{
      if(!hasOwnProperty(store.state.messageList,name)){
        return ""
      }
      let count = 0;
      store.state.messageList[name].forEach(item=>{
        if(!item.isRead){
          count++;
        }
      })
      if(count > 0 && audio){
          audio.value.load();
          audio.value.play();
      }
      return count == 0 ? "" : count > 99 ? '99+' : count;
    })
    

    nextTick(()=>{
      watch(keywords, (newval)=>{
        if(groupName.value.indexOf(newval) !== -1){
          ingroup.value = true
        }else{
           ingroup.value = false
        }
      })

    })
    
    let toInfoChange = inject("toInfoChange")
    function intoChatRoom(type,data){
      chatType.value = type
      if(type === 0){
        document.title = store.state.userName + "| 群聊"
        ongroup.value = true
        store.commit("globalEventChange","chatRoom")
        toInfoChange(groupName.value,"/avatar/group-icon.png")
        userlist.value.forEach((item,i)=>{
              userlist.value[i].ischoose = false;
          })
        }else if(type === 1){
          document.title = store.state.userName + "|" + data.username
          toInfoChange(data.username,data.HeaderImageUrl)
           store.commit("globalEventChange","chatOne")
          ongroup.value = false
          userlist.value.forEach((item,i)=>{
            if(item.username === data.username){
              userlist.value[i].ischoose = true;
            }else{
              userlist.value[i].ischoose = false;
            }
          })
        2
      }
    }



    return {
      userlist,
      keywords,
      groupName,
      ingroup,
      ongroup,
      intoChatRoom,
      groupLastMessage,
      sum,
      audiourl,
      audio,
    };

  },
};
</script>

<style lang="scss" scoped>
@import "./index.scss";
</style>