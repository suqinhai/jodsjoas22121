const router = [
    {
        path: '/agent-merchant-manage',
        redirect: '/agent-merchant-manage/agent-dividend-record',
    },
    {
        // path: '/agent-system/agent-dividend-record',
        path: '/agent-merchant-manage/agent-dividend-record',
        name: 'agentDividendRecord',
        component: () =>
            import(
                '@/views/agent_merchant_manage/agent_dividend_record/index.vue'
            ),
        meta: {
            title: $t('线下代理分红记录'),
            permiss: 'merchant.agent-coin-log.commissionChanges',
        },
    },
    {
        // path: '/agent-system/allocation-loan-limit',
        path: '/agent-merchant-manage/allocation-loan-limit',
        name: 'allocationLoanLimit',
        component: () =>
            import(
                '@/views/agent_merchant_manage/allocation_loan_limit/index.vue'
            ),
        meta: {
            title: $t('出款额度配置'),
            permiss: 'merchant.agent-coin-log.adjustList',
        },
    },
    {
        // path: '/agent-system/agent-ratio-config',
        path: '/agent-merchant-manage/agent-ratio-config',
        name: 'agentRatioConfig',
        component: () =>
            import(
                '@/views/agent_merchant_manage/agent_ratio_config/index.vue'
            ),
        meta: {
            title: $t('代理商比例配置'),
            permiss: 'merchant.agent-manage.shareList',
        },
    },
    {
        // path: '/agent-system/agent-list',
        path: '/agent-merchant-manage/agent-list',
        name: 'agentManageList',
        component: () =>
            import('@/views/agent_merchant_manage/agent_list/index.vue'),
        meta: {
            title: $t('代理商列表'),
            permiss: 'merchant.agent-manage.list',
        },
    },
]

export default router
