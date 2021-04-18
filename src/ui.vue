<template>
  <div>
    <div class="input input--with-icon">
      <div class="icon icon--blend"></div>
      <input
        id="input--primary"
        type="input"
        class="input__field"
        v-model="primary"
      />
    </div>
    <button v-on:click="createColorBlock" class="button button--primary">
      Create
    </button>

    <div>Hex: {{ primaryHex }}</div>
    <div>RGB: {{ primaryRGB }}</div>
    <div>HSL: {{ primaryHSL }}</div>
  </div>
</template>

<script>
import { dispatch, handleEvent } from "./uiMessageHandler";
import { hexToRGB, hexToHSL, RGBToHex } from "./colorConverter";

// Add these lines to import the interactive figma-ui components as needed.
import "./figma-ui/js/selectMenu";
import "./figma-ui/js/iconInput";
import "./figma-ui/js/disclosure";

export default {
  data() {
    return {
      primary: "#7345F0",
      success: "#4DC74B",
      info: "#0AA5FF",
      warning: "#FF9A0C",
      danger: "#FF4248",
      dark: "#2C2837",
    };
  },
  computed: {
    primaryHex: function () {
      return RGBToHex(hexToRGB(this.primary));
    },
    primaryRGB: function () {
      return hexToRGB(this.primary);
    },
    primaryHSL: function () {
      return hexToHSL(this.primary);
    },
  },
  mounted() {
    // Add these lines to initialize the interactive figma-ui components as needed.
    window.selectMenu.init();
    window.iconInput.init();
    window.disclosure.init();

    // The following shows how messages from the main code can be handled in the UI code.
    handleEvent("colorBlockCreated", (palette) => {
      console.log(palette);
    });
  },
  methods: {
    createColorBlock() {
      dispatch("createColorBlock", this.primary);
    },
  },
};
</script>

<style lang='scss'>
@import "./figma-ui/figma-plugin-ds";
</style>