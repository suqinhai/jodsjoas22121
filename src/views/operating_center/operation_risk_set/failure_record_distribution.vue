<template>
    <!-- 运营中心-风险运营配置-发放失败记录 -->
    <div class="container member-report">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" :start-placeholder="$t('开始时间')"
                    :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts"
                    :clearable="false" value-format="YYYY-MM-DD">
                </el-date-picker>
            </el-form-item>
            <el-form-item :label="$t('会员ID:')">
                <el-input @input="(val) => state.formData.userId = val.replace(/\D/g,'')"
                    v-model="state.formData.userId" :placeholder="$t('请输入会员ID')" />
            </el-form-item>
            <el-form-item :label="$t('会员账号:')">
                <el-input v-model="state.formData.username" :placeholder="$t('请输入会员账号')" />
            </el-form-item>
            <el-form-item :label="$t('活动类型:')">
                <el-select class="select-box" clearable v-model="state.formData.promotionType"
                    :placeholder="$t('请选择活动类型')">
                    <el-option v-for="item in (commonData.currentMerchantSite.custom ? state.customMarketType : state.marketType)" :key="item.value" :label="item.label"
                        :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('')">{{$t('刷 新')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('export')">{{$t('导出报表')}}</el-button>
            </el-form-item>
        </el-form>
        <div class="tips-box">{{$t('注：仅记录会员达到活动条件时，系统自动发放失败的记录（不检测领奖设备限制，判断满足条件时为成功，系统自动发奖并移除失败记录）。')}}</div>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column :label="$t('会员ID')" min-width="120" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.user.id)">
                        {{ row.user.id }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('会员账号')" min-width="140" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.user.id)">
                        {{ row.user.name }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('活动类型')" min-width="140" align="center">
                <template #default="{ row }">
                    {{ row.type_ }}
                </template>
            </el-table-column>
            <el-table-column prop="name" :label="$t('优惠名称')" min-width="100" align="center" />
            <el-table-column prop="failReason" :label="$t('失败原因')" min-width="100" align="center" />
            <el-table-column prop="addTime_" :label="$t('触发时间')" min-width="100" align="center" />
            <el-table-column prop="status_" :label="$t('状态')" min-width="100" align="center" />
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size"
            v-model:page="state.listQuery._page" @pagination="fetchData"></Pagination>
    </div>
</template>

<script setup name='failureRecordDistribution'>
    import { reactive, onMounted } from 'vue'
    import { getRewardGrantFailLog } from '@/api/discounts_center'
    import { dateFormat, getCurrentWeekTime, getShortcuts, deepClone, disabledCurrentDateAfter } from '@/common/util'
    import commonStore from '@/store/common'
    const commonData = commonStore()

    let shortcuts = getShortcuts()
    const state = reactive({
        formData: {},
        tableData: [],
        total: 0,
        listQuery: {
            _page: 1,
            _size: 10,
        },
        currentWeek: [],
        marketType: [{
            value: 1,
            label: $t('充值')
        }, {
            value: 13,
            label: $t('排行榜')
        }],
        customMarketType: [
            {
                value: 4,
                label: $t('救援金')
            }, {
                value: 13,
                label: $t('排行榜')
            },{
                value: 25,
                label: $t('登录')
            }, {
                value: 26,
                label: $t('里程碑')
            }
        ]
    })

    onMounted(() => {
        state.currentWeek = getCurrentWeekTime()
        state.formData.receiveTime = deepClone(state.currentWeek)
        fetchData()
    })

    // 表格过滤数据处理
    const fetchData = (val = '') => {
        if (val && val !== 'export') {
            state.listQuery._page = 1
            if (val === 'reset') {
                state.formData = {
                    receiveTime: deepClone(state.currentWeek)
                }
            }
        }
        let params = { ...state.listQuery, ...state.formData }
        let { receiveTime } = state.formData
        if (receiveTime && receiveTime.length) {
            params['interval.begin'] = receiveTime[0]
            params['interval.end'] = receiveTime[1]
        }
        delete params.receiveTime
        if (val === 'export') params.isExport = true
        globalVBus.$emit('globalLoading', true)
        getRewardGrantFailLog(params).then(res => {
            if (!params.isExport) {
                let { total, list } = res.data
                state.tableData = list
                state.total = total
            }
            globalVBus.$emit('globalLoading', false)
        }).catch(err => {
            if (!params.isExport) state.tableData = []
            globalVBus.$emit('globalLoading', false)
        })
    }

    // 查看会员详情
    const showMemberDetail = (id) => {
        globalVBus.$emit('memberDetailDialog', id)
    }
</script>

<style lang="scss">
    .member-report {}
</style>