const router = [
    {
        path: '/game-center',
        redirect: '/game-center/bet-log',
    },
    {
        // path: '/statistics-report/bet-log',
        path: '/game-center/bet-log',
        name: 'betLog',
        component: () => import('@/views/game_center/bet_log/index.vue'),
        meta: {
            title: $t('投注记录'),
            permiss: 'admin.game-play-log.list',
        },
    },
    {
        // path: '/statistics-report/bet-log/statistics',
        path: '/game-center/bet-log/statistics',
        name: 'betLogStatisticsDetail',
        component: () =>
            import(
                '@/views/game_center/bet_log/bet_statistics_detail/index.vue'
            ),
        meta: {
            title: $t('游戏内容详情'),
            permiss: 'admin.game-play-log.list',
        },
    },
    {
        // path: '/statistics-report/game-report',
        path: '/game-center/game-statistics',
        name: 'gameStatistics',
        component: () =>
            import('@/views/game_center/game_statistics/index.vue'),
        meta: {
            title: $t('游戏统计'),
            permiss: 'merchant.report.game',
        },
    },
    {
        // path: '/merchant-center/game-manage',
        path: '/game-center/game-platform-list',
        name: 'gamePlatformList',
        component: () =>
            import('@/views/game_center/game_platform_list/index.vue'),
        meta: {
            title: $t('游戏平台列表'),
            permiss: 'merchant.merchant-vendor.list',
        },
    },
    {
        // path: '/merchant-center/game-child-manage',
        path: '/game-center/child-game-list',
        name: 'childGameList',
        component: () =>
            import('@/views/game_center/child_game_list/index.vue'),
        meta: {
            title: $t('子游戏列表'),
            permiss: 'merchant.merchant-game.list',
        },
    },
    {
        // path: '/merchant-center/game-hot-manage',
        path: '/game-center/game-hot-manage',
        name: 'gameHotManage',
        component: () =>
            import('@/views/game_center/game_hot_manage/index.vue'),
        meta: {
            title: $t('热门管理'),
            permiss: 'merchant.merchant-game.hotList',
        },
    },
    {
        // path: '/merchant-center/new-vender-apply',
        path: '/game-center/new-vender-apply',
        name: 'newVenderApply',
        component: () =>
            import('@/views/game_center/new_vender_apply/index.vue'),
        meta: {
            title: $t('新厂家申请'),
            permiss: 'merchant.merchant-vendor.applyList',
        },
    },
    {
        // path: '/website/home',
        path: '/game-center/game-type-setting',
        name: 'gameTypeSetting',
        component: () =>
            import('@/views/game_center/game_type_setting/index.vue'),
        meta: {
            title: $t('游戏类型设置'),
            permiss: 'merchant.app.gameTypeSetting',
        },
    },
    {
        path: '/game-center/user-winning-rank',
        name: 'userWinningRank',
        component: () =>
            import('@/views/game_center/user_winning_rank/index.vue'),
        meta: {
            title: '中奖排行管理',
            permiss: 'merchant.user-winning-rank.list',
        },
    },
]

export default router
