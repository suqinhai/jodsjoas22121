<template>
    <!-- 稽核管理 -->
    <div class="container audit-management">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item :label="$t('交易时间:')">
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" value-format="YYYY-MM-DD" :start-placeholder="$t('开始时间')"
                    :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" />
            </el-form-item>
            <el-form-item :label="$t('会员ID:')">
                <el-input @input="(val) => state.formData.userId = val.replace(/\D/g,'')" v-model="state.formData.userId"
                    :placeholder="$t('请输入会员ID')" />
            </el-form-item>
            <el-form-item :label="$t('会员账号:')">
                <el-input v-model="state.formData.username" :placeholder="$t('请输入会员账号')" />
            </el-form-item>
            <el-form-item :label="$t('状态:')">
                <el-select class="select-box" v-model="state.formData.status" clearable :placeholder="$t('请选择状态')">
                    <el-option v-for="item in metaData.auditStatus" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
			<el-form-item :label="$t('站点:')">
			    <MerchantSiteSelect isShowAll isNeedDefault :clearable="false" style="width: 200px" v-model="state.formData.merchantId" />
			</el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item v-permiss="'merchant.user-coin-log.unblockAudit'">
                <el-button v-throttle type="primary" @click="handleRelieve('')">{{$t('批量解除')}}</el-button>
            </el-form-item>
            <el-form-item v-permiss="'merchant.user-coin-log.addAudit'">
                <el-button v-throttle type="primary" @click="state.showAddAuto = true">{{$t('新增稽核')}}</el-button>
            </el-form-item>
            <el-form-item v-permiss="'merchant.audit-config.edit-3'">
                <el-button v-throttle type="primary" @click="handleAutoRelieve">{{$t('稽核自动解除额度')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table ref="tableRef" class="table-box" :data="state.tableData" border @selection-change="handleSelectionChange">
            <el-table-column v-if="isPermiss" fixed="left" type="selection" :selectable="(row) => [0,1].includes(row.status)" width="55" />
			<el-table-column prop="merchant.id" :label="$t('站点ID')" min-width="120" align="center" />
            <el-table-column :label="$t('会员ID')" min-width="120" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail({userId:row.userId,merchant: row.merchant})">{{row.userId || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('会员账号')" min-width="140" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail({userId:row.userId,merchant: row.merchant})">{{row.username || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="addTime" :label="$t('交易时间')" min-width="160" align="center" />
            <el-table-column prop="typeName" :label="$t('类型细项')" min-width="140" align="center" />
            <el-table-column prop="activityName" :label="$t('活动名称')" min-width="200" align="center" />
            <el-table-column prop="auditAmount" :label="$t('稽核金额')" min-width="120" align="center" />
            <el-table-column prop="auditFactor" :label="$t('稽核倍数')" min-width="100" align="center" />
            <el-table-column prop="freeAuditAmount" :label="$t('已稽核')" min-width="120" align="center">
                <template #default="{ row }">
                    {{(row.totalAuditAmount  - row.auditRemain).toFixed(2)}}
                </template>
            </el-table-column>
            <el-table-column prop="auditRemain" :label="$t('未稽核')" min-width="120" align="center" />
            <el-table-column prop="freeAuditAmount" :label="$t('解除金额')" min-width="120" align="center" />
            <el-table-column prop="status_" :label="$t('状态')" min-width="140" align="center">
                <template #default="{ row }">
                    {{[0,1,3,9].includes(row.status) ? row.status_ : $t('已完成(手动解除)')}}
                </template>
            </el-table-column>
            <el-table-column prop="emp.name" :label="$t('操作人')" min-width="140" align="center" />
            <el-table-column prop="updateTime" :label="$t('操作时间')" min-width="160" align="center" />
            <el-table-column fixed="right" align="center" :label="$t('操作')" width="120">
                <template #default="{ row }">
                    <el-button v-throttle type="primary" v-if="[0,1].includes(row.status) && isPermiss" text @click="handleRelieve(row)">
                        {{$t('人工解除')}}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            :isShowChecked="!!state.tableListSelection.length && isPermiss" :selectedNum="state.tableListSelection.length" @pagination="fetchData">
        </Pagination>

        <AddAutoDeploy :formData="state.formData" v-if="state.showAddAuto" @close="state.showAddAuto = false" @fetchData="fetchData">
        </AddAutoDeploy>
        <AutoRelieveDeploy :formData="state.formData" v-if="state.showAutoRelieve" :itemData="state.itemData" @close="state.showAutoRelieve = false">
        </AutoRelieveDeploy>
		<MemberDetail v-if="state.memberDetailShow" :merchantId="state.merchantId" @close="state.memberDetailShow = false"></MemberDetail>
    </div>
</template>

<script setup name='auditManagement'>
import { ref, reactive, onMounted, computed, defineAsyncComponent } from 'vue'
import userStore from '@/store/user'
import commonStore from '@/store/common'
import { ElMessageBox } from "element-plus";
import { getMemberAuditTaskList, postRelieveAuditTask } from '@/api/finance'
import { getShortcuts, dateFormat, disabledCurrentDateAfter, getTimeRange } from '@/common/util'
const AddAutoDeploy = defineAsyncComponent(() => import('./components/AddAutoDeploy.vue'))
const AutoRelieveDeploy = defineAsyncComponent(() => import('./components/AutoRelieveDeploy.vue'))

const commonData = commonStore()
const shortcuts = getShortcuts()
const state = reactive({
    formData: {},
    tableData: [],
    tableListSelection: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    itemData: {},
    showAddAuto: false,
    showAutoRelieve: false,
	isClick: false,
	memberDetailShow: false,
	merchantId: '',
})
const userData = userStore()
let metaData = reactive({
    auditStatus: [
        { label: $t('未开始'), value: 0 },
        { label: $t('进行中'), value: 1 },
        { label: $t('已完成(手动解除)'), value: 5 },
        { label: $t('已完成'), value: 9 },
    ]
})
const tableRef = ref(null)

const isPermiss = computed(() => {
    return userData.isHasPermiss('merchant.user-coin-log.unblockAudit')
})

onMounted(() => {
    state.formData.receiveTime = getTimeRange()
    fetchData()
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val) {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {
				receiveTime: getTimeRange(),
				merchantId: 0
			}
        }
    }
    let params = { ...state.listQuery, ...state.formData }
    let { receiveTime } = state.formData
    if (receiveTime && receiveTime.length) {
        params['interval.begin'] = receiveTime[0]
        params['interval.end'] = receiveTime[1]
    }
    delete params.receiveTime
    isPermiss.value && tableRef.value && tableRef.value.clearSelection()
    globalVBus.$emit('globalLoading', true)
    getMemberAuditTaskList(params).then(res => {
        let { list, total } = res.data
        state.tableData = list.map(item => {
            item.addTime && (item.addTime = dateFormat(item.addTime))
            item.updateTime && (item.updateTime = dateFormat(item.updateTime))
            return item
        })
        state.total = total
		state.isClick = !!!state.formData.merchantId
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []

        globalVBus.$emit('globalLoading', false)
    })
}

// 表格勾选切换
const handleSelectionChange = (val) => {
    state.tableListSelection = val
}

// 查看会员详情
const showMemberDetail = ({ userId, merchant }) => {
    commonData.memberId = userId
    state.merchantId = merchant.id
    state.memberDetailShow = true
}

// 获取稽核自动解除额度
const handleAutoRelieve = () => {
	state.showAutoRelieve = true
}

// 人工解除
const handleRelieve = (row) => {
    let obj = { id: row.id, merchantId: row.merchant?.id }
    if (!row.id) {
        let { tableListSelection } = state
        if (!tableListSelection.length) {
            return ElMessage.warning($t('请至少选择一条数据再进行操作！'))
        }
		if(!tableListSelection.every((item)=>{ return item.merchant.id ===  tableListSelection[0].merchant.id})){
			return ElMessage.warning($t('批量操作一次只能操作属于同一个站点的一批用户!'))
		}
        obj = {
            ids: tableListSelection.map(item => item.id).join(','),
			merchantId: tableListSelection[0].merchant.id
        }
    }
    ElMessageBox.confirm(`${$t('确定对')}${!row.id ? $t('选中的') : $t('此')}${$t('稽核任务进行人工解除操作吗？')}`, $t('提示'), {
        type: 'warning'
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        postRelieveAuditTask(obj).then(res => {
            fetchData()
        }).catch(err => {
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(err => { })
}
</script>

<style lang="scss">
.audit-management {
}
</style>
