const router = [
    {
        path: '/site-config',
        redirect: '/site-config/site-domain',
    },
    {
        path: '/site-config/parameter-adjust',
        name: 'parameterAdjust',
        component: () => import('@/views/common_page/index.vue'),
        meta: {
            title: $t('参数调整'),
            permiss: '1',
        },
    },
    {
        path: '/site-config/mail-config',
        name: 'mailConfig',
        component: () => import('@/views/common_page/index.vue'),
        meta: {
            title: $t('邮箱配置'),
            permiss: '1',
        },
    },
    {
        path: '/site-config/webmaster-opinion',
        name: 'webmasterOpinion',
        component: () => import('@/views/common_page/index.vue'),
        meta: {
            title: $t('站长意见'),
            permiss: '1',
        },
    },
    {
        path: '/site-config/service-record',
        name: 'serviceRecord',
        component: () => import('@/views/common_page/index.vue'),
        meta: {
            title: $t('客服记录'),
            permiss: '1',
        },
    },
    {
        path: '/site-config/site-language-setting',
        name: 'siteLanguageSetting',
        component: () => import('@/views/common_page/index.vue'),
        meta: {
            title: $t('站点语言设置'),
            permiss: '1',
        },
    },
    {
        path: '/site-config/site-name-manage',
        name: 'siteNameManage',
        component: () => import('@/views/common_page/index.vue'),
        meta: {
            title: $t('站点名称管理'),
            permiss: '1',
        },
    },
    {
        // path: '/site-config/site-list',
        // name: 'siteList',
        path: '/site-config/child-site-config',
        name: 'childSiteConfig',
        component: () =>
            import('@/views/site_config/child_site_config/index.vue'),
        meta: {
            title: '子站点配置',
            permiss: 'admin.merchant.merchantList',
        },
    },
    {
        // path: '/app-and-domain-manage/domain-manage',
        path: '/site-config/site-domain',
        name: 'siteDomain',
        component: () => import('@/views/site_config/site_domain/index.vue'),
        meta: {
            title: $t('站点域名'),
            permiss: 'admin.domain.list',
        },
    },
    {
        // path: '/operation/brand/user-agreement',
        path: '/site-config/brand-setting',
        name: 'brandSetting',
        component: () => import('@/views/site_config/brand_setting/index.vue'),
        meta: {
            title: $t('品牌设置'),
            permiss: 'merchant.app.layout-logos',
        },
    },
    {
        // path: '/app-and-domain-manage/app-package-manage',
        path: '/site-config/app-manage',
        name: 'appManage',
        component: () => import('@/views/site_config/app_manage/index.vue'),
        meta: {
            title: $t('APP管理配置'),
            permiss: 'merchant.app-info.list',
        },
    },
    {
        path: '/site-config/sms-config',
        name: 'smsConfig',
        component: () => import('@/views/site_config/sms_config/index.vue'),
        meta: {
            title: $t('短信配置'),
            permiss: 'admin.merchant-sms-config.list',
        },
    },
    {
        path: '/site-config/share-config',
        name: 'shareConfig',
        component: () => import('@/views/site_config/share_config/index.vue'),
        meta: {
            title: $t('分享配置'),
            permiss: 'merchant.agent.shareCfgList',
        },
    },
    {
        // path: '/member/register-config',
        path: '/site-config/register-config',
        name: 'registerConfig',
        component: () =>
            import('@/views/site_config/register_config/index.vue'),
        meta: {
            title: $t('注册配置'),
            permiss: 'admin.meta.itemList-30',
        },
    },
    {
        // path: '/merchant-center/regional-restrictions',
        path: '/site-config/regional-restrictions',
        name: 'regionalRestrictions',
        component: () =>
            import('@/views/site_config/regional_restrictions/index.vue'),
        meta: {
            title: $t('非经营地访问限制'),
            permiss: 'merchant.region-limit.list',
        },
    },
    {
        // path: '/website/templates',
        path: '/site-config/template-store',
        name: 'templateStore',
        component: () => import('@/views/site_config/template_store/index.vue'),
        meta: {
            title: $t('模版仓库'),
            permiss: 'merchant.app.layout-template',
        },
    },
    {
        // path: '/service/service-manage',
        path: '/site-config/service-config',
        name: 'serviceConfig',
        component: () => import('@/views/site_config/service_config/index.vue'),
        meta: {
            title: $t('客服配置'),
            permiss: 'merchant.faq.list',
        },
    },
    {
        // path: '/website/modules',
        path: '/site-config/modules-manage',
        name: 'modulesManage',
        component: () => import('@/views/site_config/modules_manage/index.vue'),
        meta: {
            title: $t('模块管理'),
            permiss: 'merchant.app.layout-menu',
        },
    },
    {
        // path: '/website/discount',
        path: '/site-config/discount-module',
        name: 'discountModule',
        component: () =>
            import('@/views/site_config/discount_module/index.vue'),
        meta: {
            title: $t('优惠模块'),
            permiss: 'merchant.app.layout-offerTypes',
        },
    },
    {
        // path: '/website/virtual-handsel-pool',
        path: '/site-config/virtual-handsel-pool',
        name: 'virtualHandselPool',
        component: () =>
            import('@/views/site_config/virtual_handsel_pool/index.vue'),
        meta: {
            title: $t('虚拟彩金池'),
            permiss: 'merchant.app.layout-awardPools',
        },
    },
    {
        // path: '/website/web-config-guide',
        path: '/site-config/web-config-guide',
        name: 'webConfigGuide',
        component: () =>
            import('@/views/site_config/web_config_guide/index.vue'),
        meta: {
            title: $t('网站前台配置引导'),
            permiss: '1',
        },
    },
    {
        // path: '/operation/music-manage',
        path: '/site-config/music-manage',
        name: 'musicManage',
        component: () => import('@/views/site_config/music_manage/index.vue'),
        meta: {
            title: $t('音乐管理'),
            permiss: 'merchant.radio.list',
        },
    },
    {
        // path: '/website/home',
        path: '/site-config/home-module',
        name: 'homeModule',
        component: () => import('@/views/site_config/home_module/index.vue'),
        meta: {
            title: $t('首页模块'),
            permiss: 'merchant.app.layout',
        },
    },
    {
        path: '/site-config/dealer-model-config',
        name: 'dealerModelConfig',
        component: () =>
            import('@/views/site_config/dealer_model_config/index.vue'),
        meta: {
            title: '经销商模式配置',
            permiss: 'merchant.dealer.awardCfgList',
        },
    },
    {
        path: '/site-config/create-child-site',
        name: 'createChildSite',
        component: () =>
            import('@/views/site_config/create_child_site/index.vue'),
        meta: {
            title: '子站点创建',
            permiss: 'admin.merchant.addSite',
        },
    },
    {
        path: '/site-config/advertising-pattern-config',
        name: 'advertisingPatternConfig',
        component: () =>
            import('@/views/site_config/advertising_pattern_config/index.vue'),
        meta: {
            title: '广告埋点配置',
            permiss: 'merchant.channel.list',
        },
    },
    {
        path: '/site-config/pay-channel-config',
        name: 'payChannelConfig',
        component: () =>
            import('@/views/site_config/pay_channel_config/index.vue'),
        meta: {
            title: '支付通道配置',
            permiss: 'admin.merchant-pay-config.list',
        },
    },
    {
        path: '/site-config/influencer-account-manage',
        name: 'influencerAccountManage',
        component: () =>
            import('@/views/site_config/influencer_account_manage/index.vue'),
        meta: {
            title: '网红博主配置',
            permiss: 'merchant.blogger.accountList',
        },
    },
    {
        path: '/site-config/personalized',
        name: 'Personalized',
        component: () =>
            import('@/views/site_config/personalized/index.vue'),
        meta: {
            title: '个性化配置',
            permiss: 'merchant.merchant.personalized',
        },
    },
]

export default router
