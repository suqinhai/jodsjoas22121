<template>
    <!-- 广告消耗录入 -->
    <div class="container purchase-volume-record">
        <el-form class="filter-form" :model="state.formData" inline>
            <el-form-item>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')"
                    :shortcuts="shortcuts" :disabled-date="disabledCurrentDateAfter" value-format="YYYY-MM-DD">
                </el-date-picker>
            </el-form-item>
			<el-form-item :label="$t('站点:')">
			    <MerchantSiteSelect isShowAll @change="getChannelDataList" isNeedDefault :clearable="false" style="width: 200px" v-model="state.formData.merchantId" />
			</el-form-item>
            <el-form-item :label="$t('渠道:')">
                <el-select v-model="state.formData.channelIds" :placeholder="$t('请选择渠道')">
                    <el-option v-for="item in state.channelList" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
            </el-form-item>
			<el-form-item>
			    <el-select class="select-box" v-model="state.formData.status" :placeholder="$t('请选择状态')" filterable>
			        <el-option v-for="item in state.metaData.rewardStatus" :key="item.value" :label="item.label" :value="item.value" />
			    </el-select>
			</el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item v-permiss="'merchant.channel.editCostDaily'">
                <el-button v-throttle type="primary" @click="state.itemData = {};state.showDeployDialog = true">{{$t('渠道消耗金额录入')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table :data="state.tableData" class="table-box" border>
            <el-table-column prop="reportTime_" :label="$t('消耗日期')" min-width="100" align="center" />
			<el-table-column prop="siteName" :label="$t('站点名称')" min-width="100" align="center" />
			<el-table-column prop="merchantId" :label="$t('站点ID')" min-width="100" align="center" />
            <el-table-column prop="channelId" :label="$t('渠道ID')" min-width="100" align="center" />
            <el-table-column prop="channelName" :label="$t('渠道名称')" min-width="100" align="center" />
            <el-table-column prop="cost" :label="$t('消耗金额')" min-width="100" align="center">
				<template #header>
					<div>{{$t('消耗金额')}}</div>
					<div>{{$t('（USDT）')}}</div>
				</template>
			</el-table-column>
			<el-table-column prop="status_" :label="$t('状态')" min-width="100" align="center" />
			<el-table-column prop="remark" :label="$t('录入人备注')" min-width="100" align="center" />
			<el-table-column prop="reviewRemark" :label="$t('审核人备注')" min-width="100" align="center" />
			<el-table-column prop="emp.name" :label="$t('录入人')" min-width="100" align="center" />
			<el-table-column prop="reviewEmp.name" :label="$t('审核人')" min-width="100" align="center" />
			<el-table-column prop="addTime" :label="$t('录入时间')" min-width="100" align="center" />
			<el-table-column prop="updateTime" :label="$t('审核时间')" min-width="100" align="center" />
			<el-table-column :label="$t('录入人操作')" min-width="100" align="center">
				<template #default="{ row }">
					<el-button v-throttle type="primary" :itemData="state.itemData" text v-permiss="'merchant.channel.editCostDaily'" v-if="[3,4].includes(row.status)" @click="editConfig(row)">{{$t('修改')}}</el-button>
					<span v-else>--</span>
				</template>
			</el-table-column>
            <el-table-column :label="$t('操作')" min-width="100" align="center">
				<template #default="{ row }">
					<el-button v-throttle type="primary" text @click="auditConfig(row)" v-permiss="'merchant.channel.review'" v-if="row.status === 2">{{$t('审核')}}</el-button>
				</template>
			</el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>

        <DeployDialog v-if="state.showDeployDialog" :itemData="state.itemData" :channelList="state.channelList" @close="state.showDeployDialog = false" @fetchData="fetchData">
        </DeployDialog>
    </div>
</template>

<script setup name="purchaseVolumeRecord">
import { reactive, onMounted, defineAsyncComponent } from "vue"
import { getPurchaseVolumeRrecord, postFeeReview } from '@/api/data_center'
import { getChannelData, getCommonMeta } from '@/api/common'
import { disabledCurrentDateAfter, getShortcuts, dateFormat } from '@/common/util'
import commonStore from '@/store/common'
const DeployDialog = defineAsyncComponent(() => import('./components/DeployDialog.vue'))

const shortcuts = getShortcuts()
const commonData = commonStore()
const state = reactive({
    formData: {},
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
	metaData:{},
	itemData: {},
    channelList: [],
    showDeployDialog: false,
	merchantIds: commonData.merchantSiteList.map((item)=>{return item.id})
})

getCommonMeta({ types: 'rewardStatus' }).then(res => {
	res.data.rewardStatus = res.data.rewardStatus.filter((item) => { return Number(item.value) > 1 })
	state.metaData.rewardStatus = res.data.rewardStatus
})

onMounted(() => {
	getChannelDataList(0)
    fetchData()
})

const getChannelDataList = (merchantId)=> {
	const merchantIds = (merchantId == 0 ? state.merchantIds.join(',') : merchantId)
	getChannelData({merchantIds,merchantId:0}).then(res => {
	    state.channelList = res.data || []
		state.formData.channelIds = ''
	})
}

const editConfig = (data)=>{
	data.type = 'edit'
	state.itemData = data
	state.showDeployDialog = true
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
			state.formData.merchantId = 0
			getChannelDataList(state.formData.merchantId)
        }
    }
    let params = { ...state.listQuery, ...state.formData }
    let { receiveTime } = state.formData
    if (receiveTime && receiveTime.length) {
        params['interval.begin'] = receiveTime[0]
        params['interval.end'] = receiveTime[1]
    }
	params['merchantIds'] = state.formData.merchantId == 0 ? state.merchantIds.join(',') : state.formData.merchantId
	params['merchantId'] = 0
    delete params.receiveTime
    globalVBus.$emit('globalLoading', true)
    getPurchaseVolumeRrecord(params).then(({ data = {}, ext = {} }) => {
        let { total, list } = data
        state.tableData = list || []
		state.tableData = list.map(item => {
			item.addTime && (item.addTime = dateFormat(item.addTime))
			item.updateTime && (item.updateTime = dateFormat(item.updateTime))
			return item
		})
		// if (state.tableData.length) {
		//     state.tableData.unshift({
		// 		cost: ext.sum || 0,
		//         reportTime_: $t('总计'),
		//     })
		// }
        state.total = total
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss">
.purchase-volume-record {
}
</style>
