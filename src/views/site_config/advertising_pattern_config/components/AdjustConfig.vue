<template>
    <!-- 站点配置-广告埋点配置-Adjust配置 -->
    <div class="tabs-main Adjust-config">
        <div class="tips-w">
            <p>{{$t('1.应用标识在Adjust后台AppView-->创建应用')}}</p>
            <p>{{$t('2.事件标识在创建的应用内，配置事件')}}</p>
        </div>
        <el-form class="filter-form" :model="state.formData" inline>
            <el-form-item :label="$t('应用标识:')">
                <el-input v-model="state.formData.name" :placeholder="$t('输入应用标识')" />
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item v-permiss="'merchant.channel.apiEdit'" class="item-box">
                <el-button  v-throttle type="primary" @click="handleConfig({})">{{$t('新 增')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table :data="state.tableData" class="table-box" style="width: 1240px" border>
            <el-table-column prop="name" :label="$t('应用标识')" min-width="90" align="center" />
            <el-table-column prop="type_" :label="$t('应用类型')" min-width="50" align="center" />
            <el-table-column prop="remark" :label="$t('应用备注')" min-width="180" align="center" />
            <el-table-column fixed="right" :label="$t('操作')" width="140" align="center">
                <template #default="{ row }">
                   
                    <el-button v-permiss="'merchant.channel.apiEdit'" v-throttle type="primary" text @click="handleConfig(row)">{{$t('修改')}}</el-button>
                     <el-button v-throttle type="primary" text v-if="row.status !== -1 && userData.isHasPermiss('merchant.channel.apiDelete')"
                        @click="handleDelete(row)">{{$t('删除')}}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>

        <AdjustDialog v-if="state.showAdjustDialog" :itemData="state.itemData" :channelPattern="channelPattern" @fetchData="fetchData"
            @close="state.showAdjustDialog = false"></AdjustDialog>
    </div>
</template>

<script setup>
import { reactive, onMounted, defineAsyncComponent } from "vue"
import { ElMessageBox } from 'element-plus'
import userStore from '@/store/user'
import commonStore from '@/store/common'
import { getAdjustList, deleteAdjustConfig } from '@/api/data_center'
import { getShortcuts, dateFormat, copyText, disabledCurrentDateAfter } from '@/common/util'
const AdjustDialog = defineAsyncComponent(() => import('./AdjustDialog.vue'))

let shortcuts = getShortcuts()
const props = defineProps({
    channelPattern: {
        type: Array,
        default: () => []
    },
    currentItem: {
        type: Object,
        default: () => {
            return {}
        }
    },
})
const state = reactive({
    tableData: [],
    formData: {},
    timeType: 0,
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    itemData: {},
    showAdjustDialog: false
})
const userData = userStore()
const commonData = commonStore()


onMounted(() => {
    let { merchantId, pattern } = props.currentItem
    if (merchantId) {
        state.formData.pattern = pattern
        state.formData.merchantId = merchantId
    }
    fetchData()
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val) {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {
                merchantId: commonData.merchantSiteList.length > 1 ? 0 : ''
            }
        }
    }
    let params = { ...state.listQuery, ...state.formData }
    globalVBus.$emit('globalLoading', true)
    getAdjustList(params).then(res => {
        let { total, list } = res.data
        state.tableData = list
        state.total = total || 0
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

const handleDelete = (row) => {
    ElMessageBox.confirm($t('删除后将不会上报事件到Adjust,确认删除吗？'), $t('提示'), {
        confirmButtonText: $t('确 定'),
        cancelButtonText: $t('取消'),
        type: 'warning',
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        deleteAdjustConfig({ id: row.id }).then(res => {
            if(res.status === 'OK'){
                fetchData()
            }
        }).catch(err => {
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(() => { })
}

const handleConfig = (row) => {
    state.itemData = { ...row }
    state.showAdjustDialog = true
} 
</script>

<style lang="scss">
.Adjust-config{
    .tips-w{
        p{
            font-size: 14px;
            color: var(--el-text-color-regular);
            line-height: 24px;
           
        }
         margin-bottom: 20px;
    }

}


</style>
