const router = [
    {
        path: '/profit-center',
        redirect: '/profit-center/comprehensive-report',
    },
    {
        path: '/profit-center/comprehensive-report',
        name: 'comprehensiveReport',
        component: () => import('@/views/common_page/index.vue'),
        meta: {
            title: $t('综合报表'),
            permiss: '1',
        },
    },
    {
        path: '/profit-center/cost-detail',
        name: 'costDetail',
        component: () => import('@/views/common_page/index.vue'),
        meta: {
            title: $t('费用明细'),
            permiss: '1',
        },
    },
]

export default router
