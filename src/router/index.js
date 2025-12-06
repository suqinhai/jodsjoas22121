/*
 * @Date: 2023-09-15 12:23:18
 * @LastEditors: yilaisai
 * @LastEditTime: 2024-07-09 10:43:53
 */
import {
    createRouter,
    createWebHistory,
    createWebHashHistory,
} from 'vue-router'
import { token } from '@/common/util'
import userStore from '@/store/user'
import commonsStore from '@/store/common'
import Layout from '@/views/layout/index.vue'

import agentCenter from './agentCenter'
import agentMerchantManage from './agentMerchantManage'
import dataReport from './dataReport'
import dealerManage from './dealerManage'
import financeCenter from './financeCenter'
import gameCenter from './gameCenter'
import launchManage from './launchManage'
import merchantCenter from './merchantCenter'
import operatingCenter from './operatingCenter'
import personnelCenter from './personnelCenter'
import riskCenter from './riskCenter'
import siteConfig from './siteConfig'
import userManage from './userManage'
import profitCenter from './profitCenter'

const routes = [
    {
        path: '/',
        redirect: '/dashboard',
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('@/views/login/index.vue'),
        meta: {
            title: $t('登录'),
        },
    },
    {
        path: '/ip-restrictions',
        name: 'ipRestrictions',
        component: () => import('@/views/ip_restrictions/index.vue'),
        meta: {
            title: $t('IP限制'),
        },
    },
    {
        path: '/maintain',
        name: 'maintain',
        component: () => import('@/views/maintain/index.vue'),
        meta: {
            title: $t('站点维护中'),
        },
    },
    {
        path: '/:error*',
        name: '404',
        component: () => import('@/views/404/index.vue'),
        meta: {
            title: $t('页面不存在'),
        },
    },
    {
        path: '/',
        name: 'layout',
        component: Layout,
        children: [
            {
                path: '/403',
                name: '403',
                component: () => import('@/views/403/index.vue'),
                meta: {
                    title: $t('没有权限'),
                },
            },
            {
                path: '/dashboard',
                name: 'dashboard',
                component: () => import('@/views/dashboard/index.vue'),
                meta: {
                    title: $t('首页'),
                    permiss: '1',
                },
            },
            ...agentCenter,
            ...agentMerchantManage,
            ...dataReport,
            ...dealerManage,
            ...financeCenter,
            ...gameCenter,
            ...launchManage,
            ...merchantCenter,
            ...operatingCenter,
            ...personnelCenter,
            ...riskCenter,
            ...siteConfig,
            ...userManage,
            ...profitCenter,
        ],
    },
]

const router = createRouter({
    history:
        process.env.VITE_MODE === 'development'
            ? createWebHashHistory()
            : createWebHistory(process.env.VITE_BASE_PATH || '/'),
    routes,
})

router.beforeEach((to, from, next) => {
    // document.title = `${to.meta.title} ${$t('商户后台')}`
    const userData = userStore()
    const common = commonsStore()
    if (to.path === '/ip-restrictions' && userData.isRestrictionsIp) {
        next()
    } else if (!token() && to.path !== '/login') {
        next('/login')
    } else if (token() && to.path === '/login') {
        next('/')
    } else if (from.path === '/login') {
        next()
    } else if (to.meta.permiss && !userData.isHasMenuPermiss(to.meta.permiss)) {
        // 如果没有权限，则进入403
        next('/403')
    } else {
        // if (to.path !== '/login' && !userData.isRestrictionsIp) {
        //     if (
        //         to.name !== 'merchantRecharge' &&
        //         userData.userInfo.asGroup &&
        //         userData.userInfo.asSuper
        //     ) {
        //         // 非充值页面和登录页跳转判断是否需要指引
        //         common.getRechargeStatus(to.path)
        //     }
        // }
        next()
    }
})

export default router
