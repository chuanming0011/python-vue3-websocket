<template>
  <div class="lgoin-from">
    <div class="img-box">
      <img :src="imageurl" alt="" />
    </div>
    <label for="">
      <input type="text" v-model.trim="userinfo.username" placeholder="账号" @blur="GetHeaderImage" />
    </label>
    <label for="">
      <input
        type="password"
        v-model.trim="userinfo.password"
        placeholder="密码"
        @keydown="Loginin"
      />
    </label>
    <button class="loginBtn" @click="Login">登录</button>
  </div>
</template>

<script>
import { ref, reactive,computed, watch } from "vue";
import { useStore } from "vuex";

export default {
  name: "login",
  setup() {
    const store = useStore();
    let imageurl = ref(randomImageUrl()); //头像地址

    let userinfo = reactive({
      username: "",
      password: "",
      event:"login",
      HeaderImageUrl:imageurl.value
    });

    function Login() {
      if (userinfo.username == "" || userinfo.password == "") {
        alert("账号密码不能为空！！");
        return;
      }
      store.dispatch("webSocketSend", userinfo);
    }
    function Loginin(e){
      if(e.keyCode === 13){
        Login();
      }
    }
    // 获取当前账号的头像
    function GetHeaderImage(){
      if(userinfo.username){
        let data ={
          username: userinfo.username,
          event:"GetHeaderImage"
        }
        store.dispatch("webSocketSend", data);
      }
    }
    function randomImageUrl() {
      let url = Math.round(Math.random() * 15);
      url = `${process.env.BASE_URL}avatar/${url}.jpg`;
      return url
    }

    let headerImageUrl = computed(()=>{
      return store.state.userHeaderImage
    })

    watch(headerImageUrl,(newval)=>{
      if(newval){
        imageurl.value = newval
      }
    })
    
    return {
      userinfo,
      imageurl,
      Login,
      Loginin,
      GetHeaderImage,
    };
  },
};
</script> 
<style lang="scss" scoped>
@import "./index.scss";
</style>