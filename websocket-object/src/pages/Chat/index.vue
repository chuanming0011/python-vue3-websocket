<template>
  <!-- 聊天框 -->
  <div class="chat">
    <!-- 左边面板 -->
    <Aside />
    <!-- 中间list -->
    <UserList />
    <!-- 右边聊天框 -->
    <UserChat />
  </div>
</template>
<script>
import { watch, computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import UserList from "@/components/UserList";
import Aside from "@/components/Aside";
import UserChat from "@/components/UserChat";

export default {
  name: "Chat",
  components: {
    UserList,
    Aside,
    UserChat,
  },
  setup() {
    let store = useStore();
    let router = useRouter();

    const userName = computed(() => {
      return store.state.userName;
    });

    watch(
      userName,
      (newval) => {
        if (!newval) {
          router.push({ path: "/login" });
        }
      },
      { immediate: true, deep: true }
    );

    return {};
  },
};
</script>
<style lang="scss" scoped>
@import "./index.scss";
</style>