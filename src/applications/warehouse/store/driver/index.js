const driversFile = {
  namespaced: true,
  state: {
    tableHeader: [],
    defaultTableHeader: []
  },
  getters: {
  },
  mutations: {
    updateTableHeader(state, newTableHeader) {
      state.tableHeader.length = 0
      state.tableHeader.push(...newTableHeader)
    }
  },
  actions: {
  }
}
export default driversFile
