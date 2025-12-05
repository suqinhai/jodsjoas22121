<template>
    <!-- 平台费用详情-产生站点 -->
    <Dialog ref="dialog" width="600" :title="$t('产生站点') + `（${itemData.period}）`" :isShowSubmit="false" top="5vh" @cancel="emits('close')">
        <div class="generate-site-table">
            <el-table :data="state.tableData" border>
                <el-table-column prop="merchantId" :label="$t('站点ID')" min-width="120" align="center" />
                <el-table-column prop="gameFee" :label="$t('游戏抽成')" min-width="160" align="center" />
                <el-table-column prop="cdnFee" :label="$t('CDN费用')" min-width="160" align="center" />
            </el-table>
        </div>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue"
import { getPlatformSiteFeeList } from '@/api/dashboard'

const emits = defineEmits(['close'])
const props = defineProps({
    itemData: {
        type: Object,
        default: {}
    },
})
const state = reactive({
    tableData: [],
})
const dialog = ref(null)

onMounted(() => {
    fetchData()
})

const fetchData = () => {
    dialog.value.showLoading()
    getPlatformSiteFeeList(props.itemData).then(({ data }) => {
        state.tableData = data || []
        dialog.value.closeLoading()
    }).catch(err => {
        state.tableData = []
        dialog.value.closeLoading()
    })
}
</script>

<style lang="scss">
.generate-site-table {
    overflow-y: auto;
    max-height: 75vh;
}
</style>
