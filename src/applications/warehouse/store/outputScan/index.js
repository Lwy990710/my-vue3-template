const outputScan = {
  namespaced: true,
  state: {
    tableHeader: [
      {
        label: "出库类型",
        prop: "type",
        width: 200,
        type: 'text',
        isShow: false,
        isFixed: false
      }, {
        label: "单号",
        prop: "orderCode",
        width: 200,
        type: 'text',
        isShow: false,
        isFixed: false
      }, {
        label: "出库单号",
        prop: "outWarehouseCode",
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "提货秘钥",
        prop: "goodsPickingKeys",
        width: 200,
        type: 'text',
        isShow: false,
        isFixed: false
      }, {
        label: "条形码",
        prop: "barCode",
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "商家名称",
        prop: "finalMerchantName",
        width: 100,
        type: 'text',
        isShow: false,
        isFixed: false
      }, {
        label: "商家编码",
        prop: "finalMerchantCode",
        width: 150,
        type: 'text',
        isShow: false,
        isFixed: false
      }, {
        label: "物料代码",
        prop: "materialCode",
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "产品型号",
        prop: "materialSpecification",
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "产品质量",
        prop: "materialStatus",
        width: 100,
        type: 'none',
        isShow: true,
        isFixed: false
      }, {
        label: "产品类型",
        prop: "materialType",
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "仓库名称",
        prop: "warehouseName",
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "仓位名称",
        prop: "warehousePositionName",
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "司机姓名",
        prop: "driverName",
        width: 130,
        type: 'text',
        isShow: false,
        isFixed: false
      }, {
        label: "司机电话",
        prop: "driverPhone",
        width: 130,
        type: 'text',
        isShow: false,
        isFixed: false
      }, {
        label: "车牌号",
        prop: "licensePlateNumber",
        width: 130,
        type: 'text',
        isShow: false,
        isFixed: false
      }, {
        label: "扫码时间",
        prop: "scanTime",
        width: 200,
        type: 'daterange',
        shortcuts: [{
          text: '今日',
          value: () => {
            const end = new Date()
            const start = new Date()
            return [start, end]
          }
        },
        {
          text: '一周内',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            return [start, end]
          }
        },
        {
          text: '30天内',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            return [start, end]
          }
        }],
        isShow: true,
        isFixed: false
      }
    ],
    defaultTableHeader: [
      {
        label: "出库类型",
        prop: "type",
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "单号",
        prop: "orderCode",
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "出库单号",
        prop: "outWarehouseCode",
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "提货秘钥",
        prop: "goodsPickingKeys",
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "条形码",
        prop: "barCode",
        width: 180,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "商家名称",
        prop: "finalMerchantName",
        width: 100,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "商家编码",
        prop: "finalMerchantCode",
        width: 150,
        type: 'text',
        isShow: false,
        isFixed: false
      }, {
        label: "物料代码",
        prop: "materialCode",
        width: 130,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "产品型号",
        prop: "materialSpecification",
        width: 100,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "产品质量",
        prop: "materialStatus",
        width: 100,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "产品类型",
        prop: "materialType",
        width: 100,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "仓库名称",
        prop: "warehouseName",
        width: 130,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "仓位名称",
        prop: "warehousePositionName",
        width: 130,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "司机姓名",
        prop: "driverName",
        width: 130,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "司机电话",
        prop: "driverPhone",
        width: 130,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "车牌号",
        prop: "licensePlateNumber",
        width: 130,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "扫码时间",
        prop: "scanTime",
        width: 200,
        type: 'daterange',
        shortcuts: [{
          text: '今日',
          value: () => {
            const end = new Date()
            const start = new Date()
            return [start, end]
          }
        },
        {
          text: '一周内',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            return [start, end]
          }
        },
        {
          text: '30天内',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            return [start, end]
          }
        }],
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
export default outputScan
