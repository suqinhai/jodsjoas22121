const router = [
    {
        path: '/launch-manage',
        redirect: '/launch-manage/channel-report',
    },
    {
        path: '/launch-manage/data-entering',
        name: 'dataEntering',
        component: () => import('@/views/common_page/index.vue'),
        meta: {
            title: $t('数据录入'),
            permiss: '1',
        },
    },
    {
        path: '/launch-manage/data-summarizing',
        name: 'dataSummarizing',
        component: () => import('@/views/common_page/index.vue'),
        meta: {
            title: $t('数据汇总'),
            permiss: '1',
        },
    },
    {
        path: '/launch-manage/channel-detail',
        name: 'channelDetail',
        component: () => import('@/views/common_page/index.vue'),
        meta: {
            title: $t('渠道明细'),
            permiss: '1',
        },
    },
    {
        path: '/launch-manage/consume-data-correction',
        name: 'consumeDataCorrection',
        component: () => import('@/views/common_page/index.vue'),
        meta: {
            title: $t('消耗数据更正'),
            permiss: '1',
        },
    },
    // {
    //     // path: '/data-center/channel-manage',
    //     path: '/launch-manage/channel-manage',
    //     name: 'channelManage',
    //     component: () =>
    //         import('@/views/launch_manage/channel_manage/index.vue'),
    //     meta: {
    //         title: $t('渠道管理'),
    //         permiss: 'merchant.channel.list',
    //     },
    // },
    {
        // path: '/data-center/channel-statistics',
        path: '/launch-manage/channel-report',
        name: 'channelReport',
        component: () =>
            import('@/views/launch_manage/channel_report/index.vue'),
        meta: {
            title: '渠道报表',
            permiss: 'merchant.channel.registerStatList',
        },
    },
    {
        path: '/launch-manage/promoted-domain-manage',
        name: 'promotedDomainManage',
        component: () =>
            import('@/views/launch_manage/promoted_domain_manage/index.vue'),
        meta: {
            title: $t('推广域名管理'),
            permiss: 'merchant.marketing-domain.list',
        },
    },
    {
        path: '/launch-manage/purchase-volume-record',
        name: 'purchaseVolumeRecord',
        component: () =>
            import('@/views/launch_manage/purchase_volume_record/index.vue'),
        meta: {
            title: '广告消耗录入',
            permiss: 'merchant.channel.costList',
        },
    },
    {
        path: '/launch-manage/ad-consump-data',
        name: 'adConsumpData',
        component: () =>
            import('@/views/launch_manage/ad_consump_data/index.vue'),
        meta: {
            title: $t('广告消耗数据'),
            permiss: 'merchant.channel.dataList',
        },
    },
]

export default router
