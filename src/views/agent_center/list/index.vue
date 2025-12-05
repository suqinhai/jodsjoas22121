<template>
    <!-- 代理列表 -->
    <div class="container agent-list">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item>
                <el-select style="width: 100px" v-model="state.selectType" @change="state.inputValue = ''">
                    <el-option v-for="item in optionData" :key="item.id" :label="item.title" :value="item.id" />
                </el-select>
                <div>
                    <el-input v-model="state.inputValue" :placeholder="optionData[state.selectType].placeholder" />
                </div>
            </el-form-item>
            <el-form-item :label="$t('注册来源:')">
                <el-select class="select-box" v-model="state.formData.userSource" clearable :placeholder="$t('请选择注册来源')">
                    <el-option v-for="item in metaData.userSource" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('提佣状态:')">
                <el-select class="select-box" v-model="state.formData.cashOpen" clearable :placeholder="$t('请选择提佣状态')">
                    <el-option :label="$t('关闭')" :value="0" />
                    <el-option :label="$t('开启')" :value="1" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('export',false)">{{$t('导出报表')}}</el-button>
            </el-form-item>
        </el-form>
        <div class="agent-level">{{$t('会员代理层级：')}}<span class="agent-level-main">{{state.agentLevel.join(' \\ ')}}</span>
            <el-button v-throttle v-if="state.agentLevel.length" type="primary" text @click="handleBack">{{$t('返回上级')}}</el-button>
        </div>
        <div class="tips-box">{{$t('数据更新时间：隔天')}}</div>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column prop="userId" :label="$t('会员ID(代理)')" min-width="120" align="center" />
            <el-table-column :label="$t('代理账号')" min-width="120" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="handleConfig(row.username)">
                        {{ row.username }}
                    </span>
                </template>
            </el-table-column>
            <!-- <el-table-column :label="$t('代理层级')" min-width="100" align="center">
                <template #default="{ row }">
                    {{ row.level }}{{$t('级')}}
                </template>
            </el-table-column> -->
            <el-table-column prop="inviteUsername" :label="$t('上级代理账号')" min-width="120" align="center" />
            <el-table-column prop="rechargeTag" :label="$t('标签')" min-width="100" align="center" />
            <el-table-column prop="userSource" :label="$t('注册来源')" min-width="100" align="center" />
            <el-table-column prop="nextUserCount" :label="$t('直属成员')" min-width="100" align="center" />
            <el-table-column prop="nextRechargeAmount" :label="$t('直属成员充值总额')" min-width="140" align="center" />
            <el-table-column prop="nextCashAmount" :label="$t('直属成员提现总额')" min-width="140" align="center" />
            <el-table-column prop="otherUserCount" :label="$t('其他成员')" min-width="100" align="center" />
            <!-- <el-table-column prop="agentUrl" :label="$t('推广链接')" min-width="100" align="center" /> -->
            <el-table-column prop="agentHit" :label="$t('链接访问量')" min-width="100" align="center" />
            <el-table-column prop="totalCommission" :label="$t('累计佣金')" min-width="100" align="center" />
            <el-table-column prop="receivedCommission" :label="$t('累计领取')" min-width="100" align="center" />
            <el-table-column prop="activeCommission" :label="$t('未领取')" min-width="100" align="center" />
            <el-table-column prop="activeAmount" :label="$t('账户余额')" min-width="100" align="center" />
            <!-- <el-table-column prop="agentTime" :label="$t('成为代理时间')" min-width="160" align="center" /> -->
            <el-table-column :label="$t('推广状态')" min-width="100" align="center">
                <template #default="{ row }">
                    <el-switch :disabled="!userData.isHasPermiss('merchant.agent.editInfo')" v-model="row.agentOpen" :active-value="1"
                        :inactive-value="0" @change="switchChange('agentOpen',row)" />
                </template>
            </el-table-column>
            <el-table-column :label="$t('提佣状态')" min-width="100" align="center">
                <template #default="{ row }">
                    <el-switch :disabled="!userData.isHasPermiss('merchant.agent.editInfo')" v-model="row.cashOpen" :active-value="1"
                        :inactive-value="0" @change="switchChange('cashOpen',row)" />
                </template>
            </el-table-column>
            <el-table-column fixed="right" align="center" :label="$t('操作')" width="160">
                <template #default="{ row }">
                    <el-button v-throttle type="primary" text @click="handleGo(row.username,'/agent/receive-record')">{{$t('领取记录')}}</el-button>
                    <!-- <el-button v-throttle type="primary" text
                        @click="handleGo(row.username,'/statistics-report/operation-statistics/agent-report')">{{$t('操作明细')}}</el-button> -->
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>
    </div>
</template>

<script setup name="agentList">
import { reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import userStore from '@/store/user'
import { ElMessage } from "element-plus"
import { getAagentList, postAagentData, getAagentLevelList } from '@/api/agent'
import { getCommonMeta } from '@/api/common'

const optionData = [
    { title: $t('上级代理'), id: 0, placeholder: $t('输入上级代理账号'), key: 'inviteUsername' },
    { title: $t('代理账号'), id: 1, placeholder: $t('输入代理账号'), key: 'username' },
    { title: $t('代理ID'), id: 2, placeholder: $t('输入代理ID'), key: 'userId' },
]
const state = reactive({
    formData: {},
    tableData: [],
    agentLevel: [],
    selectType: 0,
    inputValue: '',
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    itemData: {},
    agentLevelNum: 10
})
const userData = userStore()
const router = useRouter()
let metaData = reactive({
    userSource: []
})

getCommonMeta({ types: 'userSource' }).then(res => {
    metaData = Object.assign(metaData, res.data || {})
})

onMounted(() => {
    fetchData()
})

// 表格过滤数据处理
const fetchData = (val = '', isClickName = false) => {
    if (val && val !== 'export') {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.selectType = 0
            state.inputValue = ''
            state.formData = {}
            state.agentLevel = []
        }
    }
    let params = { ...state.listQuery, ...state.formData }
    if (state.agentLevel.length) {
        if (!state.selectType) {
            if (isClickName || (!isClickName && !state.inputValue)) {
                state.inputValue = state.agentLevel[state.agentLevel.length - 1]
            } else {
                state.agentLevel[state.agentLevel.length - 1] = state.inputValue
            }
        } else {
            state.inputValue && (params[optionData[state.selectType].key] = state.inputValue)
        }
        params.inviteUsername = state.agentLevel[state.agentLevel.length - 1]
    } else {
        if (isClickName && !state.selectType) {
            state.inputValue = ''
        }
        state.inputValue && (params[optionData[state.selectType].key] = state.inputValue)
    }
    if (val === 'export') params.isExport = true
    globalVBus.$emit('globalLoading', true)
    getAagentList(params).then(res => {
        if (!params.isExport) {
            let { list, total } = res.data
            state.tableData = list
            // state.tableData = list.map(item => {
            //     // item.agentTime && (item.agentTime = dateFormat(item.agentTime))
            //     return item
            // })
            state.total = total
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        if (!params.isExport) state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 返回上一级
const handleBack = () => {
    state.agentLevel.pop()
    fetchData('', true)
}

// 获取代理等级数据
const getAagentLevel = () => {
    getAagentLevelList({ _size: 999 }).then(res => {
        state.agentLevelNum = res.data.list.length
    }).catch(err => { })
}

// 按钮操作
const handleConfig = (name) => {
    if (state.agentLevel.length >= state.agentLevelNum) return ElMessage.warning($t('已达代理层级上限！'))
    state.agentLevel.push(name)
    fetchData('', true)
}

// 状态切换
const switchChange = (key, row) => {
    globalVBus.$emit('globalLoading', true)
    postAagentData({ [key]: row[key], id: row.id }).then(res => {
        // ElMessage.success($t('操作成功！'))
        fetchData()
    }).catch(err => {
        globalVBus.$emit('globalLoading', false)
    })
}

// 跳转
const handleGo = (username, url) => {
    router.push(url + `?username=${username}`)
}
</script>

<style lang="scss">
.agent-list {
    .agent-level {
        line-height: 20px;
        font-size: 16px;
        color: #000;
        font-weight: 700;
        margin-bottom: 10px;
        &-main {
            font-size: 14px;
            font-weight: 400;
        }
    }
}
</style>
