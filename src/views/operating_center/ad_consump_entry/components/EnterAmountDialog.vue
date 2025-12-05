<template>
    <!-- 运营中心-广告消耗录入-录入总金额 -->
	<Dialog ref="dialog" width="1100" :title="$t('录入总金额')" top="10vh" :isShowBottomButton="false" @cancel="emits('close')">
		<div class="container">
			<el-table :data="state.tableData" class="table-box" border>
				<el-table-column prop="period_" :label="$t('日期')" align="center" />
				<el-table-column prop="fee" :label="$t('录入金额')" align="center" />
				<el-table-column prop="addTime" :label="$t('录入时间')" align="center" />
				<el-table-column prop="status_" :label="$t('状态')" align="center" />
				<el-table-column prop="reviewRemark" :label="$t('审核人备注')" align="center" />
				<el-table-column :label="$t('操作')" min-width="120" align="center">
				    <template #default="{ row }">
				       <el-button v-throttle type="primary" text v-if="[3,4].includes(row.status)" @click="editConfig(row)">{{$t('修改')}}</el-button>
				    </template>
				</el-table-column>
			</el-table>
			<Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
				@pagination="fetchData"></Pagination>
		</div>
	</Dialog>
</template>

<script setup>
import { reactive, onMounted, ref, defineExpose } from "vue"
import { getReviewList } from '@/api/operation.js'
import { dateFormat } from '@/common/util'

const emits = defineEmits(['close','handleEdit'])
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
    itemData: {
		type: Object,
		default: () => {
			return {}
		}
	},
})

onMounted(() => {
	fetchData()
})

const editConfig = (data)=>{
	data.type = 'edit'
	emits('handleEdit',data)
}

// 表格过滤数据处理
const fetchData = (val = '') => {
	let params = {
		...state.listQuery,
		siteId: props.itemData.id
	}
    dialog.value.showLoading()
    getReviewList(params).then(res => {
        let { total, list } = res.data
        state.tableData = list || []
		state.tableData = list.map(item => {
		    item.addTime && (item.addTime = dateFormat(item.addTime))
		    return item
		})
        state.total = total
        dialog.value.closeLoading()
    }).catch(err => {
        state.tableData = []
        dialog.value.closeLoading()
    })
}

defineExpose({
	fetchData
})

</script>

<style lang="scss" scoped>
</style>
