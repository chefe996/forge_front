<template>
  <div id="ForgeLayer">
    <div v-bind:id="layer.dbId">
      <div class="title">
        <input type="checkbox" v-bind:name="layer.dbId">
        <span v-on:click="loadChilds(layer.dbId, $event)">{{ layer.name }}</span>
      </div>

      <ul style="display:none" v-bind:id="layer.dbId">
        <li v-for="children in layer.children" :key="children.dbId" v-bind:id="children.dbId">
          <div class="children">
            <ForgeLayer v-bind:layer="children" />
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import ForgeLayer from "./ForgeLayer"

export default {
  name: 'ForgeLayer',
  components: {
    ForgeLayer
  },
  props: {
    layer: {}
  },
  data() {
    return {
    }
  },
  methods: {
    loadChilds(dbId, event) {
      const parent = event.target.closest('#ForgeLayer')
      const layer = parent.querySelector('ul')

      if (layer.style.display === 'block') {
        layer.style.display = 'none'
      } else {
        layer.style.display = 'block'
      }
    }
  }
}
</script>

<style scoped>
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

ul li {
  color: #2c3e50;
}

ul li .children {
  padding: 10px;
  padding-top: 0;
}

.title {
  font-size: 0.8em;
  text-align: left;
  padding-top: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f1f1f1;
  transition: all .1s;
}

.selected .title {
  color: green;
  font-weight: bold;
}

.title:hover {
  text-shadow: 2px 2px 2px rgba(0, 0, 0, .2);
}

.title span {
  padding-left: 5px;
  cursor: pointer;
  display: inline-block;
}
</style>