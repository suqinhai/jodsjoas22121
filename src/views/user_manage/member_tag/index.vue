<template>
    <!-- 用户管理-会员标签 -->
    <div class="container member-tag">
        <div class="head" v-permiss="'merchant.user-tag.edit'">
            <el-button v-throttle type="primary" @click="handleConfig({})">{{$t('新 增')}}</el-button>
        </div>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column prop="id" label="ID" min-width="120" align="center" />
            <el-table-column prop="name" :label="$t('标签名称')" min-width="120" align="center" />
            <el-table-column :label="$t('颜色')" width="140" align="center">
                <template #default="{ row }">
                    <div class="tag-color" :style="{background: row.color ? row.color : ''}">{{row.color}}</div>
                </template>
            </el-table-column>
            <el-table-column prop="summary" :label="$t('描述')" min-width="140" align="center" />
            <el-table-column prop="empUsername" :label="$t('操作人')" min-width="140" align="center" />
            <el-table-column prop="updateTime" :label="$t('操作时间')" min-width="160" align="center" />
            <el-table-column fixed="right" align="center" :label="$t('操作')" width="140">
                <template #default="{ row }">
                    <el-button v-throttle type="primary" v-permiss="'merchant.user-tag.edit'" text @click="handleConfig(row)">{{$t('修改')}}</el-button>
                    <el-button v-throttle type="primary" v-permiss="'merchant.user-tag.edit'" text @click="handleDelete(row.id)">{{$t('删除')}}
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <Pagination v-show="state.total > 0" :total="state.total" v-model:page="state.pageConfig._page" v-model:limit="state.pageConfig._size"
            @pagination="fetchData">
        </Pagination>

        <DeployDialog v-if="state.showDeployDialog" :itemData="state.itemData" @close="state.showDeployDialog = false" @fetchData="fetchData">
        </DeployDialog>
    </div>
</template>

<script setup name='memberTag'>
import { reactive, onMounted, defineAsyncComponent, onActivated } from 'vue'
import { useRoute } from 'vue-router'
import commonStore from '@/store/common'
import { ElMessageBox } from "element-plus"
import { getMemberTagList, deleteMemberTagData } from '@/api/member'
import { dateFormat } from '@/common/util'
const DeployDialog = defineAsyncComponent(() => import('./components/DeployDialog.vue'))

const state = reactive({
    formData: {},
    tableData: [],
    total: 0,
    pageConfig: {
        _page: 1,
        _size: 10,
    },
    showDeployDialog: false,
    itemData: {},
    isInit: true
})
const route = useRoute()
const commonData = commonStore()

onMounted(() => {
    if (commonData.isManual) state.isInit = false
    if (route.query.merchantId && +route.query.merchantId !== commonData.currentMerchantSite.id && !commonData.isManual) {
        commonData.setCurrentMerchantSite(+route.query.merchantId)
        return
    }
    fetchData()
})

onActivated(() => {
    if (state.isInit) return state.isInit = false
    if (route.query.merchantId && +route.query.merchantId !== commonData.currentMerchantSite.id && !commonData.isManual) {
        commonData.setCurrentMerchantSite(+route.query.merchantId)
    }
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val === 'reset') {
        state.formData = {}
        state.pageConfig._page = 1
    }
    globalVBus.$emit('globalLoading', true)
    getMemberTagList({ ...state.formData, ...state.pageConfig }).then(({ data }) => {
        if (data && data.list) {
            state.tableData = data.list.map(item => {
                item.updateTime && (item.updateTime = dateFormat(item.updateTime))
                return item
            })
            state.total = data.total || 0
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

const handleConfig = (val) => {
    state.itemData = { ...val }
    state.showDeployDialog = true
}

// 删除
const handleDelete = (id) => {
    ElMessageBox.confirm($t('确定将此标签配置删除吗？'), $t('提示'), {
        type: 'warning'
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        deleteMemberTagData({ id, status: 1 }).then(res => {
            fetchData()
        }).catch(err => {
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(err => { })
}
</script>

<style lang="scss">
.member-tag {
    .head {
        padding-right: 20px;
        display: flex;
        justify-content: flex-end;
        margin-bottom: 10px;
    }
    .tag-color {
        width: 100%;
        height: 30px;
        text-align: center;
        line-height: 30px;
        color: #000;
    }
}
</style>
