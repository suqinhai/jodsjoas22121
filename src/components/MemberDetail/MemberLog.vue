<template>
    <!-- 会员详情弹窗-会员日志 -->
    <div class="container-main">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" value-format="YYYY-MM-DD" :start-placeholder="$t('开始时间')"
                    :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" />
            </el-form-item>
            <!-- <el-form-item>
                <el-input v-model="state.formData.ip" :placeholder="$t('请输入IP')" />
            </el-form-item>
            <el-form-item>
                <el-input v-model="state.formData.code" :placeholder="$t('请输入会员账号')" />
            </el-form-item> -->
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table class="table-box" :data="state.tableData" border>
            <!-- <el-table-column prop="userId" :label="$t('会员ID')" min-width="100" align="center" /> -->
            <!-- <el-table-column prop="userId" :label="$t('会员账号')" min-width="100" align="center" /> -->
            <el-table-column prop="operationDate" :label="$t('操作时间')" min-width="160" align="center" />
            <el-table-column prop="operationType" :label="$t('操作项目')" min-width="100" align="center" />
            <el-table-column prop="operation" :label="$t('操作')" min-width="100" align="center" />
            <el-table-column prop="superiorAgency" :label="$t('变更前')" min-width="100" align="center" />
            <el-table-column prop="superiorAgency" :label="$t('变更后')" min-width="100" align="center" />
            <el-table-column prop="loginDevice" :label="$t('登录设备')" min-width="100" align="center" />
            <el-table-column prop="ipOrDeviceNo" :label="$t('IP/设备号')" min-width="100" align="center" />
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>

        <!-- <OperateMember v-if="state.operateMemberShow" :itemData="state.itemData" @fetchData="fetchData('')"
            @close="state.operateMemberShow = false"></OperateMember> -->
    </div>
</template>

<script setup>
import { reactive, onMounted, inject } from 'vue'
import { getMemberOperationLog } from '@/api/member'
import { dateFormat, getShortcuts, disabledCurrentDateAfter } from '@/common/util'

const shortcuts = getShortcuts()
const provideData = inject('provideData')
const state = reactive({
    formData: {
        receiveTime: []
    },
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
const fetchData = (type = '') => {
    if (type) {
        state.listQuery._page = 1
        if (type === 'reset') {
            state.formData = {}
        }
    }
    let params = { ...state.listQuery }
    let { receiveTime } = state.formData
    if (receiveTime && receiveTime.length) {
        params['interval.begin'] = receiveTime[0]
        params['interval.end'] = receiveTime[1]
    }
    params.userId = provideData.memberId
    params.merchantId = provideData.merchantId
    provideData.showLoading()
    getMemberOperationLog(params).then(res => {
        let { total, list } = res.data
        state.tableData = list.map(item => {
            item.operationDate && (item.operationDate = dateFormat(item.operationDate))
            return item
        })
        state.total = total || 0
        provideData.hideLoading()
    }).catch(err => {
        state.tableData = []
        provideData.hideLoading()
    })
}
</script>

<style lang="scss">
</style>
