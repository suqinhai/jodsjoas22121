<template>
    <!-- 任务中心-任务规则 -->
    <Dialog ref="dialog" :width="(type === 0 ? ($locale == 'en' ? 850 : 620) + 500 : 500)" :title="dialogTitle" top="10vh"
        @confirm="handleSubmit(deployFormRef)" @cancel="cancel" :styleCustom="{'flex-direction': 'row'}">
        <el-form class="rule-deploy" ref="deployFormRef" :model="state.formData" :rules="state.rules"
            :label-width="$locale == 'zh' ? '102px' : '160px'">
            <!-- <el-form-item :label="$t('前端规则说明:')" v-if="type !== 3" prop="explain">
                <Tinymce v-model="state.formData.explain" height="300px"></Tinymce>
            </el-form-item> -->
            <!-- <el-form-item :label="$t('领取方式:')">{{$t('手动领取（默认）')}}<el-radio-group v-model="state.formData.type">
                    <el-radio :value="1" :label="1">{{$t('手动领取（默认）')}}</el-radio>
                    <el-radio :value="2" :label="2">{{$t('直接到账')}}</el-radio>
                </el-radio-group>
            </el-form-item> -->
            <el-form-item :label="$t('循环方式:')" v-if="type === 3">
                <el-radio-group v-model="state.formData.mode">
                    <el-radio v-for="item in metaData.taskCycleMode" :key="item.value" :value="+item.value" :label="+item.value">{{item.label}}
                    </el-radio>
                </el-radio-group>
            </el-form-item>
            <!-- <el-form-item :label="$t('重复循环开宝箱:')" v-if="type === 3">
                <el-switch v-model="state.formData.extend" />
            </el-form-item> -->
            <el-form-item :label="$t('稽核倍数:')" prop="auditFactor">
                <el-input-number v-model="state.formData.auditFactor" style="width: 200px" :controls="false" :precision="2" :min="1"
                    :placeholder="$t('请输入稽核倍数')" />
            </el-form-item>
            <el-form-item :label="$t('是否启用:')" v-if="type !== 3">
                <el-switch v-model="state.formData.status" :active-value="1" :inactive-value="0" />
            </el-form-item>
            <template v-if="type === 0">
                <div style="display: flex">
                    <el-form-item :label="$t('任务时长:')">
                        <el-radio-group v-model="state.formData.timeType">
                            <el-radio :value="0" :label="0">{{$t('长期')}}</el-radio>
                            <el-radio :value="1" :label="1" class="radio-box">{{$t('限时')}}
                                <el-form-item class="items-box" label-width="0px" prop="period"
                                    :rules="[{required: state.formData.timeType === 1, message: $t('请输入限时天数！'), trigger: 'blur'}]">
                                    <el-input-number :disabled="state.formData.timeType !== 1" v-model="state.formData.period"
                                        style="width: 100px;margin: 0 5px" :controls="false" :precision="0" :min="1" placeholder="1-9999" />
                                    {{$t('天（从注册当天开始计算）')}}</el-form-item>
                            </el-radio>
                        </el-radio-group>
                    </el-form-item>

                </div>
                <el-form-item :label="$t('首页弹窗提示:')">
                    <el-switch v-model="state.formData.popup" />
                </el-form-item>
                <div class="explain-box">
                    {{$t('注意:注册任务不会触发运营风险设置,为单独配置。')}}
                </div>
                <!-- <el-form-item :label="$t('更多限制:')" v-if="state.formData.limitsShow">
                    <el-checkbox-group v-model="state.formData.limits" :disabled="state.formData.limitsShow">
                        <el-checkbox v-for="item in metaData.taskRewardLimit" :key="item.value" :label="+item.value">
                            {{ item.label }}</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
                <el-form-item :label="$t('领取入口:')" prop="clients" v-if="state.formData.clientsShow">
                    <el-checkbox-group v-model="state.formData.clients" :disabled="state.formData.clientsShow">
                        <el-checkbox label="WAP">H5</el-checkbox>
                        <el-checkbox label="Android">Android-App</el-checkbox>
                        <el-checkbox label="iOS">iOS-App</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
                <el-form-item :label="$t('参与层级:')" prop="layerIds" v-if="state.formData.layerIdsShow">
                    <el-checkbox :disabled="state.formData.layerIdsShow" v-model="state.isCheckedAll" :indeterminate="state.isIndeterminate" @change="checkAll">{{$t('全部层级')}}</el-checkbox>
                    <el-checkbox-group v-model="state.formData.layerIds" @change="handleCheck" :disabled="state.formData.layerIdsShow">
                        <el-checkbox v-for="item in metaData.memberLevel" :key="item.id" :label="item.id">{{ item.name }}</el-checkbox>
                    </el-checkbox-group>
                    <div>{{$t('说明：不勾选参与层级就不展示，且可领奖的任务也不可显示。')}}</div>
                </el-form-item> -->
            </template>
        </el-form>
        <ContentEdit v-if="type === 0" :itemData="{type:1, condition: 0}" :styleCustom="{width:'500px'}"></ContentEdit>
    </Dialog>
</template>

<script setup>
import { postTaskBasicsConfig } from '@/api/discounts_center'
import { ref, reactive, onMounted, defineAsyncComponent } from 'vue'
import { deepClone } from '@/common/util'

const ContentEdit = defineAsyncComponent(() => import("@/views/operating_center/operation_risk_set/components/contentEdit.vue"));

const emits = defineEmits(['close', 'refreshData'])
const props = defineProps({
    type: {
        type: [String, Number],
        default: 0
    },
    dialogTitle: {
        type: String,
        default: ''
    },
    metaData: {
        type: Object,
        default: () => {
            return {}
        }
    },
    basicsData: {
        type: Object,
        default: () => {
            return {}
        }
    }
})
const state = reactive({
    formData: {
        status: 0,
        popup: false,
    },
    rules: {
        // explain: [
        //     { required: true, message: $t('请输入前端规则说明！'), trigger: 'blur' },
        // ],
        auditFactor: { required: true, message: $t('请输入稽核倍数！'), trigger: 'blur' },
        clients: { required: true, message: $t('请选择领取入口！'), trigger: 'change' },
        layerIds: { required: true, message: $t('请选择参与层级！'), trigger: 'change' },
    },
    isCheckedAll: false,
    isIndeterminate: false,
})
const deployFormRef = ref(null)
const dialog = ref(null)

onMounted(() => {
    let { memberLevel = [], taskRewardLimit = [] } = props.metaData
    state.formData = Object.assign(state.formData, props.basicsData)
    if (props.type === 0) {
        // let { layerIds, clients, limits } = state.formData
        if (state.formData.period) {
            state.formData.timeType = 1
        } else {
            state.formData.timeType = 0
            state.formData.period = undefined
        }
        // if (!limits && !layerIds) state.formData.limits = taskRewardLimit.map(item => +item.value)
        // if (!clients || !clients.length) state.formData.clients = ['WAP', 'Android', 'iOS']
        // if (!layerIds || !layerIds.length) state.formData.layerIds = memberLevel.map(item => item.id)
        if (state.formData.layerIds) {
            const checkLevelCount = state.formData.layerIds.length
            state.isCheckedAll = checkLevelCount === memberLevel.length
            state.isIndeterminate = checkLevelCount > 0 && checkLevelCount < memberLevel.length
        }
    }
    if (props.type === 3) state.formData.status = 1
    state.formData.limitsShow = !!deepClone(state.formData.limits)?.length
    state.formData.clientsShow = !!deepClone(state.formData.clients)?.length
    state.formData.layerIdsShow = !!deepClone(state.formData.layerIds)?.length
})

// 选择所有层级
const checkAll = (val) => {
    state.formData.layerIds = val
        ? props.metaData.memberLevel.map(item => item.id)
        : []
    state.isIndeterminate = false
}

// 层级勾选变化
const handleCheck = (val) => {
    const checkedCount = val.length
    state.isCheckedAll = checkedCount === props.metaData.memberLevel.length
    state.isIndeterminate =
        checkedCount > 0 && checkedCount < props.metaData.memberLevel.length
}

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            let params = { ...state.formData }
            if (props.type === 0) {
                if (!params.timeType) params.period = 0
                delete params.timeType
            }
            let { status, id } = params
            params.extend = false
            delete params.id
            delete params.status
            delete params.mode_
            let obj = {
                type: props.type,
                base: JSON.stringify(params),
                status: status,
                id: id,
            }
            // if (props.type === 3) {
            //     obj.extend = false
            // }
            dialog.value.showLoading()
            postTaskBasicsConfig(obj).then(() => {
                cancel()
                emits('refreshData')
            }).catch(() => {
                dialog.value.closeLoading()
            })
        } else {
            ElMessage.warning($t('请完善表单内容再进行提交！'))
        }
    })
}

const cancel = () => {
    emits('close')
}
</script>

<style lang="scss">
.rule-deploy {
    .radio-box .el-radio__label {
        display: flex;
        .items-box {
            .el-form-item__label {
                display: none;
            }
        }
    }
    .explain-box {
        color: red;
    }
}
</style>
