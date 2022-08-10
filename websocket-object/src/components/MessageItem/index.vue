

<script>
import { h } from "vue";
export default {
  props: {
    text: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    let reg = /\[.*?\]/g;
    let text = props.text.replace(reg, (w) => {
      return "`" + w + "`";
    });

    let textArry = text.split("`");

    return () =>
      h(
        "div",
        { class: "message-text" },
        textArry.map((item) => {
          if (reg.test(item)) {
            return h("img", {
              src: `/emoji/${item.slice(1, item.length - 1)}.gif`,
            });
          } else {
            return item;
          }
        })
      );
  },
};
</script>

<style scoped>
img {
  width: 18px;
  height: 18px;
}
</style>