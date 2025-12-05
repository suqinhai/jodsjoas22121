<template>
    <!-- 用户管理-层级设置 -->
    <div class="container member-level-setting">
        <el-form class="filter-form" :model="state.formData" inline>
            <el-form-item :label="$t('当前站点:')" v-if="commonData.merchantSiteList.length > 1">
                <MerchantSiteSelect isNeedDefault :clearable="false" v-model="state.formData.merchantId" @change="fetchData('search')">
                </MerchantSiteSelect>
            </el-form-item>
            <el-form-item :label="$t('添加方式:')">
                <el-select v-model="state.formData.type" clearable :placeholder="$t('选择添加方式')">
                    <el-option :label="$t('自动')" :value="0" />
                    <el-option :label="$t('固定')" :value="1" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="state.showConfigDialog = true" v-permiss="'merchant.user-level.edit'">
                    {{$t('新增/编辑')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="showDialog({},'showFixedAddMember')" v-permiss="'merchant.user-level.edit'">
                    {{$t('添加固定层级会员')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table :data="state.tableData" border>
            <el-table-column prop="id" :label="$t('序号')" min-width="80" align="center" />
            <el-table-column prop="addTime" :label="$t('创建时间')" width="160" align="center">
                <template #default="{ row }">
                    {{ dateFormat(row.addTime) }}
                </template>
            </el-table-column>
            <el-table-column prop="name" :label="$t('层级名称')" min-width="120" align="center" />
            <el-table-column :label="$t('层级条件')" min-width="240" align="center">
                <template #default="{ row }">
                    <div v-if="row.type">{{row.remark}}</div>
                    <div v-else>
                        <span>{{$t('累计充值金额：')}}{{row.sum || $t('无')}}</span>
                        <span>{{$t('；充值次数：')}}{{row.num || $t('无')}}</span>
                        <span>{{$t('；盈利额度：')}}{{row.diff || $t('无')}}</span>
                    </div>
                </template>
            </el-table-column>
            <el-table-column :label="$t('添加方式')" min-width="100" align="center">
                <template #default="{ row }">
                    {{row.type ? $t('固定') : $t('自动')}}
                </template>
            </el-table-column>
            <el-table-column :label="$t('层级人数')" min-width="100" align="center">
                <template #default="{ row }">
                    <span v-if="!userData.isHasPermiss('merchant.merchant-layer-config.userList') || !row.total">{{row.total || 0}}</span>
                    <span v-else class="special pointer" @click="showDialog(row,'populationDialogShow')">{{row.total || 0}}</span>
                </template>
            </el-table-column>
        </el-table>

        <LevelConfigDialog :userHandleType="state.userHandleType" :merchantId="state.currentMerchantId" v-if="state.showConfigDialog"
            @fetchData="fetchData" @close="state.showConfigDialog = false" />
        <LevelPopulationDialog ref="levelPopulationRef" :itemData="state.itemData" :merchantId="state.currentMerchantId"
            v-if="state.showPopulationDialog" @showDialog="showDialog" @fetchData="fetchData" @close="state.showPopulationDialog = false" />
        <MemberFixedLevelDialog v-if="state.showFixedAddMember" :memberLevelInfo="state.memberLevelInfo" :merchantId="state.currentMerchantId"
            :dataList="state.fixedLevelList" @close="state.showFixedAddMember = false" @refreshData="refreshData" @fetchData="fetchData" />
        <!-- <ExplainDialog v-if="state.showExplain" @close="state.showExplain = false"></ExplainDialog> -->
    </div>
</template>

<script setup name="memberLevelSetting">
import { ref, reactive, defineAsyncComponent, onActivated, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import userStore from '@/store/user'
import commonStore from '@/store/common'
import { getLevelList } from '@/api/risk_control'
import { getCommonMeta } from '@/api/common'
import { dateFormat } from "@/common/util/index"
const LevelConfigDialog = defineAsyncComponent(() => import('./components/LevelConfigDialog.vue'))
const LevelPopulationDialog = defineAsyncComponent(() => import('./components/LevelPopulationDialog.vue'))
const MemberFixedLevelDialog = defineAsyncComponent(() => import('./components/MemberFixedLevelDialog.vue'))
// const ExplainDialog = defineAsyncComponent(() => import('./components/ExplainDialog.vue'))

const state = reactive({
    formData: {},
    tableData: [],
    showExplain: false,
    showConfigDialog: false,
    showPopulationDialog: false,
    showFixedAddMember: false,
    itemData: {},
    memberLevelInfo: {},
    isInit: true,
    userHandleType: [],
    fixedLevelList: [],
    currentMerchantId: ''
})
const route = useRoute()
const userData = userStore()
const commonData = commonStore()
const levelPopulationRef = ref(null)

const isPermiss = computed(() => {
    return userData.isHasPermiss('merchant.merchant-layer-config.edit')
})

onMounted(() => {
    if (commonData.isManual) state.isInit = false
    if (route.query.merchantId && +route.query.merchantId !== commonData.currentMerchantSite.id && !commonData.isManual) {
        commonData.setCurrentMerchantSite(+route.query.merchantId)
        return
    }
    getCommonMeta({ types: 'userHandleType' }).then(res => {
        state.userHandleType = res.data.userHandleType || {}
        if (state.userHandleType.length) {
            state.userHandleType = state.userHandleType.filter(item => item.value !== '1' && item.value !== '3' && item.value !== '10' && item.value !== '11')
            state.userHandleType.forEach(item => {
                switch (item.value) {
                    case '4':
                        item.label += $t('（无法进游戏，其他操作不影响）')
                        break
                    case '6':
                        item.label += $t('（无法发起提现，其他操作不影响）')
                        break
                    case '8':
                        item.label += $t('（无法领取活动、任务、vip奖励，代理佣金）')
                        break
                }
            })
        }
    })
    fetchData()
})

onActivated(() => {
    if (state.isInit) return state.isInit = false
    if (route.query.merchantId && +route.query.merchantId !== commonData.currentMerchantSite.id && !commonData.isManual) {
        commonData.setCurrentMerchantSite(+route.query.merchantId)
    }
})

const fetchData = (val = '') => {
    if (val === 'reset') {
        state.formData = {
            merchantId: commonData.merchantSiteList.length > 1 ? commonData.merchantSiteList[0].id : ''
        }
    }
    globalVBus.$emit('globalLoading', true)
    getLevelList(state.formData).then(res => {
        state.tableData = res.data || []
        state.currentMerchantId = state.formData.merchantId
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

const showDialog = (val, key) => {
    if (key === 'populationDialogShow') {
        state.itemData = {
            ...val,
            dataList: state.tableData.filter(item => item.type === val.type)
        }
        state.showPopulationDialog = true
    } else {
        globalVBus.$emit('globalLoading', true)
        getLevelList({ type: 1, merchantId: state.currentMerchantId }).then(res => {
            state.fixedLevelList = res.data || []
            state.memberLevelInfo = val
            state.showFixedAddMember = true
            globalVBus.$emit('globalLoading', false)
        }).catch(err => {
            state.fixedLevelList = []
            globalVBus.$emit('globalLoading', false)
        })
    }
}

const refreshData = () => {
    if (levelPopulationRef.value) return levelPopulationRef.value.getData()
}
</script>

<style lang="scss">
.member-level-setting {
}
</style>
