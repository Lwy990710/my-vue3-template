
const check = {
  namespaced: true,
  state: {
    tableHeader: [
      {
        title: "盘点单号",
        dataKey: "inventorySheetOrderCode",
        key: 'inventorySheetOrderCode',
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        title: "流程状态",
        dataKey: "processStatus",
        key: 'processStatus',
        width: 200,
        type: 'select',
        options: [{
          label: '制单',
          value: 'INVENTORY_SHEET_CREATE'
        }, {
          label: '审核',
          value: 'INVENTORY_SHEET_AUDIT'
        }, {
          label: '归档',
          value: 'INVENTORY_SHEET_DOC'
        }],
        isShow: true,
        isFixed: false
      }, {
        title: "盘点日期",
        dataKey: "inventorySheetDate",
        key: 'inventorySheetDate',
        width: 200,
        type: 'date',
        isShow: true,
        isFixed: false
      }, {
        title: "盈亏总数量",
        dataKey: "profitAndLossQuantitySum",
        key: 'profitAndLossQuantitySum',
        width: 200,
        type: 'none',
        isShow: true,
        isFixed: false
      }, {
        title: "备注",
        dataKey: "comment",
        key: 'comment',
        width: 200,
        isShow: true,
        isFixed: false
      }, {
        title: "创建时间",
        dataKey: "createTime",
        key: 'createTime',
        width: 200,
        type: 'none',
        isShow: true,
        isFixed: false
      }, {
        title: "创建人",
        dataKey: "createUserName",
        key: 'createUserName',
        width: 200,
        type: 'none',
        isShow: true,
        isFixed: false
      }, {
        title: "更新时间",
        dataKey: "updateTime",
        key: 'updateTime',
        width: 200,
        type: 'none',
        isShow: true,
        isFixed: false
      }, {
        title: "更新人",
        dataKey: "updateUserName",
        key: 'updateUserName',
        width: 200,
        type: 'none',
        isShow: true,
        isFixed: false
      }
    ],
    defaultTableHeader: [
      {
        title: "盘点单号",
        dataKey: "inventorySheetOrderCode",
        key: 'inventorySheetOrderCode',
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        title: "流程状态",
        dataKey: "processStatus",
        key: 'processStatus',
        width: 200,
        type: 'select',
        options: [{
          label: '制单',
          value: 'INVENTORY_SHEET_CREATE'
        }, {
          label: '审核',
          value: 'INVENTORY_SHEET_AUDIT'
        }, {
          label: '归档',
          value: 'INVENTORY_SHEET_DOC'
        }],
        isShow: true,
        isFixed: false
      }, {
        title: "盘点日期",
        dataKey: "inventorySheetDate",
        key: 'inventorySheetDate',
        width: 200,
        type: 'date',
        isShow: true,
        isFixed: false
      }, {
        title: "盈亏总数量",
        dataKey: "profitAndLossQuantitySum",
        key: 'profitAndLossQuantitySum',
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        title: "备注",
        dataKey: "comment",
        key: 'comment',
        width: 200,
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
export default check
