
const areaFile = {
  namespaced: true,
  state: {
    tableHeader: [
      {
        title: "地区编码",
        dataKey: "regionCode",
        key: 'regionCode',
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        title: "省",
        dataKey: "province",
        key: 'province',
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        title: "市",
        dataKey: "city",
        key: 'city',
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        title: "区",
        dataKey: "area",
        key: 'area',
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        title: "街道",
        dataKey: "street",
        key: 'street',
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        title: "所属仓库",
        dataKey: "warehouseName",
        key: 'warehouseName',
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        title: "创建时间",
        dataKey: "createTime",
        key: 'createTime',
        width: 200,
        type: 'date',
        isShow: true,
        isFixed: false
      }, {
        title: "创建人",
        dataKey: "createUserName",
        key: 'createUserName',
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        title: "更新时间",
        dataKey: "updateTime",
        key: 'updateTime',
        width: 200,
        type: 'date',
        isShow: true,
        isFixed: false
      }, {
        title: "更新人",
        dataKey: "updateUserName",
        key: 'updateUserName',
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: false
      }
    ],
    defaultTableHeader: [
      {
        title: "地区编码",
        dataKey: "regionCode",
        key: 'regionCode',
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        title: "省",
        dataKey: "province",
        key: 'province',
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        title: "市",
        dataKey: "city",
        key: 'city',
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        title: "区",
        dataKey: "area",
        key: 'area',
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        title: "街道",
        dataKey: "street",
        key: 'street',
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        title: "所属仓库",
        dataKey: "warehouseName",
        key: 'warehouseName',
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        title: "创建时间",
        dataKey: "createTime",
        key: 'createTime',
        width: 200,
        type: 'date',
        isShow: true,
        isFixed: false
      }, {
        title: "创建人",
        dataKey: "createUser",
        key: 'createUser',
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        title: "更新时间",
        dataKey: "updateTime",
        key: 'updateTime',
        width: 200,
        type: 'date',
        isShow: true,
        isFixed: false
      }, {
        title: "更新人",
        dataKey: "updateUser",
        key: 'updateUser',
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: false
      }
    ]
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
export default areaFile
