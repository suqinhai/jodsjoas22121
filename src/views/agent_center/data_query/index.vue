<template>
    <!-- 代理数据查询 -->
    <div class="container agent-data-query">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" value-format="YYYY-MM-DD" :start-placeholder="$t('开始时间')"
                    :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" />
            </el-form-item>
            <el-form-item>
                <el-select style="width: 100px" v-model="state.selectType" @change="state.inputValue = ''">
                    <el-option v-for="item in optionData" :key="item.id" :label="item.title" :value="item.id" />
                </el-select>
                <div>
                    <el-input v-model="state.inputValue" :placeholder="optionData[state.selectType].placeholder" />
                </div>
            </el-form-item>
            <el-form-item :label="$t('上级代理ID:')">
                <el-input @input="(val) => state.formData.inviteUserId = val.replace(/\D/g,'')" v-model="state.formData.inviteUserId"
                    :placeholder="$t('请输入上级代理ID')" />
            </el-form-item>
            <el-form-item :label="$t('注册来源:')">
                <el-select class="select-box" v-model="state.formData.userSource" clearable :placeholder="$t('请选择注册来源')">
                    <el-option v-for="item in metaData.userSource" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('export')">{{$t('导出报表')}}</el-button>
            </el-form-item>
            <!-- <el-form-item>
                <el-checkbox-group v-model="state.dataTypeList">
                    <el-checkbox :label="1">{{$t('直属数据')}}</el-checkbox>
                    <el-checkbox :label="2">{{$t('其他数据')}}</el-checkbox>
                    <el-checkbox :label="3">{{$t('个人数据')}}</el-checkbox>
                </el-checkbox-group>
            </el-form-item> -->
        </el-form>
        <div class="tips-box">{{$t('数据更新时间：5分钟')}}</div>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column prop="userId" :label="$t('会员ID(代理)')" min-width="120" align="center" />
            <el-table-column :label="$t('代理账号')" min-width="120" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.userId)">
                        {{ row.username }}
                    </span>
                </template>
            </el-table-column>
            <!-- <el-table-column :label="$t('代理等级')" min-width="100" align="center">
                <template #default="{ row }">
                    {{ row.level }}
                </template>
            </el-table-column> -->
            <el-table-column :label="$t('上级代理账号')" min-width="120" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.agentUserId)">
                        {{ row.agentUsername }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('上级代理ID')" min-width="100" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.agentUserId)">
                        {{ row.agentUserId }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('注册来源')" min-width="100" align="center">
                <template #default="{ row }">
                    {{metaData.userSource.find(item => +item.value === row.userSource)?.label || ''}}
                </template>
            </el-table-column>

            <el-table-column v-if="isCheckedDirectly" prop="nextUserCount" :label="$t('新增直属成员')" min-width="120" align="center" />
            <el-table-column v-if="isCheckedDirectly" prop="nextRechargeAmount" :label="$t('新增直属成员充值')" min-width="140" align="center" />
            <el-table-column v-if="isCheckedDirectly" prop="totalNextUserCount" :label="$t('总直属成员')" min-width="120" align="center" />
            <el-table-column v-if="isCheckedDirectly" width="220" align="center">
                <template #header>{{$t('直属当日注册充值金额/人数')}}
                    <el-tooltip effect="dark" :content="$t('统计下级（直属）人员当日注册，并在当日进行充值的金额和人数')" placement="top">
                        <el-icon class="pointer" :size="15">
                            <QuestionFilled />
                        </el-icon>
                    </el-tooltip>
                </template>
                <template #default="{ row }">
                    {{row.nextRegRechargeAmount || 0}}/{{row.nextRegRechargeNum || 0}}
                </template>
            </el-table-column>
            <el-table-column v-if="isCheckedDirectly" width="170" align="center">
                <template #header>{{$t('直属首充金额/人数')}}
                    <el-tooltip effect="dark" :content="$t('统计下级（直属）人员触发首次充值的金额和触发人数')" placement="top">
                        <el-icon class="pointer" :size="15">
                            <QuestionFilled />
                        </el-icon>
                    </el-tooltip>
                </template>
                <template #default="{ row }">
                    {{row.nextFirstTotalRechargeAmount || 0}}/{{row.nextFirstTotalRechargeUserCount || 0}}
                </template>
            </el-table-column>
            <el-table-column v-if="isCheckedDirectly" width="180" align="center">
                <template #header>{{$t('总直属充值金额/人数')}}
                    <el-tooltip effect="dark" :content="$t('统计总下级（直属）人员的成功充值金额和人数')" placement="top">
                        <el-icon class="pointer" :size="15">
                            <QuestionFilled />
                        </el-icon>
                    </el-tooltip>
                </template>
                <template #default="{ row }">
                    {{row.nextTotalRechargeAmount || 0}}/{{row.nextTotalRechargeUserCount || 0}}
                </template>
            </el-table-column>
            <el-table-column v-if="isCheckedDirectly" width="180" align="center">
                <template #header>{{$t('总直属提现金额/人数')}}
                    <el-tooltip effect="dark" :content="$t('统计总下级（直属）人员的成功提现金额和人数')" placement="top">
                        <el-icon class="pointer" :size="15">
                            <QuestionFilled />
                        </el-icon>
                    </el-tooltip>
                </template>
                <template #default="{ row }">
                    {{row.nextTotalCashAmount || 0}}/{{row.nextTotalCashUserCount || 0}}
                </template>
            </el-table-column>
            <el-table-column v-if="isCheckedDirectly" prop="nextTotalValidCoin" :label="$t('直属有效投注')" min-width="120" align="center" />
            <el-table-column v-if="isCheckedDirectly" prop="nextUserValidCount" :label="$t('直属投注人数')" min-width="120" align="center" />
            <el-table-column v-if="isCheckedDirectly" prop="nextTotalCoin" :label="$t('直属业绩')" min-width="120" align="center" />
            <el-table-column v-if="isCheckedDirectly" prop="nextTotalWinLoseCoin" :label="$t('直属输赢')" min-width="120" align="center" />
            <el-table-column v-if="isCheckedDirectly" prop="nextDiscountAmount" :label="$t('直属优惠')" min-width="120" align="center" />

            <el-table-column v-if="isCheckedOther" prop="otherUserCount" :label="$t('新增其他成员')" min-width="120" align="center" />
            <el-table-column v-if="isCheckedOther" prop="otherFirstTotalRechargeAmount" :label="$t('新增其他成员首次充值')" width="170" align="center" />
            <el-table-column v-if="isCheckedOther" prop="otherRegRechargeAmount" :label="$t('其他注册充值金额')" min-width="140" align="center" />
            <el-table-column v-if="isCheckedOther" prop="otherRegRechargeNum" :label="$t('其他注册充值人数')" min-width="140" align="center" />
            <el-table-column v-if="isCheckedOther" prop="totalOtherUserCount" :label="$t('其他成员')" min-width="120" align="center" />
            <el-table-column v-if="isCheckedOther" :label="$t('其他当日注册充值金额/人数')" width="200" align="center">
                <template #default="{ row }">
                    {{row.otherRegRechargeAmount || 0}}/{{row.otherRegRechargeNum || 0}}
                </template>
            </el-table-column>
            <el-table-column v-if="isCheckedOther" :label="$t('其他首充金额/人数')" width="160" align="center">
                <template #default="{ row }">
                    {{row.otherFirstTotalRechargeAmount || 0}}/{{row.otherFirstTotalRechargeUserCount || 0}}
                </template>
            </el-table-column>
            <el-table-column v-if="isCheckedOther" :label="$t('其他充值/人数')" width="130" align="center">
                <template #default="{ row }">
                    {{row.otherTotalRechargeAmount || 0}}/{{row.otherTotalRechargeUserCount || 0}}
                </template>
            </el-table-column>
            <el-table-column v-if="isCheckedOther" :label="$t('其他提现/人数')" width="130" align="center">
                <template #default="{ row }">
                    {{row.otherTotalCashAmount || 0}}/{{row.otherTotalCashUserCount || 0}}
                </template>
            </el-table-column>
            <el-table-column v-if="isCheckedOther" prop="otherTotalValidCoin" :label="$t('其他有效投注')" min-width="120" align="center" />
            <el-table-column v-if="isCheckedOther" prop="otherUserValidCount" :label="$t('其他投注人数')" min-width="120" align="center" />
            <el-table-column v-if="isCheckedOther" prop="otherTotalCoin" :label="$t('其他业绩')" min-width="120" align="center" />
            <el-table-column v-if="isCheckedOther" prop="otherTotalWinLoseCoin" :label="$t('其他输赢')" min-width="120" align="center" />
            <el-table-column v-if="isCheckedOther" prop="otherDiscountAmount" :label="$t('其他优惠')" min-width="120" align="center" />

            <el-table-column v-if="isCheckedPerson" prop="rechargeAmount" :label="$t('个人充值')" min-width="120" align="center" />
            <el-table-column v-if="isCheckedPerson" prop="cashAmount" :label="$t('个人提现')" min-width="120" align="center" />
            <el-table-column v-if="isCheckedPerson" prop="validCoin" :label="$t('个人有效投注')" min-width="120" align="center" />
            <el-table-column v-if="isCheckedPerson" prop="winLoseCoin" :label="$t('个人输赢')" min-width="120" align="center" />
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>
    </div>
</template>

<script setup name="agentDataQuery">
import { reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getAagentDataList } from '@/api/agent'
import { getCommonMeta } from '@/api/common'
import { getShortcuts, dateFormat, getTimezone, disabledCurrentDateAfter, getTimeRange } from '@/common/util'

const optionData = [
    { title: $t('上级代理'), id: 0, placeholder: $t('输入上级代理账号'), key: 'inviteUsername' },
    { title: $t('代理账号'), id: 1, placeholder: $t('输入代理账号'), key: 'username' },
    { title: $t('代理ID'), id: 2, placeholder: $t('输入代理ID'), key: 'userId' },
]
const shortcuts = getShortcuts()
const state = reactive({
    formData: {},
    tableData: [],
    dataTypeList: [1, 2, 3],
    selectType: 0,
    inputValue: '',
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
})
const route = useRoute()
let metaData = reactive({
    userSource: []
})

const isCheckedDirectly = computed(() => {
    return state.dataTypeList.some(item => item === 1)
})
const isCheckedOther = computed(() => {
    return state.dataTypeList.some(item => item === 2)
})
const isCheckedPerson = computed(() => {
    return state.dataTypeList.some(item => item === 3)
})

getCommonMeta({ types: 'userSource' }).then(res => {
    metaData = Object.assign(metaData, res.data || {})
})

onMounted(() => {
    state.formData.receiveTime = getTimeRange()
    fetchData()
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val && val !== 'export') {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.inputValue = ''
            state.formData = {}
        }
    }
    let params = { ...state.listQuery, ...state.formData }
    const { receiveTime } = state.formData
    if (receiveTime && receiveTime.length) {
        params["interval.begin"] = receiveTime[0]
        params["interval.end"] = receiveTime[1]
    }
    delete params.receiveTime
    state.inputValue && (params[optionData[state.selectType].key] = state.inputValue)
    if (val === 'export') params.export = getTimezone()
    globalVBus.$emit('globalLoading', true)
    getAagentDataList(params).then(res => {
        if (!params.export) {
            let { list, total } = res.data
            state.tableData = list
            state.total = total
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        if (!params.export) state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 查看会员详情
const showMemberDetail = (id) => {
    globalVBus.$emit('memberDetailDialog', id)
}
</script>

<style lang="scss">
.agent-data-query {
}
</style>
