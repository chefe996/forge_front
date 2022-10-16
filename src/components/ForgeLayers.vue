<template>
  <form id="ForgeLayers">
    <div class="tree">
      <div class="componentTitle">Слои/Элементы</div>

      <ForgeLayer v-for="layer in layers" :key="layer.name" v-bind:layer="layer" />
    </div>
  </form>
</template>

<script>
import axios from "axios"
import ForgeLayer from "./ForgeLayer"

export default {
  name: 'ForgeLayers',
  components: {
    ForgeLayer
  },
  data() {
    return {
      layers: [],
      visible: null
    }
  },
  async mounted() {
    const args = {
      url: '/get_tree',
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      data: {
        urn: this.$parent.urn
      }
    }

    const response = await axios(args)

    this.layers = response.data.tree.children

    console.log(response.data)
  }
}
</script>

<style scoped>
#ForgeLayers {
  display: block;
  height: 60%;
  background: #fff;
  text-align: left;
  position: absolute;
  top: 0;
  left: 0;
  right: 70%;
  font-size: 1.2em;
  overflow: auto;
}

#ForgeLayers .tree {
  padding: 20px;
}

.componentTitle {
  font-size: 1.2em;
  text-align: left;
  color: darkcyan;
  font-weight: bolder;
  margin-bottom: 20px;
}
</style>