import axios from 'axios'
import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

// axios.defaults.baseURL = 'http://0.0.0.0:3000'
axios.defaults.baseURL = 'http://45.141.76.252:4430'

new Vue({
  render: h => h(App),
}).$mount('#app')
