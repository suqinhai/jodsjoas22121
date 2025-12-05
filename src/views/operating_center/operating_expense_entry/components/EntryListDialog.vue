<template>
    <!-- 运营中心-运营费用录入-人力成本和其他成本 -->
	<Dialog ref="dialog" width="700" :title="$t('录入列表')" top="10vh" :isShowBottomButton="false" @cancel="emits('close')">
		<div class="container">
			<el-table :data="state.tableData" class="table-box" border>
				<el-table-column prop="period_" :label="$t('录入日期')" align="center" />
				<el-table-column prop="fee" :label="$t('录入金额')" align="center" />
				<el-table-column prop="remark" :label="$t('备注')" align="center" />
				<el-table-column prop="emp.name" :label="$t('操作人')" align="center" />
			</el-table>
			<Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
				@pagination="fetchData"></Pagination>
		</div>
	</Dialog>
</template>

<script setup>
import { reactive, onMounted, ref } from "vue"
import { getReviewList } from '@/api/operation.js'

const emits = defineEmits(['close'])
const state = reactive({
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
})
const dialog = ref()

const props = defineProps({
    type: {
		type: Number,
		default: () => {
			return 1
		}
	},
})

onMounted(() => {
	fetchData()
})

// 表格过滤数据处理
const fetchData = (val = '') => {
	let params = {
		...state.listQuery,
		type: props.type
	}
    dialog.value.showLoading()
    getReviewList(params).then(res => {
        let { total, list } = res.data
        state.tableData = list || []
        state.total = total
        dialog.value.closeLoading()
    }).catch(err => {
        state.tableData = []
        dialog.value.closeLoading()
    })
}

</script>

<style lang="scss" scoped>
</style>
