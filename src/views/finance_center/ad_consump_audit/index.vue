<template>
    <!-- 财务中心-广告消耗审核 -->
	<div class="container">
		<el-form class="filter-form" :model="state.formData" inline>
			<el-form-item>
			    <el-select class="select-box" v-model="state.formData.status" :placeholder="$t('请选择状态')" filterable>
			       <el-option v-for="item in state.metaData.rewardStatus" :key="item.value" :label="item.label" :value="item.value" />
			    </el-select>
			</el-form-item>
		     <el-form-item :label="$t('站点:')">
		         <MerchantSiteSelect isShowAll isNeedDefault :clearable="false" style="width: 200px" v-model="state.formData.siteId" />
		     </el-form-item>
		     <el-form-item>
		         <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
		     </el-form-item>
		     <el-form-item>
		         <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
		     </el-form-item>
		 </el-form>
		<el-table :data="state.tableData" class="table-box" border>
			<el-table-column prop="merchantId" :label="$t('站点ID')" align="center" />
			<el-table-column prop="siteName" :label="$t('站点名称')" align="center" />
			<el-table-column prop="fee" :label="$t('录入金额')" align="center" />
			<el-table-column prop="addTime" :label="$t('录入时间')" align="center" />
			<el-table-column prop="emp.name" :label="$t('录入人')" align="center" />
			<el-table-column prop="remark" :label="$t('录入人备注')" align="center" />
			<el-table-column prop="updateTime" :label="$t('审核时间')" align="center" />
			<el-table-column prop="reviewEmp.name" :label="$t('审核人')" align="center" />
			<el-table-column prop="reviewRemark" :label="$t('审核人备注')" align="center" />
			<el-table-column prop="status_" :label="$t('状态')" align="center" />
			<el-table-column :label="$t('操作')" min-width="120" align="center">
				<template #default="{ row }">
				   <el-button v-throttle type="primary" text @click="auditConfig(row)" v-if="row.status === 2">{{$t('审核')}}</el-button>
				</template>
			</el-table-column>
		</el-table>
		<Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
			@pagination="fetchData"></Pagination>
	</div>
</template>

<script setup>
import { reactive, onMounted } from "vue"
import { getReviewList, postFeeReview } from '@/api/operation.js'
import { getCommonMeta } from '@/api/common'
import { dateFormat } from '@/common/util'

const emits = defineEmits(['close','handleEdit'])
const state = reactive({
    tableData: [],
	formData: {},
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
	metaData: {}
})

onMounted(() => {
	getCommonMeta({ types: 'rewardStatus' }).then(res => {
		res.data.rewardStatus = res.data.rewardStatus.filter((item)=>{ return Number(item.value) > 1 })
		state.metaData.rewardStatus = res.data.rewardStatus
	})
	fetchData()
})

// 查看会员详情
const showMemberDetail = (id) => {
    globalVBus.$emit('memberDetailDialog', id)
}

const auditConfig = (row = {}) => {
	ElMessageBox.prompt($t('是否审核通过？'), $t('审核'), {
		confirmButtonText: $t('通过'),
		cancelButtonText: $t('拒绝'),
		distinguishCancelAndClose: true,
		beforeClose: (action, value, done) => {
			if (action !== "close") {
				const data = {
					id: row.id,
					status: action === 'confirm' ? 3 : 4,
					remark: value.inputValue
				}
				postFeeReview(data).then(() => {
					fetchData()
					done()
				})
			} else {
				done()
			}
		}
	})
}

// 表格过滤数据处理
const fetchData = (val = '') => {
	if (val) {
	    state.listQuery._page = 1
	    if (val === 'reset') {
	        state.formData = {}
	    }
	}
	let params = {
		...state.listQuery,
		...state.formData,
	}
	if(state.formData.siteId === 0) delete params.siteId
	 globalVBus.$emit('globalLoading', true)
    getReviewList(params).then(res => {
        let { total, list } = res.data
        state.tableData = list || []
		state.tableData = list.map(item => {
		    item.addTime && (item.addTime = dateFormat(item.addTime))
			item.updateTime && (item.updateTime = dateFormat(item.updateTime))
			item.period && (item.period = dateFormat(item.period))
		    return item
		})
        state.total = total
		globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
		globalVBus.$emit('globalLoading', false)
    })
}

</script>

<style lang="scss" scoped>
</style>
