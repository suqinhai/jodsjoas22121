export const USER_REG = /^[A-Za-z0-9]{3,16}$/

export const PASSWORD_REG =
    /[a-z_A-Z0-9-\.!@#\$%\\\^&\*\)\(\+=\{\}\[\]\/",'<>~\·`\?:;|]{6,16}$/

export const GUIDE_PATH = {
    1: '/site-config/pay-channel-config', // 新增支付通道
    2: '/site-config/home-module', // 首页模块
    3: '/site-config/regional-restrictions', // 非经营地访问限制
    4: '/site-config/site-domain', // 域名管理
}

export const GAME_TYPE_LIST = [
    { key: 'HOT', label: $t('热门'), value: 0 },
    { key: 'CARD', label: $t('棋牌'), value: 1 },
    { key: 'FISH', label: $t('捕鱼'), value: 2 },
    { key: 'DIGITAL', label: $t('电子'), value: 3 },
    { key: 'SPORT', label: $t('体育'), value: 4 },
    { key: 'LIVE', label: $t('视讯'), value: 5 },
    { key: 'RECENT', label: $t('最近游戏'), value: 98 },
    { key: 'FAVORITES', label: $t('个人收藏'), value: 99 },
]

export const FUNCTION_TYPE_LIST = [
    { key: 'REWARD', label: $t('奖励'), value: 0 },
    { key: 'UNCLAIMED', label: $t('返水'), value: 1 },
    { key: 'VIP', label: 'VIP', value: 2 },
    { key: 'INVITE', label: $t('邀请'), value: 3 },
    { key: 'PROMOTION', label: $t('活动'), value: 4 },
    { key: 'TASK', label: $t('任务'), value: 5 },
]

export const SUPPORT_TYPE_LIST = [
    { key: 'ONLINE', label: $t('在线支持'), value: 0 },
    { key: 'SUGGESTED', label: $t('建议奖金'), value: 1 },
    { key: 'HELP', label: $t('帮助中心'), value: 2 },
]

// 没有菜单的页面
export const EXTRA_PAGE_PATH = [
    '/personnel-center/mix-permission',
    '/site-config/web-config-guide',
    '/game-center/bet-log/statistics',
    '/data-report/export-download',
]

// 切换站点时不能刷新的页面
export const NO_REFRESH_PATH = [
    '/personnel-center/mix-permission',
    '/game-center/bet-log/statistics',
]

// 消息提醒的页面权限
export const MSG_REMINDING_PATH_PERMISS = [
    // {
    //     label: $t('商户消息'),
    //     key: 'msg',
    //     value: 0,
    //     permissCode: 'admin.merchant-msg.list',
    //     path: '/operating-center/platform-announcement',
    // },
    // {
    //     label: $t('获利监控'),
    //     key: 'profit',
    //     value: 1,
    //     permissCode: 'admin.user-profit-spy-log.list',
    //     path: '/risk-center/game-profit-monitor',
    // },
    {
        label: $t('线上提现订单'),
        key: 'cash',
        value: 2,
        permissCode: 'merchant.cash-log.list',
        path: '/finance-center/withdrawl-order-list',
    },
    {
        label: $t('线下转账提现订单'),
        key: 'trance_cash',
        value: 4,
        permissCode: 'merchant.cash-log.offlineList',
        path: '/finance-center/transfer-accounts',
    },
    {
        label: $t('线下转账充值订单'),
        key: 'trance_recharge',
        value: 5,
        permissCode: 'merchant.recharge-log.reviewList',
        path: '/finance-center/transfer-accounts-audit',
    },
]

// (欧美)
export const LIMIT_US = {
    VENDOR_IMG_WIDTH: 320,
    VENDOR_IMG_HEIGHT: 427,
}

// (亚太)
export const LIMIT_AS = {
    VENDOR_IMG_SQUARE_WIDTH: 784,
    VENDOR_IMG_SQUARE_HEIGHT: 314,
    HOT_IMG_WIDTH: 180,
    HOT_IMG_HEIGHT: 180,
    SUBGAME_WIDTH: 180,
    SUBGAME_HEIGHT: 180,
}

// 不添加默认参数的post请求路径
export const POST_HTTP_URL = [
    '/admin/emp/login', // 账号登录
]

// h5主题模版数据
export const TEMPLATE_STYLE_DATA = {
    1: [
        { title: $t('Bvlgari蓝黑'), value: 1, image: '1_bvlgari' },
        { title: $t('Aston Martin紫'), value: 2, image: '1_aston_martin' },
        { title: $t('IWC蓝'), value: 3, image: '1_IWC' },
        { title: $t('Facebook绿'), value: 4, image: '1_facebook' },
        {
            title: $t('Elsa Schiaparelli粉'),
            value: 5,
            image: '1_elsa_schiaparelli',
        },
        { title: $t('Burgundy红'), value: 6, image: '1_burgundy' },
        { title: $t('Tom Ford绿'), value: 7, image: '1_tom_ford' },
        { title: $t('Versace黄'), value: 8, image: '1_versace' },
        { title: $t('sk-ll红'), value: 9, image: '1_sk-ll' },
        { title: $t('Dior克莱因蓝'), value: 10, image: '1_dior_blue' },
        { title: $t('facebook蓝'), value: 11, image: '1_facebook_blue' },
        // { title: $t('Aston Martin紫'), value: 12, image: '1_aston_martin' },
        {
            title: $t('Chivas Regal 邦迪蓝'),
            value: 13,
            image: '1_chivas_regal_blue',
        },
        { title: $t('Hermes橙'), value: 14, image: '1_hermes_orange' },
        { title: $t('USDT绿'), value: 15, image: '1_usdt_green' },
        {
            title: $t('Patek Philippe浅棕'),
            value: 16,
            image: '1_patek_philippe_light_brown',
        },
        {
            title: $t('Louis Vuitton棕'),
            value: 17,
            image: '1_louis_vuitton_brown',
        },
        { title: $t('Ebay紫'), value: 18, image: '1_ebay_purple' },
        { title: $t('Corum蓝'), value: 19, image: '1_corum_blue' },
        { title: $t('Twitter蓝'), value: 20, image: '1_twitter_blue' },
        { title: $t('Gucci绿金'), value: 21, image: '1_gucci_green_gold' },
        { title: $t('La Mer 绿'), value: 22, image: '1_la_mer_green' },
        {
            title: $t('Porsche黄绿'),
            value: 23,
            image: '1_porsche_yellow_green',
        },
        { title: $t('Bvlgari棕'), value: 24, image: '1_bvlgari_brown' },
        { title: $t('Prada黑'), value: 25, image: '1_prada_black' },
        {
            title: $t('Bottega Veneta莫兰迪灰'),
            value: 26,
            image: '1_bottega_veneta_ash',
        },
        { title: $t('Microsoft红'), value: 27, image: '1_microsoft_red' },
        { title: $t('Armani黑红'), value: 28, image: '1_armani_black_red' },
        {
            title: $t('Roger Dubuis黑金'),
            value: 29,
            image: '1_roger_dubuis_black_gold',
        },
        { title: $t('Embraer蓝'), value: 30, image: '1_embraer_blue' },
        {
            title: $t('Ferrari黑黄'),
            value: 31,
            image: '1_ferrari_black_yellow',
        },
        { title: $t('Lacoste绿'), value: 32, image: '1_lacoste_green' },
        {
            title: $t('Victoria Secret红'),
            value: 33,
            image: '1_victoria_secret_red',
        },
        { title: $t('Lancome水蜜桃色'), value: 34, image: '1_lancome_peach' },
        { title: $t('Anna Sui紫'), value: 35, image: '1_anna_sui_purple' },
        {
            title: $t('Bottega Veneta绿'),
            value: 36,
            image: '1_bottega_veneta_green',
        },
        { title: $t('Furla蓝'), value: 37, image: '1_furla_blue' },
        { title: $t('Cartier红'), value: 38, image: '1_cartier_red' },
        {
            title: $t('Estee Lauder蓝'),
            value: 39,
            image: '1_estee_lauder_blue',
        },
        { title: $t('3CE提香红'), value: 40, image: '1_3CE_red' },
        { title: $t('Burberry褐'), value: 41, image: '1_burberry_brown' },
        { title: $t('Bordeaux红'), value: 42, image: '1_bordeaux_red' },
        { title: $t('Breguet 灰'), value: 43, image: '1_breguet_ash' },
        { title: $t('Hermes棕橙'), value: 44, image: '1_hermes_brown_orange' },
        { title: 'Fruitz rose pink', value: 45, image: '1_fruitz_rosePink' },
        { title: $t('LOccitane青蓝'), value: 46, image: '1_LOccitane_blue' },
        {
            title: $t('Burberry午夜蓝白'),
            value: 47,
            image: '1_burberry_midnight_blue_white',
        },
        {
            title: $t('Valentino墨绿'),
            value: 48,
            image: '1_valentino_dark_green',
        },
        { title: $t('McLaren黄'), value: 49, image: '1_mcLaren_yellow' },
        { title: $t('Armani墨黑'), value: 50, image: '1_armani_jet_black' },
        { title: $t('Curum 灰蓝'), value: 51, image: '1_corum_gray_blue' },
        {
            title: $t('Aston Martin紫罗兰'),
            value: 52,
            image: '1_aston_martin_violet',
        },
        {
            title: $t('Carrera y Carrera红'),
            value: 53,
            image: '1_carrera_y_carrera_red',
        },
        {
            title: $t('Poeche 森林绿'),
            value: 54,
            image: '1_porsche_forest_green',
        },
        { title: $t('Cartier 葡萄酒红'), value: 55, image: '1_cartier_wine_red' },
        {
            title: $t('Estee Lauder 深紫蓝'),
            value: 56,
            image: '1_estee_lauder_dark_purple_blue',
        },
        { title: $t('Gucci 红'), value: 57, image: '1_gucci_red' },
        {
            title: $t('Parmigian Flurier蓝'),
            value: 58,
            image: '1_parmigiani_fleurier_blue',
        },
        {
            title: $t('Roger Vivier深棕'),
            value: 59,
            image: '1_roger_vivier_dark_brown',
        },
        { title: $t('Prada 褐'), value: 60, image: '1_prada_brown' },
        { title: $t('Bulgari绿'), value: 61, image: '1_bulgari_green' },
        { title: $t('Lanvin紫'), value: 62, image: '1_lanvin_purple' },
        { title: $t('Montblanc蓝'), value: 63, image: '1_montblanc_blue' },
        { title: $t('Sergio Rossi 褐'), value: 64, image: '1_sergio_rossi_brown' },
        { title: 'Blue Nile', value: 65, image: '1_blue_nile' },
        { title: $t('Givenchy 灰绿'), value: 66, image: '1_givenchy_gray_green' },
        { title: $t('Cartier 蓝'), value: 67, image: '1_cartier_blue' },
        { title: $t('Montblanc红'), value: 68, image: '1_montblanc_red' },
        { title: $t('Balenciaga橙'), value: 69, image: '1_balenciaga_orange' },
        {
            title: $t('Louis Vuitton灰蓝'),
            value: 70,
            image: '1_louis_vuitton_gray_blue',
        },
        {
            title: $t('Brunello Cucinelli 深棕'),
            value: 71,
            image: '1_brunello_cucinelli_dark_brown',
        },
        // { title: $t('Ralph Lauren 棕'), value: 72, image: '1_ralph_lauren_brown' },
        // { title: $t('Swaroski粉'), value: 73, image: '1_swarovski_pink' },
        // { title: $t('Boutallion绿'), value: 74, image: '1_boutallion_green' },
        // {
        //     title: $t('Oasis Italiana黄'),
        //     value: 75,
        //     image: '1_oasis_italiana_yellow',
        // },
        // { title: $t('Ghiso棕'), value: 76, image: '1_ghiso_brown' },
        // { title: $t('Chanel黑'), value: 77, image: '1_chanel_black' },
        // { title: $t('Lalique红'), value: 78, image: '1_lalique_red' },
        // { title: $t('Dior紫'), value: 79, image: '1_dior_purple' },
        // { title: $t('Tiffany深蓝'), value: 80, image: '1_tiffany_dark_blue' },
        // {
        //     title: $t('Salvatore Farragamo绿'),
        //     value: 81,
        //     image: '1_salvatore_ferragamo_green',
        // },
        // { title: $t('FENDI蓝'), value: 82, image: '1_FENDI_blue' },
        // { title: $t('Chaumet绿'), value: 83, image: '1_chaumet_green' },
        // { title: $t('VanCleef红'), value: 84, image: '1_van_cleef_red' },
        // { title: $t('Gucci绿'), value: 85, image: '1_gucci_green' },
        // { title: $t('Chpard红'), value: 86, image: '1_chopard_red' },
    ],
    2: [
        { title: $t('深绿色底'), value: 1001, image: '2_dark_green' },
        { title: $t('宝石蓝底'), value: 1002, image: '2_royal_blue' },
        { title: $t('紫金'), value: 1003, image: '2_purple_gold' },
        { title: $t('锈红色底'), value: 1004, image: '2_rust_red' },
        { title: $t('咖啡色底'), value: 1005, image: '2_coffee_brown' },
        { title: $t('油青绿底'), value: 1006, image: '2_oil_green' },
        { title: $t('墨蓝色底'), value: 1007, image: '2_dark_blue' },
        { title: $t('翠绿底'), value: 1008, image: '2_emerald_green' },
        { title: $t('靛蓝色底'), value: 1009, image: '2_indigo' },
        { title: $t('青绿色底'), value: 1010, image: '2_turquoise' },
        { title: $t('深紫底'), value: 1011, image: '2_deep_purple' },
        { title: $t('赤褐色底'), value: 1012, image: '2_reddish_brown' },
        { title: $t('薄荷绿底'), value: 1013, image: '2_mint_green' },
        { title: $t('陶土色底'), value: 1014, image: '2_terracotta' },
        { title: $t('叶绿色底'), value: 1015, image: '2_leaf_green' },
    ],
    4: [
        { title: $t('暗黑色底'), value: 3001, image: '4_dull_black' },
        { title: $t('深蓝色底'), value: 3002, image: '4_dark_blue' },
        { title: $t('蓝紫色底'), value: 3003, image: '4_blue_purple' },
        { title: $t('墨绿色底'), value: 3004, image: '4_dark_green' },
        { title: $t('紫色底'), value: 3005, image: '4_purple' },
        { title: $t('黑金色底'), value: 3006, image: '4_black_gold' },
        { title: $t('蓝色底'), value: 3007, image: '4_blue' },
        { title: $t('草绿色底'), value: 3008, image: '4_grass_green' },
        { title: $t('深绿色底'), value: 3009, image: '4_deep_green' },
        { title: $t('黑色底'), value: 3010, image: '4_black' },
    ],
    5: [
        { title: $t('深绿色底'), value: 4001, image: '5_deep_green' },
        { title: $t('浅蓝色底'), value: 4002, image: '5_light_blue' },
        { title: $t('浅黄色底'), value: 4003, image: '5_light_yellow' },
    ]
}

export const NO_ONLINE_MENU_DATA = [
    // {
    //     firstLevelName: $t('站点配置'),
    //     name: $t('参数调整(待开放)'),
    //     path: '/site-config/parameter-adjust',
    // },
    // {
    //     firstLevelName: $t('站点配置'),
    //     name: $t('邮箱配置(待开放)'),
    //     path: '/site-config/mail-config',
    // },
    // {
    //     firstLevelName: $t('站点配置'),
    //     name: $t('站长意见(待开放)'),
    //     path: '/site-config/webmaster-opinion',
    // },
    // {
    //     firstLevelName: $t('站点配置'),
    //     name: $t('客服记录(待开放)'),
    //     path: '/site-config/service-record',
    // },
    // {
    //     firstLevelName: $t('站点配置'),
    //     name: $t('站点语言设置(待开放)'),
    //     path: '/site-config/site-language-setting',
    // },
    // {
    //     firstLevelName: $t('站点配置'),
    //     name: $t('站点名称管理(待开放)'),
    //     path: '/site-config/site-name-manage',
    // },

    // {
    //     firstLevelName: $t('运营中心'),
    //     name: $t('广告埋点(待开放)'),
    //     path: '/operating-center/advertising-event-tracking',
    // },
    // {
    //     firstLevelName: $t('运营中心'),
    //     name: $t('用户激活(待开放)'),
    //     path: '/operating-center/user-activate',
    // },
    // {
    //     firstLevelName: $t('运营中心'),
    //     name: $t('手机号码采集(待开放)'),
    //     path: '/operating-center/phone-number-collect',
    // },
    // {
    //     firstLevelName: $t('运营中心'),
    //     name: $t('转盘设置(待开放)'),
    //     path: '/operating-center/turntable-setting',
    // },
    // {
    //     firstLevelName: $t('运营中心'),
    //     name: $t('VIP设置(待开放)'),
    //     path: '/operating-center/vip-setting',
    // },
    // {
    //     firstLevelName: $t('运营中心'),
    //     name: $t('无限代理(待开放)'),
    //     path: '/operating-center/infinite-agent',
    // },
    // {
    //     firstLevelName: $t('运营中心'),
    //     name: $t('提现设置(待开放)'),
    //     path: '/operating-center/withdraw-setting',
    // },
    // {
    //     firstLevelName: $t('运营中心'),
    //     name: $t('充值奖励设置(待开放)'),
    //     path: '/operating-center/recharge-award-setting',
    // },
    // {
    //     firstLevelName: $t('运营中心'),
    //     name: $t('会员层级(待开放)'),
    //     path: '/operating-center/member-level',
    // },
    // {
    //     firstLevelName: $t('运营中心'),
    //     name: $t('活动参与设置(待开放)'),
    //     path: '/operating-center/activity-part-setting',
    // },

    // {
    //     firstLevelName: $t('财务中心'),
    //     secondLevelName: $t('新增支付通道'),
    //     name: $t('新增转账通道(待开放)'),
    //     path: '/finance-center/add-transfer-channel',
    // },
    // {
    //     firstLevelName: $t('财务中心'),
    //     name: $t('额度丢失(待开放)'),
    //     path: '/finance-center/credit-loss',
    // },
    // {
    //     firstLevelName: $t('用户管理'),
    //     name: $t('注册与安全配置(待开放)'),
    //     path: '/user-manage/register-and-security-config',
    // },
    // {
    //     firstLevelName: $t('用户管理'),
    //     name: $t('会员日志(待开放)'),
    //     path: '/user-manage/member-log',
    // },
    // {
    //     firstLevelName: $t('用户管理'),
    //     name: $t('会员登录稽核(待开放)'),
    //     path: '/user-manage/member-login-audit',
    // },
    // {
    //     firstLevelName: $t('代理中心'),
    //     name: $t('代理模式(待开放)'),
    //     path: '/agent/agent-mode',
    // },
    // {
    //     firstLevelName: $t('人事中心'),
    //     name: $t('登录日志(待开放)'),
    //     path: '/personnel-center/login-log',
    // },
    // {
    //     firstLevelName: $t('人事中心'),
    //     name: $t('客服聊天记录查询(待开放)'),
    //     path: '/personnel-center/service-chat-record',
    // },
    // {
    //     firstLevelName: $t('商户中心'),
    //     name: $t('站点返利账单(待开放)'),
    //     path: '/merchant-center/site-rebate-bill',
    // },
]

export const LANGLIST = [
    { value: 'zh', label: '中文' },
    { value: 'en', label: 'English' },
    { value: 'vi', label: 'Vietnamese' },
]

export const SITE_CONFIG_KEY = [
    {
        key: 'domainName',
        label: $t('前端域名配置'),
        path: '/site-config/site-domain',
    },
    {
        key: 'register',
        label: $t('注册方式'),
        path: '/site-config/register-config',
    },
    {
        key: 'pay',
        label: $t('支付通道'),
        path: '/site-config/pay-channel-config',
    },
    {
        key: 'service',
        label: $t('客服配置'),
        path: '/site-config/service-config',
    },
    {
        key: 'platform',
        label: $t('开放厂家'),
        path: '/game-center/game-platform-list',
    },
    {
        key: 'banner',
        label: 'Banner',
        path: '/operating-center/publicity-manage',
    },
    {
        key: 'activity',
        label: $t('活动'),
        path: '/operating-center/activity-center',
    },
    { key: 'agent', label: $t('代理'), path: '/agent/rebate' },
    {
        key: 'memberTag',
        label: $t('会员标签'),
        path: '/user-manage/member-tag',
    },
    {
        key: 'memberLevel',
        label: $t('会员层级'),
        path: '/user-manage/member-level-setting',
    },
    {
        key: 'adjustControl',
        label: $t('会员调控'),
        path: '/risk-center/member-adjust-control',
    },
    { key: 'task', label: $t('任务'), path: '/operating-center/task-center' },
    {
        key: 'rebate',
        label: $t('游戏返水'),
        path: '/operating-center/member-rebate',
    },
    {
        key: 'ticket',
        label: $t('票券'),
        path: '/operating-center/ticket-center',
    },
    {
        key: 'profitMonitor',
        label: $t('获利监控'),
        path: '/risk-center/game-profit-monitor',
    },
    {
        key: 'brushMonitor',
        label: $t('刷子监控'),
        path: '/risk-center/brush-monitoring',
    },
]
