<template>
    <!-- 人事工资列表 -新增/修改 -->
    <Dialog ref="dialog" width="600" className="custom-dialog deployDialog" :title="state.title" top="10vh" buttonCenter @confirm="handleSubmit" @cancel="cancel">
        <el-form ref="deployForm" :rules="state.rules" :model="state.formData" label-width="auto">
           <el-form-item label-width="180px" v-if="!props.itemData.id">
                <template #label>
                    <el-select v-model="state.formData.type">
                        <el-option v-for="item in typeList" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                </template>
                <div style="display: flex;">
                    <el-select
                        v-model="state.formData.empId"
                        filterable
                        remote
                        :placeholder="$t('请输入搜索')"
                        reserve-keyword
                        :remote-method="remoteMethod"
                        :loading="loading"
                        @change="handleChange"
                    >
                        <el-option
                            v-for="item in options"
                            :key="item.id"
                            :label="item.nickname"
                            :value="item.id"
                        />
                    </el-select>
                </div>
           </el-form-item>
           <el-form-item label-width="0" >
                <div style="display: flex;justify-content: space-between;">
                    <div class="userName" style="flex:1;">
                        <span>{{ $t('员工账号') + '：'}} </span>
                        <span>{{ state.formData.name || '' }}</span>
                    </div>
                    <div class="userId" style="flex:1;">
                        <span>{{ $t('员工ID') + '：'}}</span>
                        <span>{{ state.formData.empId || '' }}</span>
                    </div>
                </div>
           </el-form-item>
           <el-form-item :label="$t('录入工资') + '：'">
                <el-input-number v-model="state.formData.salary" :controls="false" :precision="0" :min="1" :max="100000" />
           </el-form-item>
           <el-form-item :label="$t('绩效奖励') + '：'">
                <div style="display: flex;">
                    <el-select v-model="state.formData.performanceType" style="flex:1;">
                        <el-option v-for="item in performanceList" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                    <el-input-number v-model="state.formData.reward" :placeholder="$t('请输入金额！')" :controls="false" :precision="2" :min="0" :max="100000" style="flex:1;margin-left:10px;" v-if="state.formData.performanceType !== 1"  />
                </div>
           </el-form-item>
           <el-form-item :label="$t('所得工资') + '：'">
                <span>{{sum}}</span>
           </el-form-item>
           <el-form-item :label="$t('状态') + '：'">
                <el-radio v-model="state.formData.status" :label="0">{{$t('发放')}}</el-radio>
                <el-radio v-model="state.formData.status" :label="1">{{$t('拖欠')}}</el-radio>
           </el-form-item>
           <el-form-item :label="$t('备注信息') + '：'">
                <el-input type="textarea" v-model="state.formData.remark"></el-input>
           </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import commonStore from '@/store/common'
import { getAccountList, getStaffDetail, postSalaryAddOrEdit } from '@/api/manage_config'
import { PASSWORD_REG } from '@/common/util/appConfig'
import {sub, add} from '@/common/util'
import { isArguments } from 'lodash'

const emits = defineEmits(['close', 'fetchData'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        },
    }
})

const commonData = commonStore()
const dialog = ref(null)
const deployForm = ref(null)
const typeList = reactive([{value:1,label:$t('员工账号')},{value:2,label:$t('员工ID')}])
const performanceList = reactive([{value:1,label:$t('无')},{value:2,label:$t('奖励')},{value:3,label:$t('处罚')}])
const state = reactive({
    formData: {

    },
    title: $t('新增人员工资')
})
const options = ref([])
const loading = ref(false)

const sum = computed(()=> {
    let totalSalary = 0
    if (state.formData.performanceType === 1) {
        totalSalary = state.formData.salary
    } else if (state.formData.performanceType === 2) {
        totalSalary = state.formData.reward?add(state.formData.salary || 0, state.formData.reward ):state.formData.salary
    } else if (state.formData.performanceType === 3 ) {
        totalSalary = state.formData.reward?sub(state.formData.salary || 0, state.formData.reward ):state.formData.salary
    }
    return totalSalary
})

const handleChange =(val)=> {
    state.formData.empId = val
    state.formData.name = options.value.find(item => item.id === val)?.username
}

onMounted(() => {
    state.formData = { ...props.itemData }
    state.title = $t('新增人员工资')
    if (props.itemData.id) {
        state.title = $t('修改人员工资')
        state.formData.performanceType = state.formData.reward>0?2:state.formData.reward<0?3:1
        if (state.formData.reward < 0) state.formData.reward = Math.abs(state.formData.reward)
    } else {
        state.formData.type = 1
        state.formData.performanceType = 1
        state.formData.status = 0
    }
})


const handleSubmit = () => {
    if (!state.formData.empId || !state.formData.salary) return ElMessage.warning($t('请完善表单内容再进行提交！'))
    const  {reward, empId, remark, status, salary, id } = state.formData
    let params = {
        empId,
        salary,
        reward,
        status,
        remark,
        id
    }
    if (state.formData.performanceType === 3) params.reward = -params.reward
    dialog.value.showLoading()
    postSalaryAddOrEdit(params).then(res => {
        if (res.status === 'OK') {
            cancel()
            emits('fetchData')
        }
    }).catch(()=>{
        dialog.value.closeLoading()
    })
}

const remoteMethod = (query)=> {
    if (query) {
        loading.value = true
        if (state.formData.type === 1) {
            getAccountList({username:query}).then(res => {
                if (res.status === 'OK') {
                    options.value = res.data.list
                    loading.value = false
                }
            })
        } else {
            getStaffDetail({id:query}).then(res => {
                if (res.status === 'OK' && res.data) {
                    options.value = [res.data]
                    loading.value = false
                } else {
                    options.value = []
                }
            })
        }
    } else {
        options.value = []
    }
}



const cancel = () => {
    emits('close')
}

</script>

<style scoped lang="scss">
.red {
    color: red;
    margin-left: 8px;
}
.deployDialog {
    .el-select ::v-deep  .el-input__wrapper {
        width: 100%;
    }
}
</style>
