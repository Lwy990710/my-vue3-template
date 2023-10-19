const goodsFile = {
  namespaced: true,
  state: {
    tableHeader: [
      {
        label: "产品名称",
        prop: "materialName",
        width: 120,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "套机码 / 单机码 ",
        prop: "materialCode",
        width: 150,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "规格型号",
        prop: "materialSpecification",
        width: 250,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "产品类型",
        prop: "materialType",
        width: 100,
        type: 'select',
        options: [
          {
            label: '套机',
            value: '套机'
          }, {
            label: '单机',
            value: '单机'
          }, {
            label: '内机',
            value: '内机'
          }, {
            label: '外机',
            value: '外机'
          }, {
            label: '配件',
            value: '配件'
          }
        ],
        isShow: true,
        isFixed: false
      }, {
        label: '产品类别',
        prop: 'sort',
        width: 100,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "条码头",
        prop: "barCodeHead",
        width: 100,
        type: 'none',
        isShow: true,
        isFixed: false
      }, {
        label: "重量(kg)",
        prop: "weight",
        width: 100,
        type: 'none',
        isShow: true,
        isFixed: false
      }, {
        label: "体积(立方米)",
        prop: "volume",
        width: 150,
        type: 'none',
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
        label: "产品名称",
        prop: "materialName",
        width: 120,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "套机码 / 单机码 ",
        prop: "materialCode",
        width: 150,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "规格型号",
        prop: "materialSpecification",
        width: 250,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "产品类型",
        prop: "materialType",
        width: 100,
        type: 'select',
        options: [
          {
            label: '套机',
            value: '套机'
          }, {
            label: '单机',
            value: '单机'
          }, {
            label: '内机',
            value: '内机'
          }, {
            label: '外机',
            value: '外机'
          }, {
            label: '配件',
            value: '配件'
          }
        ],
        isShow: true,
        isFixed: false
      }, {
        label: '产品类别',
        prop: 'sort',
        width: 100,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "条码头",
        prop: "barCodeHead",
        width: 100,
        type: 'none',
        isShow: true,
        isFixed: false
      }, {
        label: "重量(kg)",
        prop: "weight",
        width: 100,
        type: 'none',
        isShow: true,
        isFixed: false
      }, {
        label: "体积(立方米)",
        prop: "volume",
        width: 150,
        type: 'none',
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
export default goodsFile
