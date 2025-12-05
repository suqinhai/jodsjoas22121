
const router = [
    {
        path: '/operating-center',
        redirect: '/operating-center/platform-announcement',
    },
    {
        // path: '/merchant-center/messages',
        path: '/operating-center/platform-announcement',
        name: 'platformAnnouncement',
        component: () =>
            import('@/views/operating_center/platform_announcement/index.vue'),
        meta: {
            title: $t('平台公告'),
            permiss: 'admin.merchant-msg.list',
        },
    },
    {
        // path: '/data-center/notification',
        path: '/operating-center/notification-push',
        name: 'notificationPush',
        component: () =>
            import('@/views/operating_center/notification_push/index.vue'),
        meta: {
            title: $t('消息推送'),
            permiss: 'admin.msg.list',
        },
    },
    {
        // path: '/discounts-center/income-account',
        path: '/operating-center/income-account-setting',
        name: 'incomeAccountSetting',
        component: () =>
            import('@/views/operating_center/income_account_setting/index.vue'),
        meta: {
            title: $t('存钱宝设置'),
            permiss: 'merchant.income.rule',
        },
    },
    {
        // path: '/data-center/publicity',
        path: '/operating-center/publicity-manage',
        name: 'publicityManage',
        component: () =>
            import('@/views/operating_center/publicity_manage/index.vue'),
        meta: {
            title: $t('宣传管理'),
            permiss: 'merchant.site-banner.list',
        },
    },
    {
        // path: '/discounts-center/task-center',
        path: '/operating-center/task-center',
        name: 'taskCenter',
        component: () =>
            import('@/views/operating_center/task_center/index.vue'),
        meta: {
            title: $t('任务中心'),
            permiss: 'merchant.user-task-config.view',
        },
    },
    {
        path: '/operating-center/agent-award',
        name: 'agentAward',
        component: () => import('@/views/common_page/index.vue'),
        meta: {
            title: $t('代理奖励'),
            permiss: '1',
        },
    },
    {
        // path: '/discounts-center/real-time-rebate',
        path: '/operating-center/member-rebate',
        name: 'memberRebate',
        component: () =>
            import('@/views/operating_center/member_rebate/index.vue'),
        meta: {
            title: $t('会员返利'),
            permiss: 'merchant.rebate-config.list',
        },
    },
    {
        // path: '/discounts-center/activity-center',
        path: '/operating-center/activity-center',
        name: 'activityCenter',
        component: () =>
            import('@/views/operating_center/activity_center/index.vue'),
        meta: {
            title: $t('活动中心'),
            permiss: 'merchant.promotion.list',
        },
    },

    {
        path: '/operating-center/advertising-event-tracking',
        name: 'advertisingEventTracking',
        component: () => import('@/views/common_page/index.vue'),
        meta: {
            title: $t('广告埋点'),
            permiss: '1',
        },
    },
    {
        path: '/operating-center/user-activate',
        name: 'userActivate',
        component: () => import('@/views/common_page/index.vue'),
        meta: {
            title: $t('用户激活'),
            permiss: '1',
        },
    },
    {
        path: '/operating-center/phone-number-collect',
        name: 'phoneNumberCollect',
        component: () => import('@/views/common_page/index.vue'),
        meta: {
            title: $t('手机号码采集'),
            permiss: '1',
        },
    },
    {
        path: '/operating-center/turntable-setting',
        name: 'turntableSetting',
        component: () => import('@/views/common_page/index.vue'),
        meta: {
            title: $t('转盘设置'),
            permiss: '1',
        },
    },
    {
        path: '/operating-center/vip-setting',
        name: 'vipSetting',
        component: () => import('@/views/common_page/index.vue'),
        meta: {
            title: $t('VIP设置'),
            permiss: '1',
        },
    },
    {
        path: '/operating-center/infinite-agent',
        name: 'infiniteAgent',
        component: () => import('@/views/common_page/index.vue'),
        meta: {
            title: $t('无限代理'),
            permiss: '1',
        },
    },
    {
        path: '/operating-center/withdraw-setting',
        name: 'withdrawSetting',
        component: () => import('@/views/common_page/index.vue'),
        meta: {
            title: $t('提现设置'),
            permiss: '1',
        },
    },
    {
        path: '/operating-center/recharge-award-setting',
        name: 'rechargeAwardSetting',
        component: () => import('@/views/common_page/index.vue'),
        meta: {
            title: $t('充值奖励设置'),
            permiss: '1',
        },
    },
    {
        path: '/operating-center/member-level',
        name: 'memberLevel',
        component: () => import('@/views/common_page/index.vue'),
        meta: {
            title: $t('会员层级'),
            permiss: '1',
        },
    },
    {
        path: '/operating-center/activity-part-setting',
        name: 'activityPartSetting',
        component: () => import('@/views/common_page/index.vue'),
        meta: {
            title: $t('活动参与设置'),
            permiss: '1',
        },
    },
    {
        path: '/operating-center/activity-ranking-statistics',
        name: 'activityRankingStatistics',
        component: () =>
            import(
                '@/views/operating_center/activity_ranking_statistics/index.vue'
            ),
        meta: {
            title: $t('活动排行榜统计'),
            permiss: 'merchant.promotion.rankList',
        },
    },
    {
        path: '/operating-center/rookie-task-review',
        name: 'rookieTaskReview',
        component: () =>
            import('@/views/operating_center/rookie_task_review/index.vue'),
        meta: {
            title: '任务派奖审核',
            permiss: 'merchant.user-task-config.reviewList',
        },
    },
    {
        path: '/operating-center/activity-review',
        name: 'newRookieTaskReview',
        component: () =>
            import('@/views/operating_center/activity-review/index.vue'),
        meta: {
            title: '人工审核',
            permiss: '1',
        },
    },
    {
        path: '/operating-center/ticket-center',
        name: 'ticketCenter',
        component: () =>
            import('@/views/operating_center/ticket_center/index.vue'),
        meta: {
            title: $t('票券中心'),
            permiss: 'merchant.ticket.list',
        },
    },
    {
        path: '/operating-center/ad-consump-entry',
        name: 'adConsumpEntry',
        component: () =>
            import('@/views/operating_center/ad_consump_entry/index.vue'),
        meta: {
            title: $t('广告消耗录入'),
            permiss: 'merchant.merchant-other-fee-log.addOrEdit',
        },
    },
    {
        path: '/operating-center/advise-platform',
        name: 'advisePlatform',
        component: () =>
            import('@/views/operating_center/advise_platform/index.vue'),
        meta: {
            title: $t('给平台提建议'),
            permiss: 'merchant.feedback.list',
        },
    },
    {
        path: '/operating-center/operating-expense-entry',
        name: 'operatingExpenseEntry',
        component: () =>
            import(
                '@/views/operating_center/operating_expense_entry/index.vue'
            ),
        meta: {
            title: $t('运营费用录入'),
            permiss: 'merchant.merchant-other-fee-log.enterFee',
        },
    },
    {
        path: '/operating-center/ticket-usage-records',
        name: 'ticketUsageRecords',
        component: () =>
            import('@/views/operating_center/ticket_usage_records/index.vue'),
        meta: {
            title: $t('票券使用记录'),
            permiss: 'merchant.ticket.useList',
        },
    },
    {
        path: '/operating-center/dealer-model-list',
        name: 'dealerModelList',
        component: () =>
            import('@/views/operating_center/dealer_model_list/index.vue'),
        meta: {
            title: '经销商模式列表',
            permiss: 'merchant.dealer-model.list',
        },
    },
    {
        path: '/operating-center/influencer-ranking-award',
        name: 'influencerRankingAward',
        component: () =>
            import(
                '@/views/operating_center/influencer_ranking_award/index.vue'
            ),
        meta: {
            title: '网红排行榜奖励',
            permiss: 'merchant.blogger.rankList',
        },
    },
    {
        path: '/operating-center/influencer-ranking-record',
        name: 'influencerRankingRecord',
        component: () =>
            import(
                '@/views/operating_center/influencer_ranking_record/index.vue'
            ),
        meta: {
            title: '网红排行榜记录',
            permiss: 'merchant.blogger.rewardLog',
        },
    },
    {
        path: '/operating-center/member-complaint',
        name: 'memberComplaint',
        component: () =>
            import('@/views/operating_center/member_complaint/index.vue'),
        meta: {
            title: '会员投诉列表',
            permiss: 'merchant.feedback.list',
        },
    },
    {
        path: '/operating-center/operation-risk-set',
        name: 'operationRiskSet',
        component: () =>
            import('@/views/operating_center/operation_risk_set/index.vue'),
        meta: {
            title: '活动风险配置',
            permiss: 'merchant.promotion.riskConfigList',
        },
    },
]

export default router
