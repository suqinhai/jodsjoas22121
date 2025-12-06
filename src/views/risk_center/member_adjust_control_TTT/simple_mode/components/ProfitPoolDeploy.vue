<template>
    <!-- TTT会员调控-数据列表（专业模式）-VIP人数比例配置/自动层级池子配置 -->
    <Dialog ref="dialog" width="1000" :title="controlType === 1 ? $t('VIP人数比例配置'): $t('自动层级池子配置')" top="5vh" :isShowSubmit="false" @cancel="cancel">
        <div class="profit-pool">
            <div class="head2">
                <div class="operate" v-if="state.formData.length">
                    <el-button v-throttle v-if="!state.isDisabled" @click="getData">{{$t('取 消')}}</el-button>
                    <el-button v-throttle type="primary" v-if="!state.isDisabled" @click="handleSubmit(deployFormRef)">{{$t('保 存')}}</el-button>
                    <el-button v-throttle type="primary" v-if="state.isDisabled" @click="state.isDisabled = false">{{$t('修 改')}}</el-button>
                </div>
            </div>

            <el-form ref="deployFormRef" v-if="state.formData.length" :model="state.formData" :disabled="state.isDisabled">
                <el-table :data="state.formData" style="width: 100%" border>
                    <el-table-column fixed="left" width="100" align="center">
                        <template #header>
                            <el-checkbox v-model="state.isAllCheck" :indeterminate="state.isIndeterminate" :true-label="1" :false-label="0"
                                @change="checkAll">{{$t('全选')}}</el-checkbox>
                        </template>
                        <template #default="{ row,$index }">
                            <el-checkbox v-model="row.status" :true-label="1" :false-label="0" @change="checkChange">
                                {{controlType === 1 ? ('VIP' + row.level) : getTitle($index)}}</el-checkbox>
                        </template>
                    </el-table-column>
                    <el-table-column v-for="(item,index) in showData" :key="item" :label="item.label" min-width="120" align="center">
                        <template #default="{ row, $index }">
                            <span
                                v-if="state.isDisabled || row.title">{{row['pool' + index]}}{{controlType === 1 && state.type === 1 ? '%' : ''}}</span>
                            <el-form-item v-if="!state.isDisabled && !row.title" :prop="$index + '.pool' + index" :rules="[
                                { required: true, message: '', trigger: 'blur' }]" label-width="0">
                                <el-input-number v-if="controlType === 1 && state.type === 1" v-model="row['pool' + index]"
                                    style="width: 78%;margin-right: 3px" :controls="false" :precision="2" :placeholder="$t('人数比例')" :min="0" />
                                <el-input-number v-else v-model="row['pool' + index]" style="width: 100%" :controls="false" :precision="2"
                                    :min="controlType === 1 ? 0 : -9999999" :placeholder="controlType === 1 ? $t('额度') : $t('盈利金额')" />
                                {{controlType === 1 && state.type === 1 ? '%' : ''}}
                            </el-form-item>
                        </template>
                    </el-table-column>
                </el-table>
            </el-form>
        </div>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import userStore from '@/store/user'
import { ElMessage } from 'element-plus'
import { getControlPoolConfig, postControlPoolConfig } from '@/api/risk_control'

const emits = defineEmits(['close'])
const props = defineProps({
    metaData: {
        type: Object,
        default: {}
    },
    controlType: {
        default: 0
    }
})
const state = reactive({
    type: 1,
    formData: [],
    levelData: [],
    isDisabled: true,
    isAllCheck: false,
    isIndeterminate: false,
})
const deployFormRef = ref(null)
const dialog = ref(null)
const userData = userStore()

const showData = computed(() => {
    return props.metaData.ctrlLoseType
})

onMounted(() => {
    getData()
})

const getData = () => {
    dialog.value.showLoading()
    getControlPoolConfig({
        type: props.controlType,
        gameProvider: 'TTT'
    }).then(({ code, data }) => {
        if (code === 0 && data) {
            let { config = {} } = data
            let arr = []
            state.levelData = []
            let configData = props.controlType ? config.tiers : config
            let { userLevel } = props.metaData
            for (const key in configData) {
                if (userLevel.some(item => item.value === key)) {
                    state.levelData.push(key)
                    arr.push(configData[key])
                }
            }
            state.formData = arr.map((item, index) => {
                let obj = {
                    level: state.levelData[index],
                }
                item.forEach((its, ims) => {
                    if (ims !== item.length - 1) {
                        obj['pool' + (ims)] = its * 1
                    } else {
                        obj.status = its * 1
                    }
                })
                return obj
            })
            const count = state.formData.filter(item => item.status).length
            state.isAllCheck = count === state.levelData.length ? 1 : 0
            state.isIndeterminate = count > 0 && count < state.levelData.length
        }
        state.isDisabled = true
        dialog.value.closeLoading()
    }).catch(() => {
        dialog.value.closeLoading()
    })
}

const getTitle = (index) => {
    return props.metaData.profitLayer.find(item => +item.value === +state.levelData[index])?.label || ''
}

const checkAll = (val) => {
    state.formData.forEach(item => {
        item.status = val
    })
    state.isIndeterminate = false
};

const checkChange = () => {
    const count = state.formData.filter(item => item.status).length
    state.isAllCheck = count === state.levelData.length
    state.isIndeterminate =
        count > 0 && count < state.levelData.length
}

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            let params = {}
            let obj = {}
            state.levelData.forEach((item, index) => {
                obj[item] = []
                for (const key in state.formData[index]) {
                    if (key.indexOf('pool') >= 0) {
                        obj[item].push(state.formData[index][key])
                    }
                }
                obj[item].push(state.formData[index].status)
            })
            if (props.controlType) {
                params.type = state.type
                params.tiers = obj
            } else {
                params = obj
            }
            dialog.value.showLoading()
            postControlPoolConfig({ value: JSON.stringify(params), type: props.controlType, gameProvider: 'TTT' }).then(() => {
                getData()
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
.profit-pool {
    .head2 {
        display: flex;
        justify-content: right;
        margin: -5px 20px 10px 0;
    }
}
</style>
