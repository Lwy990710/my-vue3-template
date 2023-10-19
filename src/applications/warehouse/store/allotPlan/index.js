const allotPlan = {
  namespaced: true,
  state: {
    tableHeader: [
      {
        title: "是否紧急调拨",
        dataKey: "isUrgent",
        key: "isUrgent",
        width: 180,
        isShow: true,
        isFixed: true,
        type: 'select',
        options: [{
          label: '是',
          value: '是'
        }, {
          label: '否',
          value: '否'
        }]
      }, {
        title: "仓库名称",
        dataKey: "warehouseName",
        key: "warehouseName",
        width: 200,
        type: 'dialog',
        isShow: true,
        isFixed: false
      },
      {
        title: "套机码 / 单机码",
        dataKey: "materialCode",
        key: "materialCode",
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        title: "规格型号",
        dataKey: "materialSpecification",
        key: "materialSpecification",
        width: 400,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        title: "商品名称",
        dataKey: "materialName",
        key: "materialName",
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        title: "类型",
        dataKey: "materialType",
        key: "materialType",
        width: 200,
        type: 'select',
        isShow: true,
        isFixed: false,
        options: [{
          label: '套机',
          value: '套机'
        }, {
          label: '单机',
          value: '单机'
        }]
      }, {
        title: "最大可调拨数",
        dataKey: "canBeAllocationNumber",
        key: "canBeAllocationNumber",
        width: 200,
        type: 'none',
        isShow: true,
        isFixed: false
      }, {
        title: "安全库存",
        dataKey: "safeNumber",
        key: "safeNumber",
        width: 200,
        type: 'none',
        isShow: true,
        isFixed: false
      }, {
        title: "最少调拨数量",
        dataKey: "lackOfNumber",
        key: "lackOfNumber",
        width: 200,
        type: 'none',
        isShow: true,
        isFixed: false
      }, {
        title: "前置仓数量",
        dataKey: "wareHouseNumber",
        key: "wareHouseNumber",
        width: 200,
        type: 'none',
        isShow: true,
        isFixed: false
      }
    ],
    defaultTableHeader: [
      {
        title: "是否紧急调拨",
        dataKey: "isUrgent",
        key: "isUrgent",
        width: 180,
        isShow: true,
        isFixed: true,
        type: 'select',
        options: [{
          label: '是',
          value: '是'
        }, {
          label: '否',
          value: '否'
        }]
      }, {
        title: "仓库名称",
        dataKey: "warehouseName",
        key: "warehouseName",
        width: 200,
        type: 'dialog',
        isShow: true,
        isFixed: false
      },
      {
        title: "套机码 / 单机码",
        dataKey: "materialCode",
        key: "materialCode",
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        title: "规格型号",
        dataKey: "materialSpecification",
        key: "materialSpecification",
        width: 400,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        title: "商品名称",
        dataKey: "materialName",
        key: "materialName",
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        title: "类型",
        dataKey: "materialType",
        key: "materialType",
        width: 200,
        type: 'select',
        isShow: true,
        isFixed: false,
        options: [{
          label: '套机',
          value: '套机'
        }, {
          label: '单机',
          value: '单机'
        }]
      }, {
        title: "最大可调拨数",
        dataKey: "canBeAllocationNumber",
        key: "canBeAllocationNumber",
        width: 200,
        type: 'none',
        isShow: true,
        isFixed: false
      }, {
        title: "安全库存",
        dataKey: "safeNumber",
        key: "safeNumber",
        width: 200,
        type: 'none',
        isShow: true,
        isFixed: false
      }, {
        title: "最少调拨数量",
        dataKey: "lackOfNumber",
        key: "lackOfNumber",
        width: 200,
        type: 'none',
        isShow: true,
        isFixed: false
      }, {
        title: "前置仓数量",
        dataKey: "wareHouseNumber",
        key: "wareHouseNumber",
        width: 200,
        type: 'none',
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
export default allotPlan
