const router = [
    {
        path: '/data-report',
        redirect: '/data-report/daily-operation-report',
    },
    {
        // path: '/statistics-report/operation-statistics',
        path: '/data-report/daily-operation-report',
        name: 'dailyOperationReport',
        component: () =>
            import('@/views/data_report/daily_operation_report/index.vue'),
        meta: {
            title: $t('日运营报表'),
            permiss: 'merchant.report.userDetailDailyList',
        },
    },
    {
        // path: '/statistics-report/retention-statistics',
        path: '/data-report/retention-summary',
        name: 'retentionSummary',
        component: () =>
            import('@/views/data_report/retention_summary/index.vue'),
        meta: {
            title: '首充留存报表',
            permiss: 'merchant.report.rechargeRetentionList',
        },
    },
    // {
    //     // path: '/statistics-report/roi-data-statistics',
    //     path: '/data-report/recover-data',
    //     name: 'recoverData',
    //     component: () => import('@/views/data_report/recover_data/index.vue'),
    //     meta: {
    //         title: $t('回收数据'),
    //         permiss: 'merchant.channel.roiDailyStatList',
    //     },
    // },
    {
        path: '/data-report/launch-data-summary',
        name: 'launchDataSummary',
        component: () =>
            import('@/views/data_report/launch_data_summary/index.vue'),
        meta: {
            title: $t('投放数据报表'),
            permiss: 'merchant.channel.roiDailyStatList',
        },
    },
    {
        // path: '/statistics-report/agent-report',
        path: '/data-report/agent-report',
        name: 'agentReport',
        component: () => import('@/views/data_report/agent_report/index.vue'),
        meta: {
            title: $t('代理报表'),
            permiss: 'merchant.agent.settleDailyList',
        },
    },
    {
        // path: '/statistics-report/member-report',
        path: '/data-report/member-report',
        name: 'memberReport',
        component: () => import('@/views/data_report/member_report/index.vue'),
        meta: {
            title: $t('会员报表'),
            permiss: 'merchant.report.userDetailList',
        },
    },
    {
        // path: '/discounts-center/income-account-details',
        path: '/data-report/income-account-detail',
        name: 'incomeAccountDetail',
        component: () =>
            import('@/views/data_report/income_account_detail/index.vue'),
        meta: {
            title: $t('存钱宝明细'),
            permiss: 'merchant.income.logs',
        },
    },
    {
        // path: '/statistics-report/vip-recharge-cash-diff',
        path: '/data-report/vip-recharge-cash-diff',
        name: 'vipRechargeCashDiff',
        component: () =>
            import('@/views/data_report/vip_recharge_cash_diff/index.vue'),
        meta: {
            title: $t('VIP升级统计'),
            permiss: 'merchant.vip-recharge-cash-stat.currentList',
        },
    },
    {
        // path: '/statistics-report/player-report',
        path: '/data-report/bigr-player-report',
        name: 'bigRPlayerReport',
        component: () =>
            import('@/views/data_report/bigr_player_report/index.vue'),
        meta: {
            title: $t('大R玩家报表'),
            permiss: 'merchant.report.userRechargeLevelList',
        },
    },
    {
        // path: '/statistics-report/dealer-report',
        path: '/data-report/dealer-report',
        name: 'dealerReport',
        component: () => import('@/views/data_report/dealer_report/index.vue'),
        meta: {
            title: $t('经销商报表'),
            permiss: 'merchant.dealer.settleDailyList',
        },
    },
    {
        // path: '/statistics-report/export-download',
        path: '/data-report/export-download',
        name: 'exportDownload',
        component: () =>
            import('@/views/data_report/export_download/index.vue'),
        meta: {
            title: $t('导出下载'),
            permiss: '1',
        },
    },
    {
        path: '/data-report/agent-report-summary',
        name: 'agentReportSummary',
        component: () =>
            import('@/views/data_report/agent_report_summary/index.vue'),
        meta: {
            title: $t('代理数据报表'),
            permiss: 'merchant.agent.agentDayStat',
        },
    },
    {
        path: '/data-report/influencer-report',
        name: 'influencerReport',
        component: () =>
            import('@/views/data_report/influencer_report/index.vue'),
        meta: {
            title: $t('网红数据报表'),
            permiss: 'merchant.blogger.dayList',
        },
    },
    {
        path: '/data-report/recharge-withdraw-data',
        name: 'rechargeWithdrawData',
        component: () => import('@/views/common_page/index.vue'),
        meta: {
            title: $t('充值提现数据'),
            permiss: '1',
        },
    },
    {
        path: '/data-report/site-data',
        name: 'siteData',
        component: () => import('@/views/common_page/index.vue'),
        meta: {
            title: $t('站点数据'),
            permiss: '1',
        },
    },
    {
        path: '/data-report/discounts-report',
        name: 'promotionReport',
        component: () =>
            import('@/views/data_report/discounts_report/index.vue'),
        meta: {
            title: $t('优惠数据报表'),
            permiss: 'merchant.report.promotionReport',
        },
    },
    {
        path: '/data-report/synthesis-report',
        name: 'synthesisReport',
        component: () =>
            import('@/views/data_report/synthesis_report/index.vue'),
        meta: {
            title: $t('综合数据报表'),
            permiss: 'merchant.report.comprehensive',
        },
    },
    {
        path: '/data-report/game-people-report',
        name: 'gamePeopleReport',
        component: () =>
            import('@/views/data_report/game_people_report/index.vue'),
        meta: {
            title: $t('游戏人数报表'),
            permiss: 'merchant.report.playerCount',
        },
    },
    {
        path: '/data-report/platform-cost-detail',
        name: 'platformCostDetail',
        component: () =>
            import('@/views/data_report/platform_cost_detail/index.vue'),
        meta: {
            title: '平台费用详情',
            permiss: 'merchant.merchant-fee-stat.list',
        },
    },
    {
        path: '/data-report/newly-added-data-report',
        name: 'newlyAddedDataReport',
        component: () =>
            import('@/views/data_report/newly_added_data_report/index.vue'),
        meta: {
            title: '新增数据报表',
            permiss: 'merchant.report.addDataStat',
        },
    },
    {
        path: '/data-report/bet-amount-statistics',
        name: 'betAmountStatistics',
        component: () =>
            import('@/views/data_report/bet_amount_statistics/index.vue'),
        meta: {
            title: '游戏投注数据',
            permiss: 'admin.report.gameDailyStat',
        },
    },
    {
        path: '/data-report/user-recharge-analysis',
        name: 'userRechargeAnalysis',
        component: () =>
            import('@/views/data_report/user_recharge_analysis/index.vue'),
        meta: {
            title: '用户充值分析',
            permiss: 'merchant.report.userRechargeAnalyze',
        },
    },
    {
        path: '/data-report/platform-fee-report',
        name: 'platformFeeReport',
        component: () =>
            import('@/views/data_report/platform_fee_report/index.vue'),
        meta: {
            title: '平台费用报表',
            permiss: 'merchant.merchant-fee-stat.report',
        },
    },
    {
        path: '/data-report/dealer-data',
        name: 'dealerData',
        component: () => import('@/views/data_report/dealer_data/index.vue'),
        meta: {
            title: '经销商数据',
            permiss: 'merchant.report.dealerData',
        },
    },
	{
	    path: '/data-report/payment-data-report',
	    name: 'paymentDataReport',
	    component: () => import('@/views/data_report/payment_data_report/index.vue'),
	    meta: {
	        title: '支付数据报表',
	        permiss: 'merchant.recharge-log.channelStat',
	    },
	},
]

export default router
