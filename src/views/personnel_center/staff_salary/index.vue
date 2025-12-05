<!--
 * @Author: yilaisai
 * @Date: 2025-01-07 19:04:52
 * @LastEditors: yilaisai
 * @LastEditTime: 2025-01-14 12:14:34
-->
<template>
    <!-- 人员工资 -->
    <div class="container staff-salary">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item>
			    <el-date-picker v-model="state.formData.receiveTime" type="daterange" value-format="YYYY-MM-DD" :start-placeholder="$t('开始时间')"
			        :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" />
			</el-form-item>
            <el-form-item>
			    <el-select style="width: 100px" v-model="state.formData.queryType" @change="state.formData.queryVal = ''">
			        <el-option v-for="item in state.metaData.inputTypeList" :key="item.value" :label="item.label" :value="item.value" />
			    </el-select>
			    <div>
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
            <el-form-item>
                <el-button v-if="isPremiss" v-throttle type="primary" @click="handleConfig({})">{{$t('新增')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column prop="nickname" :label="$t('员工名称')" align="center" />
			<el-table-column prop="empId" :label="$t('员工ID')" align="center" />
			<el-table-column prop="total" :label="$t('所得工资')" align="center" />
			<el-table-column prop="to" :label="$t('接收账号')" align="center" />
			<el-table-column prop="status_" :label="$t('状态')" align="center" />
			<el-table-column prop="reward" :label="$t('绩效奖励')" align="center" />
            <el-table-column prop="reward" :label="$t('绩效状态')" align="center">
                <template #default="{row}">
                    {{ !row.reward || row.reward === 0?'-':row.reward>0?$t('积极进取'):$t('警告')}}
                </template>
            </el-table-column>
			<el-table-column prop="updateTime" :label="$t('操作日期')" align="center">
                <template #default="{row}">{{ dateFormat(row.updateTime) }}</template>
            </el-table-column>

			<el-table-column :label="$t('操作人')" align="center">
                <template #default="{row}">{{ row.emp.name }}</template>
            </el-table-column>
			<el-table-column prop="remark" :label="$t('备注')" align="center" />
            <el-table-column :label="$t('操作')" align="center">
                <template #default="{ row }">
                    <el-button v-if="isPremiss" v-throttle type="primary" text @click="handleConfig(row)">{{$t('修改')}}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:page="state.listQuery._page" v-model:limit="state.listQuery._size"
            @pagination="fetchData" />
        <SalaryDeploy v-if="state.SalaryDeployShow" :itemData="state.itemData" @fetchData="fetchData"
            @close="state.SalaryDeployShow = false"></SalaryDeploy>
    </div>
</template>

<script setup name='staffSalary'>
    import { reactive, onMounted, defineAsyncComponent, nextTick, computed } from 'vue'
    import { getShortcuts, disabledCurrentDateAfter, dateFormat } from "@/common/util/index"
    import userStore from '@/store/user'
    import commonStore from '@/store/common'
    import { ElMessageBox } from 'element-plus'
    import { getStaffSalaryList } from '@/api/manage_config'
    const SalaryDeploy = defineAsyncComponent(()=>import('./components/SalaryDeploy.vue'))

    const shortcuts = getShortcuts()
    const state = reactive({
        tableData: [],
        formData: {
            queryType: 1
        },
        total: 0,
        listQuery: {
            _page: 1,
            _size: 10,
        },
        SalaryDeployShow:false,
        itemData: {},
        metaData: {
            inputTypeList: []
        },
    })
    const userData = userStore()
    const commonData = commonStore()

    const fetchData = (val = '')=> {
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
        }
        let { receiveTime } = state.formData
        if (receiveTime && receiveTime.length) {
            params['interval.begin'] = receiveTime[0]
            params["interval.end"] = receiveTime[1]
        }
        if (state.formData.queryType === 1) params['empName'] = state.formData.queryVal
        if (state.formData.queryType === 2) params['empId'] = state.formData.queryVal
        delete params.receiveTime
        delete params.queryType
        delete params.queryVal
        if (val === 'export') params.isExport = true
        globalVBus.$emit('globalLoading', true)
        getStaffSalaryList(params).then(res => {
            let { total, list } = res.data
            state.tableData = list || []
            state.total = total
            globalVBus.$emit('globalLoading', false)
        }).catch(err => {
            state.tableData = []
            globalVBus.$emit('globalLoading', false)
        })
    }

    const handleConfig = (val = {})=> {
        if (!val.id) {
            state.itemData = {}
            state.SalaryDeployShow = true
            return
        } else {
            state.itemData = val
            state.SalaryDeployShow = true
        }
    }

    onMounted(() => {
        state.metaData.inputTypeList = [
            { label: $t('员工名称'), value: 1, placeholder: $t('请输入员工名称') },
            { label: $t('员工ID'), value: 2, placeholder: $t('请输入员工ID') },
        ]
        fetchData()
    })

    const placeholderLabel = computed(() => {
        return state.metaData.inputTypeList.find(item => item.value === state.formData.queryType)?.placeholder || ''
    });

    const isPremiss = computed(() => {
        return userData.isHasPermiss('merchant.emp-salary.addOrEdit')
    })
</script>

<style lang="scss">
    .staff-salary {
        
    }
</style>