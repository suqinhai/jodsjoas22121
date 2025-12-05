<template>
    <!-- 财务中心-会员充值配置-充值统计-首充数据/二充数据/三充数据 -->
    <Dialog ref="dialog" width="700" :title="type == 'first' ? $t('首充数据') : (props.type == 'two' ? $t('二充数据') : $t('三充数据')) " top="5vh"
        :isShowSubmit="false" @cancel="cancel">
        <el-table :data="state.tableData" border>
            <el-table-column prop="updateTime" :label="$t('日期')" min-width="100" align="center">
                <template #default="{ row }">
                    {{dateFormat(row.updateTime)}}
                </template>
            </el-table-column>
            <el-table-column prop="userId" :label="$t('会员ID')" min-width="100" align="center" />
            <el-table-column prop="localAmount" :label="$t('充值金额')" min-width="100" align="center" />
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="getList"></Pagination>
    </Dialog>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue';
import { getDailyStatDetail } from '@/api/finance'
import { dateFormat } from "@/common/util/index"

const emits = defineEmits(['close'])
const props = defineProps({
    type: {
        type: String,
        default: 'first'
    },
    interval: {
        type: Object,
        default: {}
    }
})
const state = reactive({
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
})
const dialog = ref(null)

onMounted(() => {
    getList()
})

const getList = () => {
    let data = {
        'type': props.type,
        'interval.begin': props.interval.begin,
        'interval.end': props.interval.end,
        ...state.listQuery
    }
    dialog.value.showLoading()
    getDailyStatDetail(data).then(res => {
        if (res.status === 'OK') {
            let { total, list = [] } = res.data
            state.tableData = list
            state.total = total
        }
        dialog.value.closeLoading()
    })
}

const cancel = () => {
    emits('close')
}
</script>

<style lang='scss'>
</style>