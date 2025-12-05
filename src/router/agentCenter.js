const router = [
    {
        path: '/agent',
        redirect: '/agent/list',
    },
    {
        path: '/agent/list',
        name: 'agentList',
        component: () => import('@/views/agent_center/list/index.vue'),
        meta: {
            title: $t('代理列表'),
            permiss: 'merchant.agent.list',
        },
    },
    {
        path: '/agent/setting',
        name: 'agentSetting',
        component: () => import('@/views/agent_center/setting/index.vue'),
        meta: {
            title: $t('代理设置'),
            permiss: 'merchant.agent.levelList',
        },
    },
    {
        path: '/agent/rebate',
        name: 'rebateSetting',
        component: () => import('@/views/agent_center/rebate/index.vue'),
        meta: {
            title: $t('返佣设置'),
            permiss: 'merchant.agent.awardCfgList',
        },
    },
    {
        path: '/agent/receive-record',
        name: 'agentReceiveRecord',
        component: () =>
            import('@/views/agent_center/receive_record/index.vue'),
        meta: {
            title: $t('代理领取记录'),
            permiss: 'merchant.agent.commissionLogList',
        },
    },
    {
        path: '/agent/data-query',
        name: 'agentDataQuery',
        component: () => import('@/views/agent_center/data_query/index.vue'),
        meta: {
            title: $t('代理数据查询'),
            permiss: 'merchant.agent.dataList',
        },
    },
    {
        path: '/agent/change-agent-supervisor',
        name: 'changeAgentSupervisor',
        component: () =>
            import('@/views/agent_center/change_agent_supervisor/index.vue'),
        meta: {
            title: $t('代理上级更改溯源'),
            permiss: 'merchant.agent-op.changeList',
        },
    },
    {
        path: '/agent/three-agent-configuration',
        name: 'threeAgentConfiguration',
        component: () =>
            import('@/views/agent_center/three_agent_configuration/index.vue'),
        meta: {
            title: '三级代理配置',
            permiss: 'merchant.third-level-agent.getDefaultConfig',
        },
    },
    {
        path: '/agent/three-unbind-configuration',
        name: 'threeUnbindConfiguration',
        component: () =>
            import('@/views/agent_center/three_unbind_configuration/index.vue'),
        meta: {
            title: '三级掉绑配置',
            permiss: 'merchant.third-level-agent.missBindConfigList',
        },
    },
    {
        path: '/agent/three-agent-overview',
        name: 'threeAgentOverview',
        component: () =>
            import('@/views/agent_center/three_agent_overview/index.vue'),
        meta: {
            title: '三级代理总览',
            permiss: 'merchant.agent.overview',
        },
    },
    {
        path: '/agent/three-level-query',
        name: 'threeLevelQuery',
        component: () =>
            import('@/views/agent_center/three_level_query/index.vue'),
        meta: {
            title: '三级掉绑查询',
            permiss: 'merchant.third-level-agent.missBindList',
        },
    },
    {
        path: '/agent/three-agent-award',
        name: 'threeAgentAward',
        component: () =>
            import('@/views/agent_center/three_agent_award/index.vue'),
        meta: {
            title: '三级代理奖励',
            permiss: 'merchant.agent.thirdReward',
        },
    },
    {
        path: '/agent/agent-mode',
        name: 'agentMode',
        component: () => import('@/views/common_page/index.vue'),
        meta: {
            title: $t('代理模式'),
            permiss: '1',
        },
    },
    {
        path: '/agent/custom-agent-config',
        name: 'customAgentConfig',
        component: () =>
            import('@/views/agent_center/custom_agent_config/index.vue'),
        meta: {
            title: '定制版代理配置',
            permiss: 'admin.meta.itemList-52',
        },
    },
    {
        path: '/agent/custom-invite-relation',
        name: 'customInviteRelation',
        component: () =>
            import('@/views/agent_center/custom_invite_relation/index.vue'),
        meta: {
            title: '定制版邀请关系',
            permiss: 'merchant.custom-agent.inviteList',
        },
    },
    {
        path: '/agent/custom-rebate-record',
        name: 'customRebateRecord',
        component: () =>
            import('@/views/agent_center/custom_rebate_record/index.vue'),
        meta: {
            title: '定制版返佣记录',
            permiss: 'merchant.custom-agent.inviteLog',
        },
    },
]

export default router
