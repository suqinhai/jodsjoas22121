
import $http from '../common/util/http'

// 获取会员列表
export const getMemberList = (data, config = {}) => {
    return $http.get('/admin/user/list', data, config)
}

// 新增会员
export const postMemberConfig = (data, config = {}) => {
    return $http.post('/admin/user/add', data, config)
}

// 批量新增会员
export const postBatchAddMember = (data, config = {}) => {
    return $http.post('/admin/user/batchAdd', data, config)
}

// 下载失败错误结果
export const getAddMemberDownErr = (data, config = {}) => {
    return $http.get('/admin/user/downloadErr', data, config)
}

// 批量操作
export const operateMemberConfig = (data, config = {}) => {
    return $http.post('/admin/user/batchHandle', data, config)
}

// 获取会员投注统计
export const getMemberBetLog = (data, config = {}) => {
    return $http.get('/admin/game-play-log/statByUser', data, config)
}

// 获取提现账户列表
export const getWithdrawAccount = (data, config = {}) => {
    return $http.get('/admin/account/list', data, config)
}

// 编辑提现账户
export const postWithdrawAccount = (data, config = {}) => {
    return $http.post('/admin/account/edit', data, config)
}

// 删除提现收款账户
export const deleteWithdrawAccount = (data, config = {}) => {
    return $http.post('/admin/account/delete', data, config)
}

// 获取账户交易记录
export const getAccountTransaction = (data, config = {}) => {
    return $http.get('/admin/user-coin-log/list', data, config)
}

// 获取用户消息列表
export const getMemberMessageList = (data, config = {}) => {
    return $http.get('/admin/user-msg/list', data, config)
}

// 获取会员操作日志
export const getMemberOperationLog = (data, config = {}) => {
    return $http.get('/admin/user-operation-log/userLog', data, config)
}

// 获取会员信息
export const getMemberDetail = (data, config = {}) => {
    return $http.get('/admin/user/detail', data, config)
}

// 修改会员信息
export const postMemberData = (data, config = {}) => {
    return $http.post('/admin/user/edit', data, config)
}

// 查询用户关联信息
export const getMemberRelevancyInfo = (data, config = {}) => {
    return $http.get('/admin/user-bot-spy/joinInfo', data, config)
}

// 修改会员密码
export const postMemberPassword = (data, config = {}) => {
    return $http.post('/admin/user/changePwd', data, config)
}

// 推广账号管理【分页】
export const getPromotionAccountList = (data, config = {}) => {
    return $http.get('/admin/user-simple-ctrl/teamList', data, config)
}

// 添加推广账号
export const postPromotionAccountData = (data, config = {}) => {
    return $http.post('/admin/user-simple-ctrl/teamAdd', data, config)
}

// 删除推广账号
export const deletePromotionAccountData = (data, config = {}) => {
    return $http.post('/admin/user-simple-ctrl/teamDelete', data, config)
}

// 批量添加推广账号
export const batchPromotionAccountData = (data, config = {}) => {
    return $http.post('/admin/user-simple-ctrl/teamBatchAdd', data, config)
}

// 用户标签列表【分页】
export const getMemberTagList = (data, config = {}) => {
    return $http.get('/admin/user-tag/list', data, config)
}

// 添加/编辑用户标签
export const postMemberTagData = (data, config = {}) => {
    return $http.post('/admin/user-tag/edit', data, config)
}

// 删除用户标签
export const deleteMemberTagData = (data, config = {}) => {
    return $http.post('/admin/user-tag/delete', data, config)
}

// 会员提现免首充【分页】
export const getCashIgnoreList = (data, config = {}) => {
    return $http.get('/admin/user-mark-account/cashIgnoreList', data, config)
}

// 添加提现免首充用户
export const postCashIgnoreData = (data, config = {}) => {
    return $http.post('/admin/user-mark-account/addCashIgnore', data, config)
}

// 删除提现免首充用户
export const deleteCashIgnoreData = (data, config = {}) => {
    return $http.post('/admin/user-mark-account/deleteCashIgnore', data, config)
}

// 用户VIP等级调整
export const levelEditData = (data, config = {}) => {
    return $http.post('/admin/user-level/edit', data, config)
}

// 用户VIP等级变更列表
export const getLevelList = (data, config = {}) => {
    return $http.get('/admin/user-level/list', data, config)
}

// 会员白名单列表
export const getBalanceRescueWhitelist = (data, config = {}) => {
    return $http.get(
        '/admin/promotion-whitelist/reliefBalanceList',
        data,
        config,
    )
}

// 删除会员白名单
export const deleteMemberWhitelistData = (data, config = {}) => {
    return $http.post(
        '/admin/promotion-whitelist/delReliefBalance',
        data,
        config,
    )
}

// 添加会员白名单
export const postMemberWhitelistData = (data, config = {}) => {
    return $http.post(
        '/admin/promotion-whitelist/addReliefBalance',
        data,
        config,
    )
}

// 批量导入会员白名单
export const batchImportMemberWhitelist = (data, config = {}) => {
    return $http.post(
        '/admin/promotion-whitelist/batchReliefBalance',
        data,
        config,
    )
}

// 层级白名单列表
export const getLayerWhitelist = (data, config = {}) => {
    return $http.get(
        '/admin/promotion-whitelist/reliefBalanceLayerList',
        data,
        config,
    )
}

// 编辑层级白名单
export const postLayerWhitelistData = (data, config = {}) => {
    return $http.post(
        '/admin/promotion-whitelist/editReliefBalanceLayer',
        data,
        config,
    )
}

// 网红账号管理【分页】
export const getInfluencerAccountList = (data, config = {}) => {
    return $http.get('/admin/blogger/accountList', data, config)
}

// 添加网红账户
export const addInfluencerAccountData = (data, config = {}) => {
    return $http.post('/admin/blogger/addAccount', data, config)
}

// 编辑网红账户
export const editInfluencerAccountData = (data, config = {}) => {
    return $http.post('/admin/blogger/editAccount', data, config)
}


// 获取所有会员表头
export const getTableHeaderConfig = (data, config = {}) => {
    return $http.get('/admin/user/getTitle', data, config)
}

// 编辑所有会员表头
export const postTableHeaderConfig = (data, config = {}) => {
    return $http.post('/admin/user/editTitle', data, config)
}

// 获取信誉分列表
export const getCreditList = (data, config = {}) => {
    return $http.get('/admin/user/creditList', data, config)
}

//修改信誉分
export const postCreditEdit = (data, config = {}) => {
    return $http.post('/admin/user/creditEdit', data, config)
}
// 导入信誉分
export const postCreditImport = (data, config = {}) => {
    return $http.post('/admin/user/creditImport', data, config)
}
//vip等级额度上限配置列表
export const getLevelLimitList = (data, config = {}) => {
    return $http.get('/admin/vip-balance-ctrl/levelLimitList', data, config)
}
//vip等级额度上限配置
export const postLevelLimitEdit = (data, config = {}) => {
    return $http.post('/admin/vip-balance-ctrl/levelLimitEdit', data, config)
}
//vip等级额度上限列表
export const getLimitList = (data, config = {}) => {
    return $http.get('/admin/vip-balance-ctrl/limitList', data, config)
}
//踢下线并禁止进入游戏
export const postKickOffline = (data, config = {}) => {
    return $http.post('/admin/vip-balance-ctrl/kickOffline', data, config)
}
//vip等级额度上限记录列表
export const getLimitLogList = (data, config = {}) => {
    return $http.get('/admin/vip-balance-ctrl/logList', data, config)
}
//小红点提示
export const getRedDotTip = (data, config = {}) => {
    return $http.get('/admin/vip-balance-ctrl/prompt', data, config)
}