<template>
    <!-- 运营中心-广告消耗录入 -->
    <div class="container">
       <el-form class="filter-form" :model="state.formData" inline>
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
			<el-table-column prop="id" :label="$t('站点ID')" align="center" />
            <el-table-column prop="siteName" :label="$t('站点名称')" align="center" />
            <el-table-column prop="total" :label="$t('录入总金额')" align="center">
				<template #default="{ row }">
					<span class="special pointer" @click="handleEnter(row)">{{row.total}}</span>
				</template>
			</el-table-column>
			<el-table-column prop="lastAmount" :label="$t('最新录入金额')" align="center" />
			<el-table-column :label="$t('操作')" align="center">
			    <template #default="{ row }">
			        <!-- <el-button v-throttle type="primary" text @click="handleEdit(row)">{{$t('修改')}}</el-button> -->
			        <el-button v-throttle type="primary" text @click="handleEdit(row)">{{$t('录入')}}</el-button>
			    </template>
			</el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>
		<EditDialog :itemData="state.editItemData" v-if="state.showEditDialog" @close="state.showEditDialog = false" @fetchDataEnterAmountDialog="fetchDataEnterAmountDialog"></EditDialog>
		<EnterAmountDialog ref="enterAmountDialogRef" :itemData="state.itemData" v-if="state.showEnterAmountDialog" @close="state.showEnterAmountDialog = false" @handleEdit="handleEdit"></EnterAmountDialog>
    </div>
</template>

<script setup name="adConsumpEntry">
import { reactive, onMounted, defineAsyncComponent, ref } from "vue"
import { getEnteringList } from '@/api/operation.js'
const EditDialog = defineAsyncComponent(() => import("./components/EditDialog.vue"))
const EnterAmountDialog = defineAsyncComponent(() => import("./components/EnterAmountDialog.vue"))

const state = reactive({
    tableData: [],
    formData: {},
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
	showEditDialog: false,
	showEnterAmountDialog: false,
	itemData: {},
	editItemData: {}
})
const enterAmountDialogRef = ref(null)

onMounted(() => {
    fetchData()
})


// 查看会员详情
const showMemberDetail = (id) => {
    globalVBus.$emit('memberDetailDialog', id)
}

const handleEdit = (data)=>{
	state.editItemData = data
	state.showEditDialog = true
}

const handleEnter = (data)=>{
	state.itemData = data
	state.showEnterAmountDialog = true
}

const fetchDataEnterAmountDialog = ({ type })=>{
	if(type === 'edit'){
		enterAmountDialogRef.value.fetchData()
	}else{
		fetchData()
	}
}

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val && val !== 'export') {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {}
        }
    }
    let params = {
        ...state.listQuery,
        ...state.formData
    }
	if(state.formData.siteId === 0) delete params.siteId
    globalVBus.$emit('globalLoading', true)
    getEnteringList(params).then(({ data = {}, ext = {} }) => {
        state.tableData = data.list || []
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss">
</style>