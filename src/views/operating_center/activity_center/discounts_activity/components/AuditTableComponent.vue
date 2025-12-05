<template>
    <!-- 运营中心-优惠活动列表-活动列表/已关闭活动-自定义活动-奖励审核派发-申请审核/派发奖励 -->
    <div class="audit-component">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item>
                <el-select style="width: 100px" v-model="state.formData.timeType" :placeholder="$t('时间类型')">
                    <el-option :label="$t('申请时间')" :value="0" />
                    <el-option :label="$t('审核时间')" :value="1" />
                </el-select>
                <el-date-picker v-model="state.formData.receiveTime" type="datetimerange" value-format="YYYY-MM-DD HH:mm:ss" :start-placeholder="$t('开始时间')"
                    :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" :default-time="defaultTime" />
            </el-form-item>
            <el-form-item :label="$t('状态:')">
                <el-select style="width: 150px" v-model="state.formData.status" :placeholder="$t('请选择状态')" clearable>
                    <el-option v-for="item in statusList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('会员ID:')">
                <el-input style="width: 150px" @input="(val) => state.formData.userId = val.replace(/\D/g,'')" v-model="state.formData.userId"
                    :placeholder="$t('请输入会员ID')" />
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('export')">{{$t('导出表格')}}</el-button>
            </el-form-item>
            <el-form-item v-if="!hasAudit && userData.isHasPermiss('merchant.promotion-audit-log.audit')">
                <el-button v-throttle type="primary" @click="handleBatch">{{$t('派发奖励')}}</el-button>
            </el-form-item>
            <!-- <el-form-item v-permiss="'admin.user.batchHandle'">
                <el-dropdown @command="handleBatch">
                    <el-button v-throttle type="primary">{{$t('批量操作')}}<el-icon class="el-icon--right">
                            <arrow-down />
                        </el-icon>
                    </el-button>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item :command="-1">{{$t('批量拒绝')}}</el-dropdown-item>
                            <el-dropdown-item :command="1">{{$t('批量通过')}}</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </el-form-item> -->
        </el-form>
        <el-table ref="tableRef" :data="state.tableData" border @selection-change="handleSelectionChange">
            <el-table-column v-if="!hasAudit" fixed="left" type="selection" :selectable="(row) => row.status === 1" width="55" />
            <el-table-column prop="id" label="ID" min-width="80" align="center" />
            <el-table-column :label="$t('会员ID')" min-width="120" align="center">
                <template #default="{ row }">
                    <span class="special pointer"
                        @click="emits('showDialog', {key: 'showMemberDialog', data: row.user})">{{row.user?.id || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('会员账号')" min-width="140" align="center">
                <template #default="{ row }">
                    <span class="special pointer"
                        @click="emits('showDialog', {key: 'showMemberDialog', data: row.user})">{{row.user?.name || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="addTime" :label="$t('申请时间')" min-width="160" align="center" />
            <el-table-column v-if="!hasAudit" prop="reward" :label="$t('奖励金额')" min-width="100" align="center" />
            <el-table-column v-if="!hasAudit" prop="auditMultiple" :label="$t('稽核倍数')" min-width="100" align="center" />
            <!-- <el-table-column prop="name" :label="$t('领取方式')" min-width="100" align="center" /> -->
            <el-table-column prop="status_" :label="hasAudit ? $t('审核状态') : $t('领取状态')" min-width="100" align="center" />
            <el-table-column prop="emp.name" :label="$t('审核人')" min-width="140" align="center" />
            <el-table-column prop="auditTime" :label="$t('审核时间')" min-width="160" align="center" />
            <el-table-column fixed="right" align="center" :label="$t('操作')" :width="150"
                v-if="userData.isHasPermiss('merchant.promotion-audit-log.audit') ">
                <template #default="{ row }">
                    <el-button v-if="hasAudit && row.status === 0" v-throttle type="primary" text @click="handleAudit(row,'showApplyAudit')">{{$t('审核')}}</el-button>
                    <el-button v-if="!hasAudit && row.status === 1" v-throttle type="primary" text @click="handleAudit(row,'showDistributeAward')">{{$t('派发奖励')}}</el-button>
                </template>
            </el-table-column>
        </el-table>

        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            :isShowChecked="!!state.tableListSelection.length && !hasAudit" :selectedNum="state.tableListSelection.length" @pagination="fetchData">
        </Pagination>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, defineEmits, defineExpose } from 'vue'
import userStore from '@/store/user'
import { getActivityApplyList } from "@/api/discounts_center.js";
import { dateFormat, getShortcuts, getDefaultTime, disabledCurrentDateAfter } from '@/common/util'

const shortcuts = getShortcuts()
let defaultTime = getDefaultTime()
const props = defineProps({
    metaData: {
        type: Object,
        default: () => {
            return {}
        }
    },
    activityData: {
        type: Object,
        default: () => {
            return {}
        }
    },
    hasAudit: {
        type: Boolean,
        default: true
    }
})
const emits = defineEmits(["showLoading", "closeLoading", "showDialog"])
const state = reactive({
    formData: {
        timeType: 0
    },
    tableData: [],
    ext: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    tableListSelection: [],
})
const tableRef = ref(null)
const userData = userStore()

const statusList = computed(() => {
    if (!props.metaData.promotionAuditStatus) return []
    let arr = props.hasAudit ? [0, 1, 3] : [1, 2, 4, 5, 6]
    return props.metaData.promotionAuditStatus.filter(item => arr.includes(+item.value))
})

onMounted(() => {
    fetchData()
})

const fetchData = (val = '') => {
    if (val && val !== 'export') {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData.receiveTime = []
            state.formData.status = ''
            state.formData.userId = ''
        }
    }
    let params = { ...state.listQuery, ...state.formData }
    let { receiveTime } = state.formData
    if (receiveTime && receiveTime.length) {
        params['interval.begin'] = receiveTime[0]
        params['interval.end'] = receiveTime[1]
    }
    delete params.receiveTime
    params.promotionId = props.activityData.id
    params.hasAudit = props.hasAudit
    if (val === 'export') {
        params.isExport = true
    } else {
        !props.hasAudit && tableRef.value && tableRef.value.clearSelection()
    }
    emits('showLoading')
    getActivityApplyList(params).then(res => {
        if (!params.isExport) {
            let { total, list } = res.data
            state.tableData = list.map(item => {
                item.addTime && (item.addTime = dateFormat(item.addTime))
                item.auditTime && (item.auditTime = dateFormat(item.auditTime))
                return item
            })
            state.total = total
            state.ext = res.ext || []
        }
        emits('closeLoading')
    }).catch(err => {
        if (!params.isExport) state.tableData = []
        emits('closeLoading')
    })
}

// 表格勾选切换
const handleSelectionChange = (val) => {
    state.tableListSelection = val
}

// 审核/派发
const handleAudit = (row, key) => {
    let obj = {
        ...row,
        promotionId: props.activityData.id
    }
    if (key === 'showApplyAudit') {
        obj.ext = state.ext
        obj.answers = JSON.parse(obj.answers)
    }
    emits('showDialog', { key, data: obj })
}

// 批量派发奖励
const handleBatch = () => {
    let { tableListSelection } = state
    if (!tableListSelection.length) {
        return ElMessage.warning($t('请至少选择一条数据再进行操作！'))
    }
    let obj = {
        id: tableListSelection.map(item => item.id).join(','),
        promotionId: props.activityData.id
    }
    emits('showDialog', { key: 'showDistributeAward', data: obj })
}

defineExpose({ fetchData })
</script>

<style lang="scss">
.audit-component {
}
</style>
