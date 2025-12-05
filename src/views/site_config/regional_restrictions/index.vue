<template>
    <!-- 非经营地访问限制 -->
    <div class="container regional-restrictions-page">
        <div class="head" v-permiss="'merchant.region-limit.addOrEdit'">
            <el-button v-throttle type="primary" @click="handleAdd">{{$t('新 增')}}</el-button>
        </div>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column prop="name" :label="$t('国家/地区')" min-width="140" align="center" />
            <el-table-column prop="clients" :label="$t('限制访问的终端类型')" min-width="280" align="center">
                <template #default="{ row }">
                    <span v-if="row.clients">{{ getClientName(row.clients) }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="remark" :label="$t('备注')" min-width="160" align="center" />
            <el-table-column prop="emp.name" :label="$t('操作人')" min-width="100" align="center" />
            <el-table-column prop="updateTime" :label="$t('操作时间')" min-width="160" align="center">
                <template #default="{ row }">
                    {{ dateFormat(row.updateTime) }}
                </template>
            </el-table-column>
            <el-table-column fixed="right" :label="$t('操作')" width="140" align="center">
                <template #default="{ row }">
                    <div class="table_operateBtn">
                        <el-button v-permiss="'merchant.region-limit.addOrEdit'" v-throttle type="primary" text @click="handleConfig(row)">
                            {{$t('修改')}}</el-button>
                        <el-button v-permiss="'merchant.region-limit.delete'" v-throttle type="danger" text @click="handleDel(row.id)">{{$t('删除')}}
                        </el-button>
                    </div>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="getList"></Pagination>
        <AddDialog v-if="showAddDialog" :item="currentItem" :metaData="metaData" @close="showAddDialog = false" @refresh="getList"></AddDialog>
    </div>
</template>

<script setup name='regionalRestrictions'>
import { ref, reactive, onMounted, defineAsyncComponent } from 'vue'
import { getRegionalRestrictions, deleteRegionalRestrictions } from '@/api/merchant_center'
import { getCommonMeta, getCountryAreaList } from '@/api/common'
import { dateFormat } from '@/common/util'
import { ElMessageBox } from 'element-plus'
const AddDialog = defineAsyncComponent(() => import('./components/AddDialog.vue'))

const showAddDialog = ref(false)
const state = reactive({
    tableData: [],
    total: 0,
    listQuery: {
        _size: 10,
        _page: 1
    },
})
const currentItem = ref()
let metaData = reactive({
    client: [],
    areaCountryList: [],
})

getCommonMeta({ types: 'client' }).then(res => {
    const { data, code } = res
    if (code === 0) {
        metaData.client = data.client.filter(item => item.value !== 'System' && item.value !== '?')
    }
})

getCountryAreaList().then(res => {
    metaData.areaCountryList = res.data || []
})

onMounted(() => {
    getList()
})

const getList = () => {
    globalVBus.$emit('globalLoading', true)
    const params = {
        ...state.listQuery
    }
    getRegionalRestrictions(params).then(res => {
        const { code, data } = res
        if (code === 0) {
            state.tableData = data.list
            state.total = data.total
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        globalVBus.$emit('globalLoading', false)
    })
}

const getClientName = (ids) => {
    if (!ids) return
    let idArr = ids.toString().split(',')
    let filterList = []
    metaData.client.forEach((item, index) => {
        idArr.forEach(v => {
            if (v == index) filterList.push(item.label)
        })
    })
    return filterList.join('，')
}

const handleAdd = () => {
    currentItem.value = ''
    showAddDialog.value = true
}

const handleConfig = (row) => {
    showAddDialog.value = true
    currentItem.value = row
}

const handleDel = (id) => {
    ElMessageBox.confirm($t('确认要删除此配置吗？'), $t('提示')).then(() => {
        globalVBus.$emit('globalLoading', true)
        deleteRegionalRestrictions({ id }).then(res => {
            getList()
        }).catch(() => {
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(() => { })

}
</script>

<style lang="scss">
.regional-restrictions-page {
    .head {
        width: 100%;
        display: flex;
        justify-content: flex-end;
        margin-bottom: 10px;
        padding-right: 20px;
    }
}
</style>