<template>
    <!-- 操作日志 -->
    <div class="container operate-log">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" :shortcuts="shortcuts" value-format="YYYY-MM-DD"
                    :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter" />
            </el-form-item>
            <el-form-item :label="$t('操作人:')">
                <el-input v-model="state.formData.operatorName" :placeholder="$t('请输入操作人')" />
            </el-form-item>
            <el-form-item :label="$t('操作模块:')">
                <el-input v-model="state.formData.moduleName" :placeholder="$t('请输入操作模块')" />
            </el-form-item>
            <el-form-item :label="$t('操作内容:')">
                <el-input v-model="state.formData.func" :placeholder="$t('请输入操作内容')" />
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column prop="moduleName" :label="$t('操作模块')" min-width="140" align="center" />
            <el-table-column prop="func" :label="$t('操作内容')" min-width="150" align="center" />
            <el-table-column prop="action" :label="$t('操作行为')" min-width="150" align="center" />
            <el-table-column prop="currents" :label="$t('操作记录')" min-width="400" align="center">
                <template #default="{ row }">
                    <div v-for="(item,index) in row.contentText" :key="index">
                        <div v-if="!!item.label">
                            <div>{{$t('操作对象：')}}{{ item.label }}</div>
                            <span>{{$t('操作前：')}}{{ item.old }}</span>
                            <span>{{$t('；操作后：')}}{{ item.now }}</span>
                        </div>
                        <div v-else>{{item || ''}}</div>
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="operatorName" :label="$t('操作人')" min-width="100" align="center" />
            <el-table-column label="IP" min-width="140" align="center">
                <template #default="{ row }">
                    {{row.ip || ''}}
                    <!-- {{row.ip || ''}}{{row.region ? row.region+'/' : ''}} -->
                </template>
            </el-table-column>
            <el-table-column prop="operatorTime" :label="$t('操作时间')" min-width="160" align="center" />
            <el-table-column fixed="right" :label="$t('操作')" min-width="120" align="center">
                <template #default="{ row }">
                    <el-button v-if="row.currents && row.olds" v-throttle type="primary" text @click="handleDetail(row)">{{$t('详情')}}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:page="state.listQuery._page" v-model:limit="state.listQuery._size"
            @pagination="fetchData">
        </Pagination>

        <DetailDialog @close="state.detailDialogShow = false" v-if="state.detailDialogShow" :itemData="state.itemData"></DetailDialog>
    </div>
</template>

<script setup name="operateLog">
import { reactive, onMounted, defineAsyncComponent } from 'vue'
import { getOperationLogList } from '@/api/manage_config'
import { dateFormat, getShortcuts, disabledCurrentDateAfter } from '@/common/util'
const DetailDialog = defineAsyncComponent(() => import("./components/DetailDialog.vue"))

const shortcuts = getShortcuts()
const state = reactive({
    tableData: [],
    formData: {},
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    detailDialogShow: false,
    itemData: {}
})

onMounted(() => {
    fetchData()
})

const fetchData = (val = '') => {
    if (val) {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {}
        }
    }
    let params = { ...state.formData, ...state.listQuery }
    let { receiveTime } = state.formData
    if (receiveTime && receiveTime.length) {
        params['interval.begin'] = receiveTime[0]
        params['interval.end'] = receiveTime[1]
    }
    delete params.receiveTime
    globalVBus.$emit('globalLoading', true)
    getOperationLogList(params).then(res => {
        let { total, list } = res.data
        state.total = total || 0
        state.tableData = list.map(item => {
            item.operatorTime && (item.operatorTime = dateFormat(item.operatorTime))
            if (item.content) {
                try {
                    let content = JSON.parse(item.content)
                    item.contentText = Array.isArray(content) ? content.filter(item => !!item && !!item.label) : [content]
                } catch (error) {
                    item.contentText = [item.content]
                }
            } else {
                item.contentText = []
            }
            return item
        })
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

const handleDetail = ({ currents, olds }) => {
    state.itemData.currentData = currents.split("\\r\\n").filter(item => !!item)
    state.itemData.oldData = olds.split("\\r\\n").filter(item => !!item)
    state.detailDialogShow = true

}
</script>

<style lang="scss">
.operate-log {
}
</style>
