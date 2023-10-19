
const carTeamFile = {
  namespaced: true,
  state: {
    tableHeader: [
      {
        label: "承运商编码",
        prop: "carrierCode",
        width: 250,
        type: 'text',
        isShow: false,
        isFixed: false
      }, {
        label: "承运商名称",
        prop: "carrierName",
        width: 150,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "承运商简称",
        prop: "carrierShortName",
        width: 150,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "承运商属性",
        prop: "carrierAttribute",
        width: 100,
        type: 'select',
        options: [{
          label: '车队',
          value: '车队'
        }, {
          label: '终端网点',
          value: '终端网点'
        }],
        isShow: true,
        isFixed: false
      }, {
        label: "承运商等级",
        prop: "carrierLevel",
        width: 100,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "状态",
        prop: "carrierState",
        width: 100,
        type: 'select',
        options: [{
          value: '有效',
          label: '有效'
        }, {
          value: '无效',
          label: '无效'
        }],
        isShow: true,
        isFixed: false
      }, {
        label: "联系人",
        prop: "carrierLinkman",
        width: 100,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "联系电话",
        prop: "linkmanPhone",
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "备注",
        prop: "comment",
        width: 250,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "纳税人识别号",
        prop: "taxpayerId",
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "户名",
        prop: "accountName",
        width: 100,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "开户行名称",
        prop: "bankName",
        width: 150,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "银行账号",
        prop: "bankAccount",
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "备注",
        prop: "comment",
        width: 250,
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
        label: "承运商编码",
        prop: "carrierCode",
        width: 250,
        type: 'text',
        isShow: false,
        isFixed: false
      }, {
        label: "承运商名称",
        prop: "carrierName",
        width: 150,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "承运商简称",
        prop: "carrierShortName",
        width: 150,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "承运商属性",
        prop: "carrierAttribute",
        width: 100,
        type: 'select',
        options: [{
          label: '车队',
          value: '车队'
        }, {
          label: '终端网点',
          value: '终端网点'
        }],
        isShow: true,
        isFixed: false
      }, {
        label: "承运商等级",
        prop: "carrierLevel",
        width: 100,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "状态",
        prop: "carrierState",
        width: 100,
        type: 'select',
        options: [{
          value: '有效',
          label: '有效'
        }, {
          value: '无效',
          label: '无效'
        }],
        isShow: true,
        isFixed: false
      }, {
        label: "联系人",
        prop: "carrierLinkman",
        width: 100,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "联系电话",
        prop: "linkmanPhone",
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "备注",
        prop: "comment",
        width: 250,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "纳税人识别号",
        prop: "taxpayerId",
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "户名",
        prop: "accountName",
        width: 100,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "开户行名称",
        prop: "bankName",
        width: 150,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: "银行账号",
        prop: "bankAccount",
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
export default carTeamFile
