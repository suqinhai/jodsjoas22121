<template>
    <!-- 运营中心-票券中心-已使用数量 -->
	<Dialog ref="dialog" width="1100" :title="$t('已使用数量')" top="10vh" :isShowBottomButton="false" @cancel="emits('close')">
		<div class="container">
			<el-form class="filter-form" :model="state.formData" inline>
				<el-form-item>
				    <el-date-picker v-model="state.formData.receiveTime" type="daterange" value-format="YYYY-MM-DD" :start-placeholder="$t('开始时间')"
				        :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" />
				</el-form-item>
				<el-form-item>
					<el-select style="width: 100px" v-model="state.formData.queryType" @change="state.formData.queryVal = ''">
						<el-option v-for="item in state.metaData.inputTypeList" :key="item.value" :label="item.label" :value="item.value" />
					</el-select>
					<div style="display: inline-block;">
						<el-input v-model="state.formData.queryVal" v-if="state.formData.queryType === 2" @input="(val) => state.formData.queryVal = val.replace(/\D/g,'')"
							:placeholder="placeholderLabel" />
						<el-input v-model="state.formData.queryVal" v-else :placeholder="placeholderLabel" />
					</div>
				</el-form-item>
				<el-form-item>
					<el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
				</el-form-item>
				<el-form-item>
					<el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
				</el-form-item>
			</el-form>
			<el-table :data="state.tableData" class="table-box" border>
				<el-table-column prop="useTime_" :label="$t('使用日期')" align="center" />
				<el-table-column prop="userId" :label="$t('会员ID')" align="center">
					<template #default="{ row }">
						<span class="special pointer" @click="showMemberDetail(row.userId)">{{row.userId || ''}}</span>
					</template>
				</el-table-column>
				<el-table-column prop="username" :label="$t('会员账号')" align="center">
					<template #default="{ row }">
						<span class="special pointer" @click="showMemberDetail(row.userId)">{{row.username || ''}}</span>
					</template>
				</el-table-column>
				<el-table-column prop="type_" :label="$t('票券类型')" align="center" />
				<el-table-column prop="name" :label="$t('票券名称')" align="center" />
<!-- 				<el-table-column prop="addTime_" :label="$t('派发时间')" align="center" /> -->
				<el-table-column prop="originType_" :label="$t('关联类型')" align="center" />
				<el-table-column prop="originName" :label="$t('关联详情')" align="center" />
				<el-table-column prop="amount" :label="$t('票券金额')" align="center" />
			</el-table>
			<Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
				@pagination="fetchData"></Pagination>
		</div>
	</Dialog>
</template>

<script setup>
import { reactive, onMounted, ref, computed } from "vue"
import { getUseDetail } from '@/api/operation.js'
import { getShortcuts, disabledCurrentDateAfter } from "@/common/util/index"

const shortcuts = getShortcuts()
const emits = defineEmits(['close'])
const state = reactive({
    tableData: [],
    formData: {
		queryType: 2
	},
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
	metaData: {
		inputTypeList: []
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
	state.metaData.inputTypeList = [
		{ label: $t('会员账号'), value: 1, placeholder: $t('请输入会员账号') },
		{ label: $t('会员ID'), value: 2, placeholder: $t('请输入会员ID') },
	]
	fetchData()
})

const placeholderLabel = computed(() => {
    return state.metaData.inputTypeList.find(item => item.value === state.formData.queryType)?.placeholder || ''
});

// 查看会员详情
const showMemberDetail = (id) => {
    globalVBus.$emit('memberDetailDialog', id)
}

// 表格过滤数据处理
const fetchData = (val = '') => {
	if (val) {
	    state.listQuery._page = 1
	    if (val === 'reset') {
	        state.formData = {
				queryType: 2
			}
	    }
	}
	let params = {
		...state.listQuery,
	    ...state.formData,
		ticketId: props.itemData.id
	}
	let { receiveTime } = state.formData
	if (receiveTime && receiveTime.length) {
	    params['interval.begin'] = receiveTime[0]
	    params["interval.end"] = receiveTime[1]
	}
    if (state.formData.queryType === 1) params['username'] = state.formData.queryVal
    if (state.formData.queryType === 2) params['userId'] = state.formData.queryVal
	delete params.receiveTime
	delete params.queryType
	delete params.queryVal
	if (val === 'export') params.isExport = true
    dialog.value.showLoading()
    getUseDetail(params).then(res => {
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
