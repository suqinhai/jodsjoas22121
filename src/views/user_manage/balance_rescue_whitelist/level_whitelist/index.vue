<template>
    <!-- 余额救援金白名单-层级白名单 -->
    <el-table :data="state.tableData" border style="width: 600px">
        <el-table-column prop="name" :label="$t('层级名称')" min-width="120" align="center" />
        <el-table-column prop="type_" :label="$t('层级类型')" min-width="120" align="center" />
        <el-table-column :label="$t('是否开启')" min-width="120" align="center">
            <template #default="{ row }">
                <el-switch :disabled="!userData.isHasPermiss('merchant.promotion-whitelist.editReliefBalanceLayer')" v-model="row.whitelist"
                    @change="switchChange(row)" />
            </template>
        </el-table-column>
    </el-table>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import userStore from '@/store/user'
import { ElMessageBox } from "element-plus"
import { getLayerWhitelist, postLayerWhitelistData } from '@/api/member'

const state = reactive({
    formData: {},
})
const userData = userStore()

onMounted(() => {
    fetchData()
})

// 表格过滤数据处理
const fetchData = () => {
    globalVBus.$emit('globalLoading', true)
    getLayerWhitelist().then(({ data = [] }) => {
        state.tableData = data
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 移除
const switchChange = (row) => {
    // ElMessageBox.confirm($t('确定将此账号移出推广账号吗？'), $t('提示'), {
    //     type: 'warning'
    // }).then(() => {
    globalVBus.$emit('globalLoading', true)
    postLayerWhitelistData({ layerId: row.id, status: row.whitelist }).then(res => {
        fetchData()
    }).catch(err => {
        row.whitelist = row.whitelist ? false : true
        globalVBus.$emit('globalLoading', false)
    })
    // }).catch(err => { })
}
</script>

<style lang="scss">
</style>
