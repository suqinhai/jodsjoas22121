const router = [
    {
        path: '/risk-center',
        redirect: '/risk-center/game-profit-monitor',
    },
    {
        // path: '/risk-control/blacklist',
        path: '/risk-center/blacklist',
        name: 'blacklist',
        component: () => import('@/views/risk_center/blacklist/index.vue'),
        meta: {
            title: $t('黑名单'),
            permiss: 'admin.user-blacklist.listUser',
        },
    },
    {
        // path: '/risk-control/brush-monitoring',
        path: '/risk-center/brush-monitoring',
        name: 'brushMonitoring',
        component: () =>
            import('@/views/risk_center/brush_monitoring/index.vue'),
        meta: {
            title: $t('刷子监控'),
            permiss: 'admin.user-bot-spy.list',
        },
    },
    {
        // path: '/risk-control/game-profit-monitor',
        path: '/risk-center/game-profit-monitor',
        name: 'gameProfitMonitor',
        component: () =>
            import('@/views/risk_center/game_profit_monitor/index.vue'),
        meta: {
            title: $t('游戏获利监控'),
            permiss: 'admin.user-profit-spy-log.list',
        },
    },
    // {
    //     // path: '/risk-control/game-pool-switch',
    //     path: '/risk-center/game-adjust-control',
    //     name: 'gameAdjustControl',
    //     component: () =>
    //         import('@/views/risk_center/game_adjust_control/index.vue'),
    //     meta: {
    //         title: $t('游戏调控'),
    //         permiss: 'admin.user-control-stat.gameStat',
    //     },
    // },
    {
        // path: '/risk-control/member-adjust-control',
        path: '/risk-center/member-adjust-control',
        name: 'memberAdjustControl',
        component: () =>
            import('@/views/risk_center/member_adjust_control/index.vue'),
        meta: {
            title: $t('会员调控'),
            permiss: 'admin.user-game-control.list',
        },
    },
    {
        path: '/risk-center/member-adjust-control-bpg',
        name: 'memberAdjustControlBpg',
        component: () =>
            import('@/views/risk_center/member_adjust_control_bpg/index.vue'),
        meta: {
            title: $t('BPG会员调控'),
            permiss: 'admin.user-simple-ctrl.list',
        },
    },
    {
        path: '/risk-center/member-adjust-control-bbgt',
        name: 'memberAdjustControlBbgt',
        component: () =>
            import('@/views/risk_center/member_adjust_control_bbgt/index.vue'),
        meta: {
            title: 'BBGT会员调控',
            permiss: 'merchant.user-simple-ctrl.list',
        },
    },
    {
        // path: '/risk-control/adjust-control-member-limit',
        path: '/risk-center/adjust-control-member-limit',
        name: 'adjustControlMemberLimit',
        component: () =>
            import('@/views/risk_center/adjust_control_member_limit/index.vue'),
        meta: {
            title: $t('调控会员限玩列表'),
            permiss: 'merchant.game-play-limit.list',
        },
    },
]

export default router
