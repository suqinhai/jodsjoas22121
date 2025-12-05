<template>
    <!-- 运营中心-优惠活动列表-活动列表/已关闭活动 -->
    <div class="container-main">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item :label="$t('站点:')" v-if="commonData.merchantSiteList.length > 1">
                <MerchantSiteSelect isShowAll isNeedDefault :clearable="false" v-model="state.formData.siteId">
                </MerchantSiteSelect>
            </el-form-item>
            <el-form-item :label="$t('活动类型:')">
                <el-select v-model="state.formData.type" :placeholder="$t('请选择活动类型')" clearable>
                    <el-option v-for="item in metaData.promotionType" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('活动ID:')">
                <el-input v-model="state.formData.id" :placeholder="$t('请输入活动ID')" />
            </el-form-item>
            <el-form-item :label="$t('活动名称:')">
                <el-input v-model="state.formData.name" :placeholder="$t('请输入活动名称')" />
            </el-form-item>
            <el-form-item :label="$t('活动状态:')">
                <el-select v-model="state.formData.status" :placeholder="$t('请选择活动状态')" clearable>
                    <el-option v-for="item in statusList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item v-if="type === 1 && userData.isHasPermiss('merchant.promotion.add')">
                <el-button v-throttle type="primary" @click="state.showAddActivity = true,state.itemData = {}">{{$t('新增活动')}}</el-button>
            </el-form-item>
            <el-form-item v-if="type === 1 && userData.isHasPermiss('merchant.app.layout-scatter')" :label="$t('活动倒计时:')">
                <el-switch v-model="state.countdown" :active-value="1" :inactive-value="0" :active-text="$t('显示')" :inactive-text="$t('隐藏')"
                    @change="handleSwitch('countdown', state.countdown)" />
            </el-form-item>
            <el-form-item v-if="type === 1 && userData.isCustomTemplate">
                <el-checkbox v-model="state.multipleLoginForm.multipleLoginActivity" :true-label="1" :false-label="0"  @change="handleMultipleLogin" >
                  <div style="display: flex;align-items: center;">
                    {{ $t('多个登录活动模式') }}
                    <el-tooltip
                      effect="light"
                      :placement="$locale === 'zh' ? 'right-start' : 'left-start'"
                    >
                      <template #content>
                        <div style="max-width: 300px;">{{ $t('开启则用户可以领取到所有符合条件的登录任务;关闭则用户只能领取到一个符合条件的登录任务') }}</div>
                      </template>
                      <el-icon style="font-size: 18px;margin-left: 6px;"><InfoFilled /></el-icon>
                    </el-tooltip>
                  </div>
                </el-checkbox>
            </el-form-item>
            <el-form-item v-if="type === 1 && metaData.isHaveCustom && userData.isHasPermiss('merchant.promotion.add') ">
                <el-button v-throttle type="primary" @click="state.showTagData = true">{{$t('标签配置')}}</el-button>
            </el-form-item>
        </el-form>

        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column prop="merchant.id" :label="$t('站点ID')" min-width="100" align="center" />
            <el-table-column prop="merchant.name" :label="$t('站点名称')" min-width="120" align="center" />
            <el-table-column v-if="type === 1" prop="sort" :label="$t('排序')" width="80" align="center" />
            <el-table-column prop="id" label="ID" width="80" align="center" />
            <el-table-column prop="name" :label="$t('活动名称')" min-width="200" align="center" />
            <el-table-column prop="type_" :label="$t('活动类型')" min-width="120" align="center" />
            <el-table-column prop="condition_" min-width="160" :label="$t('活动条件')" align="center" />
            <el-table-column :label="$t('参与会员')" align="center">
                <el-table-column prop="fixLayers_" :label="$t('会员层级')" min-width="200" align="center" />
                <!-- <template #default="{ row }">
                        {{row.fixLayers ? getLevelName(row.fixLayers) : ''}}
                    </template>
                </el-table-column> -->
                <el-table-column prop="levels_" :label="$t('会员等级')" min-width="200" align="center" />
            </el-table-column>
            <el-table-column min-width="120" :label="$t('稽核倍数')" align="center">
                <template #default="{ row }">
                    <template v-if="row.type === 10">
                        <div v-if="row.invitedAuditMultiple">{{$t('邀请：')}}{{row.invitedAuditMultiple}}</div>
                        <div v-if="row.successAuditMultiple">{{$t('闯关：')}}{{row.successAuditMultiple}}</div>
                    </template>
                    <template v-else>
                        {{ row.auditMultiple }}
                    </template>
                </template>
            </el-table-column>
            <el-table-column :label="$t('活动时间')" min-width="160" align="center">
                <template #default="{ row }">
                    <div>{{ row.beginTime }}</div>
                    <div>{{ row.endTime }}</div>
                </template>
            </el-table-column>
            <el-table-column :label="$t('展示时间')" min-width="160" align="center">
                <template #default="{ row }">
                    <span v-if="![21,22,24,25].includes(row.type)">
                        <div>{{ row.showBeginTime }}</div>
                        <div>{{ row.showEndTime }}</div>
                    </span>

                </template>
            </el-table-column>
            <el-table-column prop="status_" :label="$t('状态')" min-width="100" align="center" />
            <el-table-column prop="emp.name" :label="$t('操作人')" min-width="100" align="center" />
            <el-table-column prop="updateTime" :label="$t('操作时间')" min-width="160" align="center" />
            <el-table-column fixed="right" :label="$t('操作')" width="180" align="center">
                <template #default="{ row }">
                    <div class="table_operateBtn">
                        <el-button v-throttle type="primary" v-if="(row.type === 28 && userData.isHasPermiss('merchant.promotion-review-log.review')) 
                        || (row.type === 12 && userData.getTemplateType() !== 4 && userData.isHasPermiss('merchant.promotion-review-log.review'))" text @click="manualCheck(row)">{{ $t('人工审核') }}</el-button>
                        <el-button v-throttle
                            v-if="type === 1 && (row.status == '1' || row.status == '2' || row.status == '3') && userData.isHasPermiss('merchant.promotion.edit')"
                            type="primary" text @click="handleConfig(row)">{{$t('修改')}}</el-button>
                        <el-button v-throttle type="primary" text @click="handleConfig(row,1)">{{$t('详情')}}</el-button>
                        <el-button v-throttle
                            v-if="((type === 1 && (row.status == '1' || row.status == '2')) || type !== 1)  && userData.isHasPermiss('merchant.promotion.delete')"
                            type="danger" text @click="handleDel(row.id)">{{$t('删除')}}</el-button>
                        <el-button v-throttle
                            v-if="type === 1 && row.type === 8 && row.status != 1 && row.rules_.type === 0 && userData.isHasPermiss('merchant.promotion.redeemCodes')"
                            type="primary" text @click="state.itemData = {...row},state.showRedeemCode = true">{{$t('兑换码管理')}}</el-button>
                        <el-button v-throttle v-if="type === 2 " type="primary" text @click="handleConfig(row,2)">{{$t('复制')}}</el-button>
                        <el-button v-throttle
                            v-if="type === 1 && row.type === 9 && row.status != 1 && row.status != 2 && userData.isHasPermiss('merchant.promotion.edit')"
                            type="primary" text @click="state.itemData = {...row},state.showActivityAudit = true">{{$t('派发奖励')}}</el-button>
                        <el-button v-throttle v-if="type === 1 && row.status == '3'  && userData.isHasPermiss('merchant.promotion.editStatus')"
                            type="warning" text @click="handleClose(row)">{{$t('关闭')}}</el-button>
                        <el-button v-throttle v-if="row.type === 22 && userData.isHasPermiss('merchant.user-task-config.reviewList')"
                            type="primary" text @click="state.itemData = {...row},state.showManuallyReview = true">{{$t('人工审核')}}</el-button>
                    </div>
                </template>
            </el-table-column>
        </el-table>

        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>

        <AddActivityDialog :itemData="state.itemData" :metaData="state.originalData" :keyDatas="keyDatas" @close="state.showAddActivity = false"

            v-if="state.showAddActivity" @handleAdd="handleAdd" @fetchData="fetchData">
        </AddActivityDialog>
        <ActivityDeployDialog :itemData="state.itemData" :metaData="state.originalData" :keyDatas="keyDatas" @close="state.showActivityDeploy = false"
            v-if="state.showActivityDeploy" @fetchData="fetchData" @previewPicture="previewPicture">
        </ActivityDeployDialog>

        <!-- 新人彩金兑换码相关 -->
        <RedeemCodeDialog ref="codeDialogRef" :itemData="state.itemData" @close="state.showRedeemCode = false" v-if="state.showRedeemCode"
            @showCreate="state.showCreateCode = true">
        </RedeemCodeDialog>
        <CreateCodeDialog v-if="state.showCreateCode" :activityId="state.itemData.id" @close="state.showCreateCode = false" @refresh="refresh(0)">
        </CreateCodeDialog>

        <ManuallyReview v-if="state.showManuallyReview" :itemData="state.itemData" @close="state.showManuallyReview = false"></ManuallyReview>

        <!-- 自定义活动审核/派发奖励 -->
        <ActivityAuditDialog ref="activityAuditRef" v-if="state.showActivityAudit" :metaData="state.originalData" :keyDatas="keyDatas" :itemData="state.itemData"
            @close="state.showActivityAudit = false" @showAuditDialog="showAuditDialog" @showMemberDialog="showMemberDetail">
        </ActivityAuditDialog>
        <ApplyAuditDialog v-if="state.showApplyAudit" :auditData="state.auditData" @close="state.showApplyAudit = false" @refresh="refresh(1)">
        </ApplyAuditDialog>
        <DistributeAwardDialog v-if="state.showDistributeAward" :metaData="state.originalData" :keyDatas="keyDatas" :auditData="state.auditData"
            @close="state.showDistributeAward = false" @refresh="refresh(2)">
        </DistributeAwardDialog>

        <!-- 标签配置 -->
        <TagDataDialog v-if="state.showTagData" @close="state.showTagData = false"></TagDataDialog>
        <ManualReviewDialog v-if="state.showManualReviewDialog" @close="state.showManualReviewDialog = false"></ManualReviewDialog>
        <BalanceRescueDialog v-if="state.showBalanceRescueDialog" :itemData="state.itemData" @close="state.showBalanceRescueDialog = false"></BalanceRescueDialog>

        <div v-if="state.dialogVisible && state.dialogImageUrl" class="preview" @click="state.dialogVisible = false">
            <div class="preview-box">
                <img class="preview-img" :src="state.dialogImageUrl" alt="">
            </div>
        </div>
    </div>
</template>

<script setup>
import { defineAsyncComponent, ref, reactive, onMounted, computed, defineEmits } from "vue"
import { useRouter } from "vue-router"
import userStore from '@/store/user'
import commonStore from '@/store/common'
import { promotionListApi, promotionDeleteApi, promotionEditStatusApi } from "@/api/discounts_center"
import { getCountdown, postHomeDeploy } from '@/api/website'
import { getPayWalletSort } from '@/api/finance'
import { getMultipleLogin, postMusicConfig } from '@/api/operation'
import { getLevelConfig, getUserGradeData, getTicketList, getActivityTagData } from "@/api/common"
import { ElMessageBox } from "element-plus"
import { InfoFilled } from "@element-plus/icons-vue"
import { dateFormat, deepClone, div, getGameVendorData } from "@/common/util"
const AddActivityDialog = defineAsyncComponent(() => import("./components/AddActivityDialog.vue"))
const ActivityDeployDialog = defineAsyncComponent(() => import("./deploy_dialog/ActivityDeployDialog.vue"))
const RedeemCodeDialog = defineAsyncComponent(() => import("./components/RedeemCodeDialog.vue"))
const CreateCodeDialog = defineAsyncComponent(() => import("./components/CreateCodeDialog.vue"))
const ActivityAuditDialog = defineAsyncComponent(() => import("./components/ActivityAuditDialog.vue"))
const ApplyAuditDialog = defineAsyncComponent(() => import("./components/ApplyAuditDialog.vue"))
const DistributeAwardDialog = defineAsyncComponent(() => import("./components/DistributeAwardDialog.vue"))
const TagDataDialog = defineAsyncComponent(() => import("./components/TagDataDialog.vue"))
const ManuallyReview = defineAsyncComponent(() => import("./deploy_dialog/ManuallyReview.vue"))
const ManualReviewDialog = defineAsyncComponent(() => import("./components/manualReviewDialog.vue"))
const BalanceRescueDialog = defineAsyncComponent(() => import("./components/BalanceRescueDialog.vue"))
const noShowTimeList = [24, 25, 26]
const emits = defineEmits(['setSearchData'])
const props = defineProps({
    type: {
        default: 1
    },
    metaData: {
        type: Object,
        default: () => {
            return {}
        }
    },
    keyDatas: {
        type: Array,
        default: () => {
            return []
        },
    },
    initData: {
        type: Object,
        default: () => {
            return {}
        }
    },
})

const defaultData = { 
  multipleLoginActivity: 0,
  radioPlay: 0,
  radioShow: 0
}

const state = reactive({
    originalData: {},
    countdown: 0,
    extData: {
      type: 32,
    },
    multipleLoginForm: {
      ...defaultData
    },
    tableData: [],
    formData: {},
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    itemData: {},
    showAddActivity: false,
    showActivityDeploy: false,
    showCopyActivityTemplate: false,
    dialogImageUrl: '',
    dialogVisible: false,
    showRedeemCode: false,
    showCreateCode: false,
    showActivityAudit: false,
    showApplyAudit: false,
    showDistributeAward: false,
    showTagData: false,
    auditData: {},
    showManuallyReview: false,
    showManualReviewDialog: false,
    showBalanceRescueDialog: false
})
const codeDialogRef = ref(null)
const activityAuditRef = ref(null)
const userData = userStore()
const commonData = commonStore()
const router = useRouter()

const statusList = computed(() => {
    let list = []
    if (props.type === 1) {
        list = props.metaData.promotionStatus
    } else if (props.type === 2) {
        list = props.metaData.promotionStatus.filter(item => item.value === '0' || item.value === '4')
    }
    return list
})

onMounted(() => {
    state.formData = { ...state.formData, ...props.initData }
    state.originalData = deepClone(props.metaData)
    getHomeData()
    fetchData()
    if (userData.isCustomTemplate) {
        getMultipleLoginConfig()
    }
})

const handleMultipleLogin = () => {
  globalVBus.$emit('globalLoading', true)
  const data = {
    ...state.extData,
    value: JSON.stringify(state.multipleLoginForm)
  }
  postMusicConfig(data).then(res => {
      globalVBus.$emit('globalLoading', false)
      if (!state.extData.id) {
        getMultipleLoginConfig()
      }
    }).catch(err => { 
      globalVBus.$emit('globalLoading', false)
      state.multipleLoginActivity = !state.multipleLoginActivity
    })
}

const getMultipleLoginConfig = () => {
    getMultipleLogin().then(res => {
      if (res.data) {
        state.extData.id = res.data.id || ''
        state.extData.type = res.data.type || 32
        state.multipleLoginForm = res.data.config || defaultData
      }
    })
}

// 层级层级ID映射name
const getLevelName = (val) => {
    let arr = []
    let obj = ''
    val.split(',').forEach(item => {
        obj = props.metaData.memberLevel.find(its => its.id === +item)
        if (obj) arr.push(obj.name)
    })
    return arr.join('，')
}

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val) {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {
                siteId: commonData.merchantSiteList.length > 1 ? 0 : ''
            }
        }
    }
    emits('setSearchData', state.formData)
    let params = { ...state.listQuery, ...state.formData }
    if (!params.siteId) delete params.siteId
    // params.siteId = commonData.currentMerchantSite.id
    if (!params.status) params.status = statusList.value.map(item => item.value).join(',')
    globalVBus.$emit('globalLoading', true)
    promotionListApi(params).then(res => {
        let { total, list } = res.data
        state.tableData = list.map(item => {
            item.beginTime && (item.beginTime = dateFormat(item.beginTime))
            item.endTime && (item.endTime = dateFormat(item.endTime))
            item.showBeginTime && (item.showBeginTime = dateFormat(item.showBeginTime))
            item.showEndTime && (item.showEndTime = dateFormat(item.showEndTime))
            item.updateTime && (item.updateTime = dateFormat(item.updateTime))
            if (item.auditMultiple && item.type === 10) {
                if (item.auditMultiple < 100) {
                    item.successAuditMultiple = item.auditMultiple
                } else {
                    let str = JSON.stringify(div(item.auditMultiple, 100))
                    let arr = str.split('.')
                    // item.invitedAuditMultiple = div(arr[0], 1000) || undefined
                    // item.successAuditMultiple = (arr[1] * 1) || undefined
                    item.invitedAuditMultiple =  arr[0] / 1000 || undefined;
                    item.successAuditMultiple = item.auditMultiple % 1000 || undefined;
                }
            }
            if (item.type === 23 || item.type === 21) {
                let arr = []
                item.rules_[item.type === 23 ? 'claimLimits' : 'items'].forEach(its => {
                    arr.push(...its[item.type === 23 ? 'vips' : 'levels'])
                })
                arr.sort((a, b) => a - b)
                item.levels_ = arr.map(its => 'VIP' + its).join(',')
            }
            return item
        })
        state.total = total
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 获取活动倒计时配置数据
const getHomeData = () => {
    globalVBus.$emit('globalLoading', true)
    getCountdown().then(res => {
        let { data } = res
        state.countdown = data.countdown || 0
        globalVBus.$emit('globalLoading', false)
    }).catch((err) => {
        globalVBus.$emit('globalLoading', false)
    })
}

// 提交活动倒计时配置
const handleSwitch = (alias, status) => {
    globalVBus.$emit('globalLoading', true)
    postHomeDeploy({
        alias,
        status,
        type: 'home',
        part: 'scatter',
        // alias: 'countdown',
        // status: state.countdown
    }).then(() => {
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        state[alias] = !state[alias] ? 1 : 0
        globalVBus.$emit('globalLoading', false)
    })
}

// 查看会员详情
const showMemberDetail = (id) => {
    globalVBus.$emit('memberDetailDialog', id)
}

// 派发奖励/审核申请弹窗展示
const showAuditDialog = ({ key, data }) => {
    state.auditData = { ...data }
    state[key] = true
}

// 图片预览
const previewPicture = (val) => {
    state.dialogImageUrl = val
    state.dialogVisible = true
}

const getCommonMetaData = async () => {
    try {
        let { merchant = {}, type } = state.itemData
        globalVBus.$emit('globalLoading', true)
        // 获取会员层级数据
        let res = await getLevelConfig({ merchantId: merchant.id })
        state.originalData.memberLevel = res.data || []
        let ess = await getLevelConfig({ type: 1, merchantId: merchant.id })
        if (ess.data && ess.data.length) {
            state.originalData.memberLevel.forEach(item => {
                if (ess.data.some(its => its.id === item.id)) item.type = 1
            })
        }
        // 获取会员等级数据
        let { data = {} } = await getUserGradeData({ merchantId: merchant.id })
        state.originalData.userLevel = []
        for (let key in data) {
            state.originalData.userLevel.push({
                label: data[key],
                value: key,
            })
        }
        // 获取站点厂家数据
        await getGameVendorData().then(data => {
            state.originalData.merchantVendorList = data
        })
        // 活动类型type: 1: 充值活动; 2: 打码活动; 3: 签到活动; 4: 救援金活动; 5: 幸运转盘; 6: 红包活动; 7: 推广活动; 8: 新人彩金活动; 9: 自定义活动;
        //  10: 闯关邀请活动; 12: 余额救援金活动; 13: 排行榜活动; 21: 兑换码; 22: 注册; 23: 幸运红包抽奖;
        if (![5, 6, 9].includes(type)) {
            // 获取票券数据
            let tickeData = await getTicketList({
                status: 1,
                _size: 999,
                _page: 1,
                merchantId: merchant.id,
            })
            state.originalData.ticketList = tickeData.data?.list || []
        }
        if (merchant.custom) {
            // 获取Tag数据
            let tagData = await getActivityTagData({ merchantId: userData.userInfo.groupId })
            state.originalData.tagList = tagData?.data || []
            // 获取支付方式数据
            if (type === 1) {
                let ess = await getPayWalletSort({ merchantId: merchant.id, tab: 2 })
                state.originalData.payWalletData = ess.data || []
            }
        }
        globalVBus.$emit('globalLoading', false)
        state.showActivityDeploy = true
    } catch (error) {
        globalVBus.$emit('globalLoading', false)
    }
}

// 新增活动
const handleAdd = (row) => {
    state.itemData = {
        ...row,
        operationType: 0,
        type_: props.metaData.promotionType.find(item => +item.value === row.type)?.label || '',
    }
    getCommonMetaData()
}

// 编辑/详情/复制
const handleConfig = (row, type = 0) => {
    // type：0:修改，1:详情，2:复制
    // operationType： 0:新增/复制，1:修改，2:详情
    state.itemData = deepClone(row)
    if (type !== 2) {
        state.itemData.operationType = type === 1 ? 2 : 1
        getCommonMetaData()
        return
    }
    ElMessageBox.confirm($t('配置已复制，确认新增该活动？'), $t('复制'), {
        confirmButtonText: $t('确认'),
        cancelButtonText: $t('取消'),
        type: "warning",
    }).then(() => {
        state.itemData.id = -1
        state.itemData.operationType = 0
        state.itemData.status = 1
        if (commonData.merchantSiteList.length > 1) {
            delete state.itemData.fixLayers
            delete state.itemData.levels
            state.showAddActivity = true
        } else {
            getCommonMetaData()
        }
    }).catch(() => { })
}

//点击删除
const handleDel = (id) => {
    ElMessageBox.confirm($t('删除后不可恢复，确认要删除吗？'), $t('删除'), {
        confirmButtonText: $t('确认'),
        cancelButtonText: $t('取消'),
        type: "error",
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        promotionDeleteApi({ id }).then(() => {
            fetchData();
        }).catch(() => {
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(() => { })
}

//点击关闭活动
const handleClose = (value) => {
    ElMessageBox.confirm($t('确认要关闭活动吗？'), $t('关闭活动'), {
        confirmButtonText: $t('确认'),
        cancelButtonText: $t('取消'),
        type: "error",
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        promotionEditStatusApi({ id: value.id, status: 0, type: 0 }).then(() => {
            fetchData();
        }).catch(() => {
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(() => { })
}

const refresh = (type = 0) => {
    // type: 0为新人活动兑换码列表，1为自定义活动申请列表，2为自定义活动奖励派发列表
    if (type) {
        activityAuditRef.value.refreshDistribute()
        activityAuditRef.value.refreshAudit()
    } else {
        codeDialogRef.value.refresh()
    }
}
const manualCheck = (row) => {
    if (row.type === 28) {
        state.showManualReviewDialog = true
    } else {
        state.showBalanceRescueDialog = true
    }
    state.itemData = row
}
</script>

<style lang="scss" scoped>
</style>
