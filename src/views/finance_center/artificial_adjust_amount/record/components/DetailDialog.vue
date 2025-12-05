<template>
    <!-- 财务中心-人工加扣款-批量上传记录-导入记录查看 -->
    <Dialog ref="dialog" width="1000" :title="$t('导入记录查看')" top="5vh" :isShowSubmit="false" @cancel="cancel">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item :label="$t('状态:')">
                <el-select v-model="state.formData.status" clearable :placeholder="$t('请选择状态')">
                    <el-option :value="0" :label="$t('失败')" />
                    <el-option :value="1" :label="$t('成功')" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('export')">{{$t('导出表格')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column prop="userId" :label="$t('会员ID')" min-width="80" align="center" />
            <el-table-column prop="tradeAmount" :label="$t('交易金额')" min-width="80" align="center" />
            <el-table-column prop="auditFactor" :label="$t('稽核倍数')" min-width="80" align="center" />
            <el-table-column prop="ticketId" :label="$t('票券ID')" min-width="60" align="center" />
            <el-table-column prop="tradeType_" :label="$t('交易类型')" min-width="100" align="center" />
            <!-- <el-table-column prop="pcRemark" :label="$t('前端备注')" min-width="140" align="center" /> -->
            <el-table-column prop="remark" :label="$t('后端备注')" min-width="140" align="center" />
            <el-table-column prop="position_" :label="$t('状态')" min-width="60" align="center">
                <template #default="{ row }">
                    {{row.status ? $t('成功') : $t('失败')}}
                </template>
            </el-table-column>
            <el-table-column prop="reason" :label="$t('原因')" min-width="80" align="center" />
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus';
import { getBalanceRevisionInfo } from '@/api/finance'
import { getShortcuts, disabledCurrentDateAfter, deepClone } from '@/common/util'

const emits = defineEmits(['close'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    },
})
let shortcuts = getShortcuts()
const state = reactive({
    formData: {},
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
})
const dialog = ref(null)

onMounted(() => {
    fetchData('reset')
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val && val !== 'export') {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {
                merchantId: props.itemData.merchant.id,
                id: props.itemData.id
            }
        }
    }
    let params = { ...state.listQuery, ...state.formData }
    if (val === 'export') params.isExport = true
    dialog.value.showLoading()
    getBalanceRevisionInfo(params).then(res => {
        if (!params.isExport) {
            let { total, list = [] } = res.data
            state.tableData = list
            state.total = total
        }
        dialog.value.closeLoading()
    }).catch(err => {
        if (!params.isExport) state.tableData = []
        dialog.value.closeLoading()
    })
}

const cancel = () => {
    emits('close')
}
</script>

<style lang="scss">
.domain-deploy {
}
</style>
