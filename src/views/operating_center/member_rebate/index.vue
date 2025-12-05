<template>
    <!-- 运营中心-会员返利 -->
    <div class="container member-rebate">
        <div class="head" v-permiss="'merchant.rebate-config.baseEdit'">
            <el-tooltip placement="left" popper-class="tooltip-max-width">
                <template #content>
                    <div>{{ $t('说明：') }}</div>
                    <div>{{ $t('会员返利也为返水：指的是会员有效投注达到额度可获得比例奖励。') }}</div>
                    <div>{{ $t('实时返水将每次下注结算后计算出返水额度，为每一笔下注均单独计算，系统保留两位小数；-0.0001万（如0.1为1千，0.01为1百）；') }}</div>
                    <div>{{ $t('每日领取次数：默认0，限制0-100次，0表示不限制次数，达到设置上限时，当日不可领取；未领取额度次日不会清零，仍可继续累计领取；') }}</div>
                    <div>{{ $t('示例：如vip1投注100返水5%,投注200返水6%，会员已累计投注110下注0.1,则计算低于两位小数，不可获得返水，累计投注110下注15，则按档位5%获得0.75，累计投注200下注20，则按档位6%获得1.2。') }}</div>
                </template>
                <el-icon :size="20">
                    <QuestionFilled />
                </el-icon>
            </el-tooltip>
            <el-button class="ml10" v-throttle type="primary" @click="handleSync({level: 0},true)">{{$t('全部同步VIP0配置')}}</el-button>
            <el-button v-throttle style="margin-left: 20px" type="primary" @click="handleBasics">{{$t('基础配置')}}</el-button>
        </div>
        <el-table :data="state.tableData" border>
            <el-table-column prop="id" label="ID" width="120" align="center" />
            <el-table-column prop="level_" :label="$t('参与会员等级')" min-width="140" align="center" />
            <el-table-column prop="emp.name" :label="$t('操作人')" min-width="140" align="center" />
            <el-table-column prop="updateTime" :label="$t('操作时间')" min-width="160" align="center" />
            <el-table-column fixed="right" align="center" :label="$t('操作')" min-width="140">
                <template #default="{ row }">
                    <el-button v-throttle type="primary" text @click="handleConfig(row,1)">{{$t('详情')}}</el-button>
                    <el-button v-permiss="'merchant.rebate-config.addOrEdit'" v-throttle type="primary" text @click="handleConfig(row)">{{$t('修改')}}
                    </el-button>
                    <el-button v-permiss="'merchant.rebate-config.addOrEdit'" v-if="row.level" v-throttle type="primary" text
                        @click="handleSync(row,false)">{{$t('同步上级配置')}}</el-button>
                </template>
            </el-table-column>
        </el-table>

        <BasicsDeployDialog v-if="state.showBasicsDialog" :itemData="state.basicData" :merchantVendorList="state.merchantVendorList"
            @close="state.showBasicsDialog = false">
        </BasicsDeployDialog>
        <EditDialog v-if="state.showEdit" :itemData="state.itemData" :merchantVendorList="state.merchantVendorList" @fetchData="fetchData"
            @close="state.showEdit = false">
        </EditDialog>
    </div>
</template>

<script setup name='memberRebate'>
import { reactive, onMounted, defineAsyncComponent, onActivated } from 'vue'
import { useRoute } from 'vue-router'
import commonStore from '@/store/common'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRebateActivityList, getRebateActivityData, getRebateActivityBaseConfig, postSyncRebateConfig } from "@/api/discounts_center.js"
import { dateFormat, getGameVendorData } from '@/common/util'
const BasicsDeployDialog = defineAsyncComponent(() => import('./components/BasicsDeployDialog.vue'))
const EditDialog = defineAsyncComponent(() => import('./components/EditDialog.vue'))

const state = reactive({
    itemData: {},
    tableData: [],
    showBasicsDialog: false,
    showEdit: false,
    merchantVendorList: [],
    basicData: {},
    isInit: true
})
const route = useRoute()
const commonData = commonStore()

onMounted(() => {
    if (commonData.isManual) state.isInit = false
    if (route.query.merchantId && +route.query.merchantId !== commonData.currentMerchantSite.id && !commonData.isManual) {
        commonData.setCurrentMerchantSite(+route.query.merchantId)
        return
    }
    fetchData()
    getGameVender()
})

onActivated(() => {
    if (state.isInit) return state.isInit = false
    if (route.query.merchantId && +route.query.merchantId !== commonData.currentMerchantSite.id && !commonData.isManual) {
        commonData.setCurrentMerchantSite(+route.query.merchantId)
    }
})

// 表格过滤数据处理
const fetchData = () => {
    getRebateActivityList().then(res => {
        state.tableData = res.data.map(item => {
            item.updateTime && (item.updateTime = dateFormat(item.updateTime))
            return item
        })
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 获取商家支持的厂家与游戏类型
const getGameVender = () => {
    getGameVendorData().then(data => {
        state.merchantVendorList = data
    })
}

// 获取基础配置
const handleBasics = () => {
    globalVBus.$emit('globalLoading', true)
    getRebateActivityBaseConfig().then(res => {
        state.basicData = res.data
        globalVBus.$emit('globalLoading', false)
        state.showBasicsDialog = true
    }).catch(err => {
        globalVBus.$emit('globalLoading', false)
    })
}

// 详情/编辑
const handleConfig = ({ level, level_ }, type = 0) => {
    if (!state.merchantVendorList.length) return ElMessage.warning($t('未获取到当前商户已开启的游戏数据，请刷新页面或前往游戏管理进行配置后再进行操作！'))
    globalVBus.$emit('globalLoading', true)
    getRebateActivityData({ level }).then(res => {
        state.itemData = res.data || { level_ }
        state.itemData.dialogType = type
        globalVBus.$emit('globalLoading', false)
        state.showEdit = true
    }).catch(err => {
        globalVBus.$emit('globalLoading', false)
    })
}

// 同步上级配置
const handleSync = ({ id, level }, syncAll) => {
    ElMessageBox.confirm(`${$t('确定要')}${!syncAll ? $t('同步上一等级的配置') : $t('将VIP0的配置同步到所有等级')}?`, $t('提示'), {
        confirmButtonText: $t('确 定'),
        cancelButtonText: $t('取消'),
        type: 'warning',
    }).then(() => {
        let obj = { level, syncAll }
        if (!syncAll) obj.id = id
        globalVBus.$emit('globalLoading', true)
        postSyncRebateConfig(obj).then(res => {
            fetchData()
        }).catch(err => {
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(() => { })
}
</script>

<style lang="scss" scoped>
.member-rebate {
    min-width: 900px;
    .head {
        width: 100%;
        display: flex;
        justify-content: flex-end;
        padding-right: 20px;
        margin-bottom: 10px;
        align-items: center;
    }
}
</style>
