<template>
  <div class="userchat" v-show="chatInfo.name">
    <div class="chat-info">
      <div class="chat-header-img">
        <img :src="chatInfo.image" alt="" />
      </div>
      <div class="chat-name">{{ chatInfo.name }}</div>
    </div>
    <div class="message-box">
      <div class="message-list" id="message-list" ref="message_list">
        <div
          class="message-item"
          v-for="(item, index) in messageobj"
          :key="index"
          :class="{ right: !item.isOther }"
        >
          <img :src="item.headerImageUrl" alt="" />
          <div class="message-text-part">
            <div class="message-username">{{ item.userName }}</div>
            <MessageItem :text="item.message" v-if="item.type == 'text'" />
            <div
              class="message-text"
              v-if="item.type == 'image'"
              v-html="item.message"
            ></div>
          </div>
        </div>
      </div>
    </div>
    <!-- 表情和图片 -->
    <div class="choose-file">
      <div class="emoji-file" @click="isShowEmojiFuc">
        <div class="emoji-list-part" v-show="isShowEmoji">
          <ul>
            <li
              v-for="(item, index) in emojiList"
              :key="index"
              @click="emojiHander(item.title)"
            >
              <img :src="'/emoji' + item.url" :title="item.title" />
            </li>
          </ul>
        </div>
      </div>
      <div class="image-file" @click="sendImage">
        <input type="file" v-show="false" ref="file" @change="fileChange" />
      </div>
    </div>
    <!-- 输入框 -->
    <textarea
      class="msg"
      placeholder="请输入消息"
      ref="textarea"
      @keydown="textareaKeyDown"
      v-model.trim="textareaValue"
    ></textarea>
    <button class="btn" @click.stop="submitMessage">发送</button>
  </div>
</template>

<script>
import { useStore } from "vuex";
import { ref, watch, nextTick, inject, computed, reactive } from "vue";
import { expressions } from "@/commonJS/emoji";
import MessageItem from "@/components/MessageItem";

export default {
  name: "UserChat",
  components: {
    MessageItem,
  },
  setup() {
    const store = useStore();
    let message_list = ref(null);
    let textareaValue = ref("");
    let chatInfo = inject("toInfo");
    let emojiList = reactive(expressions);
    let isShowEmoji = ref(false);
    let textarea = ref(null);
    let file = ref(null);
    let gEvent = computed(() => {
      return store.state.globalEvent;
    });

    let messageobj = computed(() => {
      if (gEvent.value === "chatOne") {
        store.commit("messageRead", chatInfo.name);
        return store.state.messageList[chatInfo.name];
      } else if (gEvent.value === "chatRoom") {
        store.commit("messageRead", "group");
        return store.state.messageList["group"];
      }
      return "";
    });

    watch(
      messageobj,
      () => {
        nextTick(() => {
          message_list.value.scrollTo(0, message_list.value.scrollHeight);
        });
      },
      { deep: true }
    );

    // 发送消息
    function submitMessage() {
      if (textareaValue.value.length == 0) {
        return;
      }
      sendMessageFuc("text", textareaValue.value);
      textareaValue.value = "";
    }

    function textareaKeyDown(e) {
      if (e.keyCode == 13) {
        submitMessage();
      }
    }

    const sendMessageFuc = (type, data) => {
      let toMessage, msg;
      // 存入store数组
      toMessage = {};
      toMessage.headerImageUrl = store.state.userHeaderImage;
      toMessage.userName = store.state.userName;
      toMessage.message = data;
      toMessage.isOther = false;
      toMessage.isRead = true;
      toMessage.type = type;

      // 返回给后端聊天数据
      msg = {
        fromUser: store.state.userName,
        event: gEvent.value,
        message: data,
        type: type,
      };

      if (gEvent.value === "chatOne") {
        msg.toUser = chatInfo.name;
        toMessage.toUser = chatInfo.name;
        store.commit("messageListChangeOne", toMessage);
      } else if (gEvent.value === "chatRoom") {
        store.commit("messageListChangeRoom", toMessage);
      }
      store.dispatch("webSocketSend", msg);
    };

    const isShowEmojiFuc = () => {
      function hide() {
        isShowEmoji.value = false;
        document.removeEventListener("click", hide);
      }
      if (isShowEmoji.value) {
        hide();
      } else {
        isShowEmoji.value = true;
        setTimeout(() => {
          document.addEventListener("click", hide);
        }, 0);
      }
    };

    function emojiHander(title) {
      textareaValue.value = textareaValue.value + title;
    }
    const sendImage = () => {
      file.value.dispatchEvent(new MouseEvent("click"));
    };
    const fileChange = (e) => {
      let file = e.target.files[0];
      console.log(file);
      let maxSize = 1 * 1024 * 1024;
      if (file.size > maxSize) {
        alert("图片大小不能超过1M!");
        return;
      }
      let reader = new FileReader();
      reader.readAsDataURL(file); //读出base64
      console.log(reader);
      reader.onloadend = () => {
        let imageHtml = `<img src="${reader.result}" class='image'>`;
        sendMessageFuc("image", imageHtml);
      };
    };

    return {
      messageobj,
      submitMessage,
      textareaValue,
      textareaKeyDown,
      message_list,
      chatInfo,
      emojiList,
      isShowEmoji,
      emojiHander,
      textarea,
      isShowEmojiFuc,
      file,
      sendImage,
      fileChange,
    };
  },
};
</script>

<style lang="scss" scoped>
.userchat {
  width: calc(100% - 290px);
  .chat-info {
    width: 100%;
    height: 50px;
    display: flex;
    border-bottom: 1px solid #ccc;
    padding: 10px 0 0 20px;
    .chat-header-img {
      width: 30px;
      height: 30px;
      overflow: hidden;
      border-radius: 5px;
      img {
        width: 100%;
        height: 100%;
      }
    }
    .chat-name {
      font-size: 20px;
      line-height: 30px;
      margin-left: 15px;
    }
  }

  .message-box {
    border-bottom: 1px solid #ccc;
    height: 370px;
    width: 100%;
    padding: 20px;
    box-sizing: border-box;
    .message-list {
      width: 100%;
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      &::-webkit-scrollbar {
        display: none;
      }
      .message-item {
        display: flex;
        align-items: flex-start;
        margin-bottom: 20px;
        img {
          width: 60px;
          height: 60px;
          background-color: skyblue;
          margin-right: 10px;
        }
        .message-text {
          padding: 5px;
          background-color: #aae97e;
          border-radius: 8px;
          position: relative;
          max-width: 330px;
          margin-top: 5px;
          word-break: break-word;
          min-height: 26px;
          &::before {
            content: "";
            width: 0;
            height: 0;
            position: absolute;
            left: -8px;
            top: 10px;
            border-top: 5px solid transparent;
            border-bottom: 5px solid transparent;
            border-right: 8px solid #aae97e;
          }
        }
        &.right {
          flex-direction: row-reverse;
          img {
            margin-left: 10px;
          }
          .message-text::before {
            right: -8px;
            left: unset;
            border-top: 5px solid transparent;
            border-bottom: 5px solid transparent;
            border-left: 8px solid #aae97e;
            border-right: unset;
          }
          .message-username {
            text-align: right;
          }
        }
      }
    }
  }
  .choose-file {
    height: 30px;
    display: flex;
    align-items: center;

    & > div {
      margin-left: 10px;
      font-size: 25px;
      &::before {
        content: "";
        width: 20px;
        height: 20px;
        display: block;
      }
    }
    .emoji-file {
      position: relative;
      &::before {
        background: url(/images/emoji.png) no-repeat center/cover;
      }
      .emoji-list-part {
        padding: 5px;
        width: 315px;
        height: 260px;
        bottom: 30px;
        border-radius: 8px;
        overflow-y: auto;
        user-select: none;
        position: absolute;
        background-color: #fff;
        box-shadow: 0 0 3px #d1dbe5;
        &::-webkit-scrollbar {
          display: none;
        }

        > ul {
          display: flex;
          flex-wrap: wrap;
          overflow: hidden;

          > li {
            width: 30px;
            height: 30px;
            overflow: hidden;
            padding: 2px;

            > img {
              width: 100%;
              height: 100%;
            }
            &:hover {
              background-color: #ededed;
            }
          }
        }
      }
    }
    .image-file::before {
      background: url(/images/image.png) no-repeat center/cover;
    }
  }
  .msg {
    width: 100%;
    padding: 5px 10px;
    outline: none;
    box-sizing: border-box;
    resize: none;
    height: 110px;
    border: unset;
  }
  button {
    float: right;
    margin-right: 10px;
    padding: 2px 10px;
    box-sizing: border-box;
    border-radius: 4px;
  }
}
</style>
<style>
.message-text > .image {
  width: 100%;
  height: 100%;
}
</style>