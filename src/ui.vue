<template>
  <div>
    <div class="flex-container">
      <div class="input" v-for="(value, name) in colors" :key="name">
        <input
          :id="`input--${name}`"
          :name="`input--${name}`"
          type="color"
          class="input__field"
          v-model="colors[name]"
        />
        <input type="text" :id="`input-text--${name}`" v-model="colors[name]" />
        <label :for="`input--${name}`">{{ name }}</label>
      </div>
    </div>
    <button v-on:click="createColorBlock" class="button button--primary">
      Create
    </button>
  </div>
</template>

<script>
import { dispatch, handleEvent } from './uiMessageHandler'
// import { hexToRGB, hexToHSL, RGBToHex } from "./colorConverter";

// Add these lines to import the interactive figma-ui components as needed.
import './figma-ui/js/selectMenu'
import './figma-ui/js/iconInput'
import './figma-ui/js/disclosure'

export default {
  data() {
    return {
      colors: {
        primary: '#0303FC',
        success: '#4DC74B',
        info: '#0AA5FF',
        warning: '#FF9A0C',
        danger: '#FF4248',
        dark: '#2C2837',
      },
    }
  },
  computed: {},
  mounted() {
    // Add these lines to initialize the interactive figma-ui components as needed.
    window.selectMenu.init()
    window.iconInput.init()
    window.disclosure.init()

    // The following shows how messages from the main code can be handled in the UI code.
    handleEvent('colorBlockCreated', (palette) => {
      console.log(palette)
    })
  },
  methods: {
    createColorBlock() {
      dispatch('createColorBlock', this.colors)
    },
  },
}
</script>

<style lang='scss'>
@import './figma-ui/figma-plugin-ds';

label {
  display: inline-block;
  position: relative;
  cursor: pointer;
  overflow: hidden;
}

.input > * {
  margin: 0 5px;
}

input[type='color'] {
  position: relative;
  border: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  overflow: hidden;
  outline: none;
  cursor: pointer;
  padding: 0;

  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  &::-webkit-color-swatch {
    border: none;
    border-radius: 50%;
  }
}
</style>