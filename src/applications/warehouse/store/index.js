import { createStore } from 'vuex'
import createPersistedstate from 'vuex-persistedstate'
export default createStore({
  state: {
  },
  getters: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
  },
  plugins: [createPersistedstate({
    storage: window.localStorage,
    key: '',
  })]
})
