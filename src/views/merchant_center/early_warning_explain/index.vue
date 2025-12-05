<template>
    <!-- 站点预警说明 -->
    <div class="container early-warning-explain">
        <div class="head">
            <span>{{$t('商户名称：')}}{{state.merchantInfo.name || ''}}</span>
            <span style="padding-left: 20px">{{$t('商户等级：')}}{{state.merchantInfo.level || ''}}</span>
        </div>
        <el-table :data="state.tableData" border>
            <el-table-column prop="id" label="ID" width="120" align="center" />
            <el-table-column prop="typeLabel" :label="$t('类型')" width="140" align="center" />
            <el-table-column prop="value" :label="$t('设定值')" width="140" align="center" />
            <el-table-column :label="$t('预警颜色')" width="140" align="center">
                <template #default="{ row }">
                    <div class="early-warning-color" :style="{background: row.color ? '#' + row.color : ''}">
                        {{row.color ? '#' + row.color : ''}}</div>
                </template>
            </el-table-column>
            <el-table-column prop="remark" :label="$t('说明')" min-width="300" align="center" />
        </el-table>
    </div>
</template>

<script setup name="earlyWarningExplain">
import { reactive, onMounted } from 'vue'
import userStore from '@/store/user'
import { getEarlyWarningExplain } from '@/api/merchant_center.js'

const state = reactive({
    tableData: [],
    merchantInfo: {}
})
const userData = userStore()

onMounted(() => {
    fetchData()
})

// 表格过滤数据处理
const fetchData = () => {
    globalVBus.$emit('globalLoading', true)
    getEarlyWarningExplain({ merchantId: userData.userInfo.merchantId }).then(({ data, code, ext }) => {
        if (code === 0) {
            state.tableData = data || []
            state.merchantInfo = { ...ext }
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss">
.early-warning-explain {
    .head {
        font-size: 16px;
        color: #666;
        line-height: 30px;
    }
    .early-warning-color {
        width: 100%;
        height: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}
</style>
