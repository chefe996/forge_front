<template>
  <div id="ForgeProps">
    <div class="selected">
      <div>
        <div class="title">
          Выбрано для заявки
        </div>

        <ul>
          <li v-for="prop in props" :key="prop.dbId">
            <div>{{ prop.name }}</div>
          </li>
        </ul>
      </div>
    </div>

    <div class="props">
      <div v-for="prop in props" :key="prop.dbId">
        <div class="title">
          {{ prop.name }}
        </div>

        <table v-if="prop.props.length > 0">
          <thead>
          <tr>
            <th>Name</th>
            <th>Value</th>
          </tr>
          </thead>

          <tbody>
          <tr v-for="_prop in prop.props" :key="_prop.displayName">
            <td>{{ _prop.displayName }}</td>
            <td>{{ _prop.displayValue }}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: 'ForgeProps',
  data() {
    return {
      props: []
    }
  },
  methods: {
    async setChecked (checked) {
      this.props = []

      for (const key in checked) {
        const dbId = checked[key]

        const args = {
          url: '/get_props',
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          data: {
            urn: this.$parent.urn,
            dbId: dbId
          }
        }

        const response = await axios(args)

        const props = {
          name: response.data.name,
          dbId: response.data.dbId,
          props: []
        }

        for (const key in response.data.props) {
          const prop = response.data.props[key]

          if (prop.hidden === false && prop.displayValue) {
            props.props.push(prop)
          }
        }

        this.props.push(props)
      }
    }
  }
}
</script>

<style scoped>
#ForgeProps {
  display: block;
  height: 40%;
  background: #f1f1f1f1;
  text-align: left;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  font-size: 1.2em;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.8em;
}

.title {
  font-size: 0.9em;
  font-weight: bolder;
  margin-bottom: 10px;
  color: green;
}

.selected {
  position: absolute;
  left: 0;
  top: 0;
  width: 30%;
  bottom: 0;
  overflow: auto;
  border-right: 1px solid #ccc;
}

.selected > div {
  padding: 20px;
}

.props {
  position: absolute;
  right: 0;
  top: 0;
  width: 70%;
  bottom: 0;
  overflow: auto;
}

.props > div {
  padding: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8em;
}

table th {
  padding: 10px;
}

table td {
  border: 1px solid #ccc;
  padding: 10px;
}
</style>