<template>
    <!-- 导出下载 -->
    <div class="container export-download">
        <el-form class="filter-form" :model="state.formData" inline>
            <el-form-item>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')"
                    :shortcuts="shortcuts" :disabled-date="disabledCurrentDateAfter" value-format="YYYY-MM-DD">
                </el-date-picker>
            </el-form-item>
            <el-form-item :label="$t('导出进度:')">
                <el-select class="select-box" v-model="state.formData.status" :placeholder="$t('请选择导出进度')" clearable>
                    <el-option v-for="(item,index) in statusList" :key="index" :label="item" :value="index" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
        </el-form>

        <el-table :data="state.tableData" class="table-box" border>
            <el-table-column prop="addTime" :label="$t('导出时间')" min-width="160" align="center" />
            <el-table-column prop="menuName" :label="$t('导出来源')" min-width="120" align="center" />
            <el-table-column prop="fileName" :label="$t('文件名')" min-width="200" align="center" />
            <el-table-column prop="size" :label="$t('文件大小')" min-width="100" align="center" />
            <el-table-column prop="expireTime" :label="$t('文件自动删除时间')" min-width="160" align="center" />
            <el-table-column :label="$t('导出进度')" min-width="120" align="center">
                <template #default="{ row }">
                    {{statusList[row.status] || ''}}
                </template>
            </el-table-column>
            <el-table-column :label="$t('操作')" width="120" align="center">
                <template #default="{ row }">
                    <el-button v-throttle type="primary" v-if="[2,3].includes(row.status)" text @click="clickDownload(row)">{{$t('下载')}}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>

    </div>
</template>

<script setup name="exportDownload">
import { reactive, onMounted, onActivated } from "vue"
import commonStore from '@/store/common'
import { getExportList, getDownload } from '@/api/statistics'
import { getShortcuts, dateFormat, downloadFile, disabledCurrentDateAfter } from '@/common/util'

const statusList = [$t('等待中'), $t('导出中'), $t('已完成'), $t('导出失败'), $t('已过期')]
const shortcuts = getShortcuts()
const state = reactive({
    tableData: [],
    formData: {},
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    isInit: true
})
const commonData = commonStore()

onMounted(() => {
    if (commonData.isManual) state.isInit = false
    fetchData()
})

onActivated(() => {
    if (state.isInit) return state.isInit = false
    fetchData()
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val) {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {
                receiveTime: []
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
    globalVBus.$emit('globalLoading', true)
    getExportList(params).then(res => {
        let { total, list = [] } = res.data
        state.tableData = list.map(item => {
            item.addTime && (item.addTime = dateFormat(item.addTime, 'yyyy-MM-DD hh:ii:ss', '', true))
            item.expireTime && (item.expireTime = dateFormat(item.expireTime, 'yyyy-MM-DD hh:ii:ss', '', true))
            return item
        })
        state.total = total || 0
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 下载文件
const clickDownload = ({ id, fileName }) => {
    globalVBus.$emit('globalLoading', true)
    getDownload({ id }).then(res => {
        downloadFile(res.data, fileName)
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        globalVBus.$emit('globalLoading', false)
    })
}

</script>

<style lang="scss">
.export-download {
}
</style>
