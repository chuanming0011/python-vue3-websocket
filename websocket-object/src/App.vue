<template>
 <router-view></router-view>
</template>

<script>
import { useStore } from 'vuex';
import { onMounted, provide, onUnmounted,reactive } from "vue";

export default {
  name: 'App',
  setup() {
    let store = useStore();
    let toInfo = reactive({ 
      name:"",
      image:"",
    })

    const toInfoChange = (name,image) =>{
      toInfo.name =name;
      toInfo.image =image;
    }
    // 依赖注入
    provide('toInfo',toInfo)
    provide('toInfoChange',toInfoChange)

    function handlerUnloaded() {
      let data ={
        event: 'loginOut',
        username: store.state.userName
      }
      if(store.state.userName){
        store.dispatch("webSocketSend", data);
      }
    }
    onMounted(()=>{
      store.dispatch('initWebSocket');
      window.addEventListener('beforeunload',handlerUnloaded)
    })
    onUnmounted(()=>{
      // 关闭窗口时登出用户
      window.removeEventListener('beforeunload',handlerUnloaded)
    })
  }
}
</script>

<style language="scss" >
@import url('~@/assets/styles/reset.scss');
</style>
