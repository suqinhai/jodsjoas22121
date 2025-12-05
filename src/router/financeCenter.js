const router = [
    {
        path: '/finance_center',
        redirect: '/finance-center/recharge-order-list',
    },
    {
        path: '/finance-center/add-transfer-channel',
        name: 'addTransferChannel',
        component: () => import('@/views/common_page/index.vue'),
        meta: {
            title: $t('新增转账通道'),
            permiss: '1',
        },
    },
    {
        path: '/finance-center/credit-loss',
        name: 'creditLoss',
        component: () => import('@/views/common_page/index.vue'),
        meta: {
            title: $t('额度丢失'),
            permiss: '1',
        },
    },
    // {
    //     path: '/finance-center/add-thirdparty-pay',
    //     name: 'addThirdpartyPay',
    //     component: () =>
    //         import(
    //             '@/views/finance_center/add_pay_channel/add_thirdparty_pay/index.vue'
    //         ),
    //     meta: {
    //         title: $t('新增三方支付'),
    //         permiss: 'admin.merchant-pay-config.list',
    //     },
    // },
    {
        path: '/finance-center/thirdparty-list',
        name: 'thirdpartyList',
        component: () =>
            import('@/views/finance_center/thirdparty_list/index.vue'),
        meta: {
            title: '支付通道数据',
            permiss: 'merchant.recharge-log.dailyChannelStat',
        },
    },
    {
        path: '/finance-center/recharge-order-list',
        name: 'rechargeOrderList',
        component: () =>
            import('@/views/finance_center/recharge_order_list/index.vue'),
        meta: {
            title: '充值订单列表',
            permiss: 'merchant.recharge-log.list',
        },
    },
    {
        path: '/finance-center/withdrawl-order-list',
        name: 'withdrawlOrderList',
        component: () =>
            import('@/views/finance_center/withdrawl_order_list/index.vue'),
        meta: {
            title: '在线提现列表',
            permiss: 'merchant.cash-log.list',
        },
    },
    {
        // path: '/finance/balance-amend',
        path: '/finance-center/artificial-adjust-amount',
        name: 'artificialAdjustAmount',
        component: () =>
            import('@/views/finance_center/artificial_adjust_amount/index.vue'),
        meta: {
            title: $t('人工加扣款'),
            permiss: 'merchant.account.adjustList',
        },
    },
    {
        // path: '/risk-control/wallet-artificial-pull',
        path: '/finance-center/artificial-pull-amend',
        name: 'artificialPullAmend',
        component: () =>
            import('@/views/finance_center/artificial_pull_amend/index.vue'),
        meta: {
            title: $t('人工拉回修正'),
            permiss: 'merchant.account.info',
        },
    },
    {
        // path: '/finance/financial-disbursement/audit-management',
        path: '/finance-center/audit-management',
        name: 'auditManagement',
        component: () =>
            import('@/views/finance_center/audit_manage/index.vue'),
        meta: {
            title: $t('稽核管理'),
            permiss: 'merchant.user-coin-log.auditList',
        },
    },
    {
        // path: '/finance/exchange-rate',
        path: '/finance-center/exchange-rate',
        name: 'exchangeRate',
        component: () =>
            import('@/views/finance_center/exchange_rate/index.vue'),
        meta: {
            title: $t('汇率和银行管理'),
            permiss: 'admin.exchange-rate-config.list',
        },
    },
    {
        // path: '/statistics-report/bill-change-log',
        path: '/finance-center/bill-change-log',
        name: 'billChangeLog',
        component: () =>
            import('@/views/finance_center/bill_change_log/index.vue'),
        meta: {
            title: $t('账变记录'),
            permiss: 'merchant.user-coin-log.changes',
        },
    },
    {
        path: '/finance-center/recharge-channel-list',
        name: 'RechargeChannelList',
        component: () =>
            import('@/views/finance_center/recharge_channel_list/index.vue'),
        meta: {
            title: '充值通道列表',
            permiss: 'admin.merchant-pay-config.channelStat',
        },
    },
    {
        path: '/finance-center/ad-consump-audit',
        name: 'adConsumpAudit',
        component: () =>
            import('@/views/finance_center/ad_consump_audit/index.vue'),
        meta: {
            title: '广告消耗审核',
            permiss: 'merchant.merchant-other-fee-log.review',
        },
    },
    {
        path: '/finance-center/transfer-accounts',
        name: 'TransferAccounts',
        component: () =>
            import('@/views/finance_center/transfer_accounts/index.vue'),
        meta: {
            title: '转账出款列表',
            permiss: 'merchant.cash-log.offlineList',
        },
    },
    {
        path: '/finance-center/transfer-accounts-audit',
        name: 'TransferAccountsAudit',
        component: () =>
            import('@/views/finance_center/transfer_accounts_audit/index.vue'),
        meta: {
            title: '转账审核列表',
            permiss: 'merchant.recharge-log.reviewList',
        },
    },
    {
        path: '/finance-center/member-recharge-config',
        name: 'memberRechargeConfig',
        component: () =>
            import('@/views/finance_center/member_recharge_config/index.vue'),
        meta: {
            title: '会员充值配置',
            permiss: 'admin.user-recharge-config.list',
        },
    },
    {
        path: '/finance-center/member-withdrawl-settings',
        name: 'memberWithdrawlSettings',
        component: () =>
            import(
                '@/views/finance_center/member_withdrawl_settings/index.vue'
            ),
        meta: {
            title: '会员提现配置',
            permiss: 'merchant.user-cash-config.list',
        },
    },
    {
        path: '/finance-center/risk-control-audit',
        name: 'riskControlAudit',
        component: () =>
            import('@/views/finance_center/risk_control_audit/index.vue'),
        meta: {
            title: '提现风控审核',
            permiss: 'merchant.cash-log.riskVerifyCashList',
        },
    },
]

export default router
