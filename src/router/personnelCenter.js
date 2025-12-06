
const router = [
    {
        path: '/personnel-center',
        redirect: '/personnel-center/operate-log',
    },

    {
        // path: '/manage-config/account-manage',
        path: '/personnel-center/staff-list',
        name: 'staffList',
        component: () =>
            import('@/views/personnel_center/staff_list/index.vue'),
        meta: {
            title: $t('人事列表'),
            permiss: 'admin.emp.list',
        },
    },
    {
        // path: '/manage-config/role-permission',
        path: '/personnel-center/permission-setting',
        name: 'permissionSetting',
        component: () =>
            import('@/views/personnel_center/permission_setting/index.vue'),
        meta: {
            title: $t('人事权限'),
            permiss: 'admin.role.list',
        },
    },
    {
        path: '/personnel-center/staff-salary',
        name: 'staffSalary',
        component: () =>
            import('@/views/personnel_center/staff_salary/index.vue'),
        meta: {
            title: $t('人事工资列表'),
            permiss: 'merchant.emp-salary.list',
        },
    },
    {
        // path: '/manage-config/mix-permission',
        path: '/personnel-center/mix-permission',
        name: 'mixPermission',
        component: () =>
            import('@/views/personnel_center/mix_permission/index.vue'),
        meta: {
            title: $t('角色权限分配'),
            permiss: 'admin.role.list',
        },
    },
    {
        // path: '/manage-config/ip-whitelist',
        path: '/personnel-center/ip-whitelist',
        name: 'ipWhitelist',
        component: () =>
            import('@/views/personnel_center/ip_whitelist/index.vue'),
        meta: {
            title: $t('IP白名单'),
            permiss: 'admin.merchant-whitelist-config.list',
        },
    },
    {
        // path: '/manage-config/operate-log',
        path: '/personnel-center/operate-log',
        name: 'operateLog',
        component: () =>
            import('@/views/personnel_center/operate_log/index.vue'),
        meta: {
            title: $t('操作日志'),
            permiss: 'admin.admin-log.platformList',
        },
    },
    {
        path: '/personnel-center/login-log',
        name: 'loginLog',
        component: () => import('@/views/common_page/index.vue'),
        meta: {
            title: $t('登录日志'),
            permiss: '1',
        },
    },
    {
        path: '/personnel-center/service-chat-record',
        name: 'serviceChatRecord',
        component: () => import('@/views/common_page/index.vue'),
        meta: {
            title: $t('客服聊天记录查询'),
            permiss: '1',
        },
    },
]

export default router
