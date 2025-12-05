const router = [
    {
        path: '/dealer-manage',
        redirect: '/dealer-manage/dealer-list',
    },
    {
        // path: '/dealer/dealer-list',
        path: '/dealer-manage/dealer-list',
        name: 'dealerList',
        component: () => import('@/views/dealer_manage/dealer_list/index.vue'),
        meta: {
            title: $t('经销商列表'),
            permiss: 'merchant.dealer.managerList',
        },
    },
    // {
    //     // path: '/dealer/dealer-config',
    //     path: '/dealer-manage/dealer-config',
    //     name: 'dealerConfig',
    //     component: () =>
    //         import('@/views/dealer_manage/dealer_config/index.vue'),
    //     meta: {
    //         title: $t('经销商配置'),
    //         permiss: 'merchant.dealer.awardCfgList',
    //     },
    // },
    {
        // path: '/dealer/dealer-bill-change',
        path: '/dealer-manage/dealer-bill-change',
        name: 'dealerBillChange',
        component: () =>
            import('@/views/dealer_manage/dealer_bill_change/index.vue'),
        meta: {
            title: $t('经销商账变'),
            permiss: 'merchant.user-coin-log.dealerChanges',
        },
    },
    {
        // path: '/dealer/dealer-audit',
        path: '/dealer-manage/dealer-audit',
        name: 'dealerAudit',
        component: () => import('@/views/dealer_manage/dealer_audit/index.vue'),
        meta: {
            title: $t('经销商审核'),
            permiss: 'merchant.dealer.list',
        },
    },
    {
        // path: '/dealer/dealer-reward-log',
        path: '/dealer-manage/dealer-reward-log',
        name: 'dealerRewardLog',
        component: () =>
            import('@/views/dealer_manage/dealer_reward_log/index.vue'),
        meta: {
            title: $t('经销商领奖记录'),
            permiss: 'merchant.dealer.rewardLogList',
        },
    },
]

export default router
