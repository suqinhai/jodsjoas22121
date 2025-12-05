<template>
    <!-- 运营中心-优惠活动列表-活动列表/已关闭活动-新人彩金活动-兑换码管理 -->
    <Dialog ref="dialogRef" width="800" :title="title" top="5vh" :isShowSubmit="false" @cancel="emits('close')">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item :label="$t('兑换码:')">
                <el-input v-model="state.formData.code" :placeholder="$t('请输入兑换码')" />
            </el-form-item>
            <el-form-item :label="$t('兑换码状态:')">
                <el-select style="width: 180px" v-model="state.formData.status" :placeholder="$t('请选择兑换码状态')" clearable>
                    <el-option :label="$t('未使用')" :value="0" />
                    <el-option :label="$t('已使用')" :value="1" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('export')">{{$t('导出表格')}}</el-button>
            </el-form-item>
            <el-form-item v-if="[2, 3].includes(itemData.status) && !!(itemData.rules_.total - state.total)">
                <el-button v-throttle type="primary" @click="emits('showCreate')">{{$t('生成兑换码')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column prop="code" :label="$t('兑换码')" min-width="160" align="center" />
            <el-table-column prop="status" :label="$t('状态')" min-width="120" align="center" />
        </el-table>

        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted, computed, defineExpose } from "vue"
import { getRedeemCodeList } from "@/api/discounts_center.js"

const emits = defineEmits(['close', 'showCreate'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    }
})
const state = reactive({
    tableData: [],
    formData: {},
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
})
const dialogRef = ref(null)

const title = computed(() => {
    return $t('兑换码管理') + $t('（活动ID：') + props.itemData.id + $t('，最大生成数量：') + props.itemData.rules_.total + $t('，剩余可生成数量：') + (props.itemData.rules_.total - state.total) + '）'
})

onMounted(() => {
    fetchData()
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val && val !== 'export') {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {}
        }
    }
    let params = { ...state.listQuery, ...state.formData }
    params.id = props.itemData.id
    if (val === 'export') params.isExport = true
    dialogRef.value.showLoading()
    getRedeemCodeList(params).then(res => {
        if (!params.isExport) {
            let { total, list } = res.data
            state.tableData = list
            state.total = total
        }
        dialogRef.value.closeLoading()
    }).catch(err => {
        if (!params.isExport) state.tableData = []
        dialogRef.value.closeLoading()
    })
}

defineExpose({ refresh: fetchData })
</script>

<style lang="scss" scoped>
</style>
