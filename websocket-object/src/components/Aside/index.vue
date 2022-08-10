<template>
  <div class="aside-panel">
    <div class="aside-header-img">
      <img :src="imgUrl" alt="" />
    </div>
    <span class="name">
      {{ name }}
    </span>
  </div>
</template>
<script>
import { useStore } from "vuex";
import { ref } from "vue";
export default {
  name: "Aside",
  setup() {
    let store = useStore();
    let imgUrl = ref(store.state.userHeaderImage);
    let name = store.state.userName;
    return {
      imgUrl,
      name,
    };
  },
};
</script>
<style lang="scss" scoped>
.aside-panel {
  width: 60px;
  height: 100%;
  padding: 15px 5px;
  background-color: #2e2e2e;
  overflow: hidden;
  .aside-header-img {
    width: 45px;
    height: 45px;
    margin: 0 auto;
    img {
      width: 100%;
      height: 100%;
    }
  }
  .name {
    width: 100%;
    display: block;
    text-align: center;
    margin-top: 5px;
    color: #fff;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>