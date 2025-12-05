<template>
    <!-- 游戏统计-游戏平台投注人数 -->
	<Dialog :title="$t('游戏平台投注人数')" ref="dialog" :width="1200" @cancel="emits('close')" :isShowSubmit="false">
		<div class="container game-statistics">
			<el-table :data="state.tableData" class="table-box" border>
				<el-table-column prop="period_" :label="$t('日期')" min-width="120" align="center" />
				<el-table-column prop="user.name" :label="$t('会员账号')" min-width="120" align="center" />
				<el-table-column :label="$t('投注金额')" align="center" min-width="120">
					<template #default="{ row }">
						{{ row.coinIn }}
					</template>
				</el-table-column>
				<el-table-column prop="validCoinIn" :label="$t('有效投注')" min-width="120" align="center" />
				<el-table-column :label="$t('损益')" align="center" min-width="120">
					<template #default="{ row }">
						<div style="color: red" v-if="row.merWinCoin >= 0">{{ row.merWinCoin }}</div>
						<div style="color: green" v-if="row.merWinCoin < 0">{{ row.merWinCoin }}</div>
					</template>
				</el-table-column>
			</el-table>
			<Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
				@pagination="getData"></Pagination>
		</div>
	</Dialog>
</template>

<script setup name="gameStatistics">
import { reactive, onMounted } from "vue"
import { getPlayerNumData } from '@/api/statistics'

const prop = defineProps(['item','stateItem'])
const emits = defineEmits(['close'])
const state = reactive({
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
})

onMounted(() => {
    getData()
})

// 表格过滤数据处理
const getData = (val = '') => {
    const params = {
		'vendor': prop.item.vendor,
		'gameType': prop.item.gameType,
		...prop.stateItem,
		...state.listQuery
	}
    globalVBus.$emit('globalLoading', true)
    getPlayerNumData(params).then(res => {
		let { total, list } = res.data
		state.tableData = list
		state.total = total
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        if (!params.isExport) state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss" scoped>
.game-statistics {
}
</style>
