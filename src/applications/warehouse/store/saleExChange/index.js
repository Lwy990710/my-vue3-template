
const saleExChange = {
  namespaced: true,
  state: {
    tableHeader: [
      {
        title: "流程状态",
        dataKey: "processStatus",
        key: 'processStatus',
        width: 150,
        isShow: true,
        isFixed: false,
        type: 'select',
        options: [{
          label: '制单',
          value: 'MER_ALLOCATION_ORDER_CREATE'
        }, {
          label: '审核中',
          value: 'MER_ALLOCATION_ORDER_AUDIT'
        }, {
          label: '归档',
          value: 'MER_ALLOCATION_ORDER_DOC'
        }]
      }, {
        title: "调拨单号",
        dataKey: "merchantAllocationOrderCode",
        key: 'merchantAllocationOrderCode',
        width: 180,
        isShow: true,
        isFixed: false,
        type: 'text'
      }, {
        title: "发起商家",
        dataKey: "upMerchantName",
        key: 'upMerchantName',
        width: 300,
        isShow: true,
        isFixed: false,
        type: 'text'
      }, {
        title: "目的商家",
        dataKey: "inMerchantName",
        key: 'inMerchantName',
        width: 300,
        isShow: true,
        isFixed: false,
        type: 'text'
      }, {
        title: "打印次数",
        dataKey: "numberOfPrints",
        key: 'numberOfPrints',
        width: 150,
        isShow: true,
        isFixed: false,
        type: 'none'
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
        title: "流程状态",
        dataKey: "processStatus",
        key: 'processStatus',
        width: 150,
        isShow: true,
        isFixed: false,
        type: 'select',
        options: [{
          label: '制单',
          value: 'MER_ALLOCATION_ORDER_CREATE'
        }, {
          label: '审核中',
          value: 'MER_ALLOCATION_ORDER_AUDIT'
        }, {
          label: '归档',
          value: 'MER_ALLOCATION_ORDER_DOC'
        }]
      }, {
        title: "调拨单号",
        dataKey: "merchantAllocationOrderCode",
        key: 'merchantAllocationOrderCode',
        width: 180,
        isShow: true,
        isFixed: false,
        type: 'text'
      }, {
        title: "发起商家",
        dataKey: "upMerchantName",
        key: 'upMerchantName',
        width: 300,
        isShow: true,
        isFixed: false,
        type: 'text'
      }, {
        title: "目的商家",
        dataKey: "inMerchantName",
        key: 'inMerchantName',
        width: 300,
        isShow: true,
        isFixed: false,
        type: 'text'
      }, {
        title: "打印次数",
        dataKey: "numberOfPrints",
        key: 'numberOfPrints',
        width: 150,
        isShow: true,
        isFixed: false,
        type: 'none'
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
export default saleExChange
