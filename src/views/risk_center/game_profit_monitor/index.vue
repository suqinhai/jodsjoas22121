<template>
    <!-- 风险中心-游戏获利监控 -->
    <div class="container gameProfitMonitor">
        <el-form class="filter-form" :model="searchData" inline>
            <el-form-item :label="$t('触发时间:')">
                <el-date-picker v-model="searchData.receiveTime" type="daterange" value-format="YYYY-MM-DD" :start-placeholder="$t('开始时间')"
                    :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" />
            </el-form-item>
            <el-form-item :label="$t('会员ID:')">
                <el-input @input="(val) => searchData.userId = val.replace(/\D/g,'')" v-model="searchData.userId" :placeholder="$t('请输入会员ID')" />
            </el-form-item>
            <el-form-item :label="$t('会员账号:')">
                <el-input v-model="searchData.username" :placeholder="$t('请输入会员账号')" />
            </el-form-item>
            <el-form-item :label="$t('登录IP:')">
                <el-input v-model="searchData.lastLoginIp" :placeholder="$t('请输入登录IP')" />
            </el-form-item>
            <el-form-item :label="$t('监控类型:')">
                <el-select class="select-box" v-model="searchData.spyType" clearable :placeholder="$t('请选择监控类型')">
                    <el-option v-for="item in spyTypeList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('状态:')">
                <el-select class="select-box" v-model="searchData.status" clearable :placeholder="$t('请选择状态')">
                    <el-option v-for="item in statusList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item v-permiss="'admin.user-profit-spy-log.view'">
                <el-button v-throttle type="primary" @click="handleMonitorParams">{{$t('监控参数')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('export')">{{$t('导出会员账号')}}</el-button>
            </el-form-item>
        </el-form>

        <el-table class="table-box" :data="state.userProfitSpyList" border>
            <el-table-column :label="$t('会员ID')" min-width="120" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.user.id)">{{row.user?.id || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('会员账号')" min-width="140" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.user.id)">{{row.user?.name || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="userStatus_" :label="$t('会员状态')" align="center" min-width="120" />
            <el-table-column prop="lastLoginIp" :label="$t('登录IP')" align="center" min-width="140" />
            <el-table-column prop="source_" :label="$t('注册来源')" align="center" min-width="120" />
            <el-table-column prop="spyType" :label="$t('监控类型')" align="center" min-width="140" />
            <el-table-column prop="args" :label="$t('实际参数')" align="center" min-width="140" />
            <el-table-column prop="playId" :label="$t('注单编号')" align="center" min-width="140" />
            <el-table-column prop="addTime" :label="$t('触发时间')" align="center" min-width="160">
                <template #default="{ row }">
                    <span>{{ dateFormat(row.addTime) }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="status" :label="$t('状态')" align="center" min-width="120">
                <template #default="{ row }">
                    <span>{{ statusList.find(item => item.value == row.status)?.label || '' }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="remark" :label="$t('备注')" align="center" min-width="140" />
            <el-table-column :label="$t('操作人')" align="center" min-width="140">
                <template #default="{ row }">
                    <span>{{ row.emp && row.emp ? row.emp.name : '' }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="updateTime" :label="$t('操作时间')" align="center" min-width="160">
                <template #default="{ row }">
                    <span>{{ dateFormat(row.updateTime) }}</span>
                </template>
            </el-table-column>
            <el-table-column fixed="right" prop="" :label="$t('操作')" align="center" width="120">
                <template #default="{ row }">
                    <div class="table_operate nowrap">
                        <el-button v-permiss="'admin.user-profit-spy-log.audit'" v-throttle type="primary" text @click="handleDid(row)">{{$t('处理')}}
                        </el-button>
                        <el-button v-if="row.playId" v-throttle type="primary" text @click="handleDetail(row)">{{$t('详情')}}</el-button>
                    </div>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:page="pageConfig._page" v-model:limit="pageConfig._size"
            @pagination="fetchData">
        </Pagination>

        <MonitorParamsDialog @close="showMonitorParamsDialog = false" @showExplainDialog="showExplain = true" v-if="showMonitorParamsDialog">
        </MonitorParamsDialog>
        <DealDialog @close="showDealDialog = false" v-if="showDealDialog" :dealData="dealData" :statusList="statusList"
            @refreshData="fetchData('search')">
        </DealDialog>
        <DetailsDialog @close="showDetailsDialog = false" :detailsForm="detailsData" v-if="showDetailsDialog"></DetailsDialog>
        <ExplainDialog v-if="showExplain" @close="showExplain = false"></ExplainDialog>
    </div>
</template>

<script setup name="gameProfitMonitor">
import { defineAsyncComponent, reactive, ref, onMounted, onActivated } from "vue"
import { useRoute } from 'vue-router'
import commonStore from '@/store/common'
import { dateFormat, getShortcuts, disabledCurrentDateAfter } from "@/common/util/index"
import { userProfitSpyListApi } from "@/api/risk_control"
import { gamePlayLogDetailApi } from "@/api/statistics"
import { getCommonMeta } from "@/api/common.js"
const MonitorParamsDialog = defineAsyncComponent(() => import("./components/MonitorParamsDialog.vue"))
const DealDialog = defineAsyncComponent(() => import("./components/DealDialog.vue"))
const DetailsDialog = defineAsyncComponent(() => import("./components/DetailsDialog.vue"))
const ExplainDialog = defineAsyncComponent(() => import("./components/ExplainDialog.vue"))

const shortcuts = getShortcuts()
const spyTypeList = ref([])
const statusList = ref([])
const showMonitorParamsDialog = ref(false)
const showDealDialog = ref(false)
const showDetailsDialog = ref(false)
const searchData = ref({})
const userId = ref('')
const showExplain = ref(false)
const route = useRoute()
const commonData = commonStore()
const state = reactive({
    userProfitSpyList: [], //主列表数据
    total: 0,
    isInit: true,
})
const pageConfig = reactive({
    _page: 1,
    _size: 10,
})

onMounted(() => {
    if (commonData.isManual) state.isInit = false
    if (route.query.merchantId && +route.query.merchantId !== commonData.currentMerchantSite.id && !commonData.isManual) {
        commonData.setCurrentMerchantSite(+route.query.merchantId)
        return
    }
    getCommonMeta({
        types: "spyType,userProfitSpyStatus",
    }).then(({ status, data = {} }) => {
        if (status == 'OK') {
            spyTypeList.value = data.spyType || []
            statusList.value = data.userProfitSpyStatus || []
        }
    })
    userId.value = route.query.userId
    searchData.value = {
        userId: userId.value
    }
    fetchData()
})

onActivated(() => {
    if (state.isInit) return state.isInit = false
    if (route.query.merchantId && +route.query.merchantId !== commonData.currentMerchantSite.id && !commonData.isManual) {
        commonData.setCurrentMerchantSite(+route.query.merchantId)
        return
    }
    if (userId.value !== route.query.userId) {
        userId.value = route.query.userId
        searchData.value = {
            userId: userId.value
        }
        fetchData('search')
    }
})

const fetchData = (val = '') => {
    if (val && val !== 'export') {
        pageConfig._page = 1
        if (val === 'reset') {
            searchData.value = {
                userId: userId.value
            }
        }
    }
    let params = {
        ...searchData.value,
        ...pageConfig,
    }
    let { receiveTime } = searchData.value
    if (receiveTime && receiveTime.length) {
        params['interval.begin'] = receiveTime[0]
        params["interval.end"] = receiveTime[1]
    }
    delete params.receiveTime
    if (val === 'export') params.isExport = true
    globalVBus.$emit('globalLoading', true)
    userProfitSpyListApi(params).then(res => {
        if (!params.isExport) {
            let { total, list } = res.data
            state.userProfitSpyList = list
            state.total = total
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        if (!params.isExport) state.userProfitSpyList = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 查看会员详情
const showMemberDetail = (id) => {
    globalVBus.$emit('memberDetailDialog', id)
}

//点击监控参数
const handleMonitorParams = () => {
    showMonitorParamsDialog.value = true
}

//点击处理
const dealData = ref({});
const handleDid = (row) => {
    dealData.value = row
    showDealDialog.value = true
};

//点击详情
const detailsData = ref({})
const handleDetail = (row) => {
    gamePlayLogDetailApi({ id: row.playId }).then(({ status, data }) => {
        if (status == 'OK' && data) {
            detailsData.value = data
            showDetailsDialog.value = true
        }
    })
}
</script>

<style lang="scss">
.gameProfitMonitor {
}
</style>
