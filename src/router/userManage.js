const router = [
    {
        path: '/user-manage',
        redirect: '/user-manage/all-member',
    },
    {
        // path: '/member/list',
        path: '/user-manage/all-member',
        name: 'allMember',
        component: () => import('@/views/user_manage/all_member/index.vue'),
        meta: {
            title: $t('所有会员'),
            permiss: 'admin.user.list',
        },
    },
    {
        path: '/user-manage/credit-score',
        name: 'creditScore',
        component: () => import('@/views/user_manage/credit_score/index.vue'),
        meta: {
            title: $t('信誉分'),
            permiss: 'admin.user.creditList',
        },
    },
    {
        path: '/user-manage/vip-limiting-game',
        name: 'vipLimitingGame',
        component: () => import('@/views/user_manage/vip_limiting_game/index.vue'),
        meta: {
            title: $t('vip余额游戏限制'),
            permiss: 'merchant.vip-balance-ctrl.levelLimitList',
        },
    },
    {
        // path: '/member/promotion-account-setting',
        path: '/user-manage/anchor-account',
        name: 'anchorAccount',
        component: () => import('@/views/user_manage/anchor_account/index.vue'),
        meta: {
            title: $t('主播号'),
            permiss: 'merchant.user-simple-ctrl.teamList',
        },
    },
    {
        // path: '/risk-control/member-level-set',
        path: '/user-manage/member-level-setting',
        name: 'memberLevelSetting',
        component: () =>
            import('@/views/user_manage/member_level_setting/index.vue'),
        meta: {
            title: $t('层级设置'),
            permiss: 'merchant.merchant-layer-config.list',
        },
    },
    {
        // path: '/member/member-tag',
        path: '/user-manage/member-tag',
        name: 'memberTag',
        component: () => import('@/views/user_manage/member_tag/index.vue'),
        meta: {
            title: $t('会员标签'),
            permiss: 'merchant.user-tag.list',
        },
    },
    {
        // path: '/website/vip',
        path: '/user-manage/vip-grade',
        name: 'vipGrade',
        component: () => import('@/views/user_manage/vip_grade/index.vue'),
        meta: {
            title: $t('VIP等级'),
            permiss: 'admin.user-level-config.upgradeList',
        },
    },
    {
        // path: '/member/withdrawal-avoid-first-recharge',
        path: '/user-manage/withdrawal-avoid-first-recharge',
        name: 'withdrawalAvoidFirstRecharge',
        component: () =>
            import(
                '@/views/user_manage/withdrawal_avoid_first_recharge/index.vue'
            ),
        meta: {
            title: $t('会员提现免首充'),
            permiss: 'merchant.user-mark-account.cashIgnoreList',
        },
    },
    {
        // path: '/discounts-center/discounts-statistics',
        path: '/user-manage/discounts-data',
        name: 'discountsData',
        component: () => import('@/views/user_manage/discounts_data/index.vue'),
        meta: {
            title: $t('优惠数据'),
            permiss: 'merchant.promotion.stat',
        },
    },
    {
        // path: '/member/remind-setting',
        path: '/user-manage/bigr-remind-setting',
        name: 'bigRRemindSetting',
        component: () =>
            import('@/views/user_manage/bigr_remind_setting/index.vue'),
        meta: {
            title: $t('大R提醒设置'),
            permiss: 'admin.meta.itemList-10',
        },
    },
    {
        // path: '/member/member-change-vip',
        path: '/user-manage/member-change-vip',
        name: 'memberChangeVip',
        component: () =>
            import('@/views/user_manage/member_change_vip/index.vue'),
        meta: {
            title: $t('会员vip等级调整'),
            permiss: 'merchant.user-level.list',
        },
    },
    {
        // path: '/operation/rewarded-feedback',
        path: '/user-manage/rewarded-feedback',
        name: 'rewardedFeedback',
        component: () =>
            import('@/views/user_manage/rewarded_feedback/index.vue'),
        meta: {
            title: $t('有奖反馈'),
            permiss: 'merchant.feedback.list',
        },
    },
    {
        // path: '/member/balance-rescue-whitelist',
        path: '/user-manage/balance-rescue-whitelist',
        name: 'balanceRescueWhitelist',
        component: () =>
            import('@/views/user_manage/balance_rescue_whitelist/index.vue'),
        meta: {
            title: $t('余额救援金白名单'),
            permiss: 'merchant.promotion-whitelist.reliefBalanceList',
        },
    },
    // {
    //     path: '/user-manage/influencer-account-manage',
    //     name: 'influencerAccountManage',
    //     component: () =>
    //         import('@/views/user_manage/influencer_account_manage/index.vue'),
    //     meta: {
    //         title: '网红账号管理',
    //         permiss: 'merchant.blogger.accountList',
    //     },
    // },
    {
        path: '/user-manage/register-and-security-config',
        name: 'registerAndSecurityConfig',
        component: () => import('@/views/common_page/index.vue'),
        meta: {
            title: $t('注册与安全配置'),
            permiss: '1',
        },
    },
    {
        path: '/user-manage/member-log',
        name: 'memberLog',
        component: () => import('@/views/common_page/index.vue'),
        meta: {
            title: $t('会员日志'),
            permiss: '1',
        },
    },
    {
        path: '/user-manage/member-login-audit',
        name: 'memberLoginAudit',
        component: () => import('@/views/common_page/index.vue'),
        meta: {
            title: $t('会员登录稽核'),
            permiss: '1',
        },
    },
]

export default router
