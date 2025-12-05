<template>
    <!-- 运营中心-运营费用录入 -->
    <div class="container">
       <el-form class="filter-form" inline>
            <el-form-item>
                <el-button v-throttle type="primary" @click="state.showCostEntryDialog = true">{{$t('新增')}}</el-button>
            </el-form-item>
			<el-form-item>
			    <el-button v-throttle type="primary" @click="fetchData">{{$t('刷新')}}</el-button>
			</el-form-item>
        </el-form>
        <el-table :data="state.tableData" class="table-box" border>
			<el-table-column prop="adFee" :label="$t('广告消耗')" min-width="120" align="center">
				<template #header>
					<div>{{$t('广告消耗')}}</div>
					<div>{{$t('（USDT）')}}</div>
				</template>
			</el-table-column>
            <el-table-column prop="manpowerFee" :label="$t('人力成本')" width="120" align="center">
				<template #header>
					<div>{{$t('人力成本')}}</div>
					<div>{{$t('（USDT）')}}</div>
				</template>
				<template #default="{ row }">
					<span class="special pointer" @click="handleEnter(1)">{{row.manpowerFee}}</span>
				</template>
			</el-table-column>
            <el-table-column prop="otherFee" :label="$t('其他成本')" min-width="100" align="center">
				<template #header>
					<div>{{$t('其他成本')}}</div>
					<div>{{$t('（USDT）')}}</div>
				</template>
				<template #default="{ row }">
					<span class="special pointer" @click="handleEnter(2)">{{row.otherFee}}</span>
				</template>
			</el-table-column>
			<el-table-column align="center">
			    <template #header>
					<div>
						{{$t('平台费用')}}
						<el-tooltip effect="dark" :content="$t('开版费，服务器费用，游戏抽成（未出，未结游戏抽成），cdn费用')" placement="top">
						    <el-icon class="pointer" :size="15">
						        <QuestionFilled />
						    </el-icon>
						</el-tooltip>
					</div>
					<div>{{$t('（USDT）')}}</div>
			    </template>
			    <template #default="{ row }">
			        {{ row.platformFee }}
			    </template>
			</el-table-column>
			<el-table-column align="center">
			    <template #header>
					<div>
						{{$t('充提差')}}
						<el-tooltip effect="dark" :content="$t('自动计算商户所有站点会员总充值总提现-按usdt换算')" placement="top">
						    <el-icon class="pointer" :size="15">
						        <QuestionFilled />
						    </el-icon>
						</el-tooltip>
					</div>
					<div>{{$t('（USDT）')}}</div>
			    </template>
			    <template #default="{ row }">
			        {{ row.rechargeCashDiff }}
			    </template>
			</el-table-column>
			<el-table-column align="center">
			    <template #header>
					<div>
						{{$t('净利润')}}
						<el-tooltip effect="dark" :content="$t('净利润=充提差-平台费-人力成本-其他成本-广告消耗')" placement="top">
						    <el-icon class="pointer" :size="15">
						        <QuestionFilled />
						    </el-icon>
						</el-tooltip>
					</div>
					<div>{{$t('（USDT）')}}</div>
			    </template>
			    <template #default="{ row }">
			        {{ row.netProfit }}
			    </template>
			</el-table-column>
        </el-table>
		<CostEntryDialog v-if="state.showCostEntryDialog" @close="state.showCostEntryDialog = false" @fetchData="fetchData"></CostEntryDialog>
		<EntryListDialog :type="state.type" v-if="state.showEntryListDialog" @close="state.showEntryListDialog = false" @fetchData="fetchData"></EntryListDialog>
    </div>
</template>

<script setup name="operatingExpenseEntry">
import { reactive, onMounted, defineAsyncComponent } from "vue"
import { getFeeStat } from '@/api/operation.js'
const CostEntryDialog = defineAsyncComponent(() => import("./components/CostEntryDialog.vue"))
const EntryListDialog = defineAsyncComponent(() => import("./components/EntryListDialog.vue"))


const state = reactive({
    tableData: [],
	showCostEntryDialog: false,
	showEntryListDialog: false,
	type: ''
})

onMounted(() => {
    fetchData()
})

const handleEnter = (type)=>{
	state.type = type
	state.showEntryListDialog = true
}

// 表格过滤数据处理
const fetchData = (val = '') => {
    globalVBus.$emit('globalLoading', true)
    getFeeStat({}).then(({ data = {}, ext = {} }) => {
        state.tableData = [data]
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss">
</style>