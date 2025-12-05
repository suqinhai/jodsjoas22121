<template>
    <!-- 代理中心-定制版返佣记录-充值返佣记录 -->
    <div class="tabs-main">
        <el-form class="filter-form" :model="state.formData" inline>
            <el-form-item>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')"
                    :shortcuts="shortcuts" :disabled-date="disabledCurrentDateAfter" value-format="YYYY-MM-DD">
                </el-date-picker>
            </el-form-item>
            <el-form-item>
                <el-select style="width: 130px" v-model="state.selectType" @change="state.inputValue = ''">
                    <el-option v-for="item in Object.keys(optionData)" :key="item" :label="optionData[item].title" :value="item" />
                </el-select>
                <div>
                    <el-input v-if="['userId'].includes(state.selectType)" @input="(val) => state.inputValue= val.replace(/\D/g,'')"
                        v-model="state.inputValue" :placeholder="optionData[state.selectType].placeholder" />
                    <el-input v-else v-model="state.inputValue" :placeholder="optionData[state.selectType].placeholder" />
                </div>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('export')">{{$t('导 出')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table :data="state.tableData" class="table-box" border :row-class-name="({row}) => (row.isTotal ? 'total-row': '')">
            <el-table-column :label="$t('代理账号')" min-width="120" align="center">
                <template #default="{ row }">
                    <span v-if="row.isTotal">{{$t('总计')}}</span>
                    <span v-else class="special pointer" @click="showMemberDetail(row.user.id)">
                        {{ row.user?.name || ''  }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('代理ID')" min-width="100" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.user.id)">
                        {{ row.user?.id || ''  }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="bizVal" :label="$t('直属充值总金额')" min-width="130" align="center" />
            <el-table-column prop="bizRate" :label="$t('充值返佣比例%')" min-width="130" align="center" />
            <el-table-column prop="commission" :label="$t('充值返佣金额')" min-width="120" align="center" />
            <el-table-column prop="addTime" :label="$t('发放时间')" min-width="160" align="center" />
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>
    </div>
</template>

<script setup>
import { reactive, onMounted } from "vue"
import { getAgentRechargeRebateLog } from '@/api/agent'
import { getShortcuts, dateFormat, disabledCurrentDateAfter } from '@/common/util'

const optionData = {
    'username': { title: $t('代理账号'), placeholder: $t('请输入代理账号') },
    'userId': { title: $t('代理ID'), placeholder: $t('请输入代理ID') },
    // 'inviteUsername': { title: $t('上级代理账号'), placeholder: $t('请输入上级代理账号') },
}
const shortcuts = getShortcuts()
const state = reactive({
    selectType: 'username',
    inputValue: '',
    formData: {},
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
})

onMounted(() => {
    fetchData()
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val && val !== 'export') {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {}
            state.selectType = 'username'
            state.inputValue = ''
        }
    }
    let params = { ...state.listQuery, ...state.formData }
    let { receiveTime } = state.formData
    if (receiveTime && receiveTime.length) {
        params['interval.begin'] = receiveTime[0]
        params['interval.end'] = receiveTime[1]
    }
    params[state.selectType] = state.inputValue
    delete params.receiveTime
    if (val === 'export') params.isExport = true
    globalVBus.$emit('globalLoading', true)
    getAgentRechargeRebateLog(params).then(({ data = {}, ext = {} }) => {
        if (!params.isExport) {
            let { total, list } = data
            state.tableData = list || []
            state.tableData = list.map(item => {
                item.addTime && (item.addTime = dateFormat(item.addTime))
                return item
            })
            if (state.tableData.length && ext.total) {
                state.tableData.unshift({
                    ...ext.total,
                    isTotal: true,
                })
            }
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
</style>
