const router = [
    {
        path: '/merchant-center',
        redirect: '/merchant-center/merchant-info',
    },
    {
        path: '/merchant-center/merchant-info',
        name: 'merchantInfo',
        component: () =>
            import('@/views/merchant_center/merchant_info/index.vue'),
        meta: {
            title: $t('商户信息'),
            permiss: 'admin.merchant.info',
        },
    },
    {
        // path: '/merchant-center/recharge',
        path: '/merchant-center/merchant-recharge',
        name: 'merchantRecharge',
        component: () =>
            import('@/views/merchant_center/merchant_recharge/index.vue'),
        meta: {
            title: $t('商户充值'),
            permiss: 'merchant.merchant-recharge.products',
        },
    },
    {
        path: '/merchant-center/merchant-bill',
        name: 'merchantBill',
        component: () =>
            import('@/views/merchant_center/merchant_bill/index.vue'),
        meta: {
            title: $t('商户账单'),
            permiss: 'merchant.merchant-bill.list',
        },
    },
    {
        path: '/merchant-center/bill-change-records',
        name: 'billChangeRecords',
        component: () =>
            import('@/views/merchant_center/bill_change_records/index.vue'),
        meta: {
            title: $t('账变记录'),
            permiss: 'admin.merchant-account.accountLogList',
        },
    },
    {
        path: '/merchant-center/recharge-records',
        name: 'rechargeRecords',
        component: () =>
            import('@/views/merchant_center/recharge_records/index.vue'),
        meta: {
            title: $t('充值记录'),
            permiss: 'merchant.merchant-recharge.list',
        },
    },
    {
        path: '/merchant-center/early-warning-explain',
        name: 'earlyWarningExplain',
        component: () =>
            import('@/views/merchant_center/early_warning_explain/index.vue'),
        meta: {
            title: $t('站点预警说明'),
            permiss: 'admin.merchant-level-config.riskList',
        },
    },
    {
        path: '/merchant-center/site-rebate-bill',
        name: 'siteRebateBill',
        component: () => import('@/views/common_page/index.vue'),
        meta: {
            title: $t('站点返利账单'),
            permiss: '1',
        },
    },
]

export default router
