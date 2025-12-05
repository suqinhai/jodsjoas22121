<template>
    <!-- 会员调控-数据列表（专业模式）-VIP人数比例配置/自动层级池子配置 -->
    <Dialog ref="dialog" width="1000" :title="type === 1 ? $t('VIP人数比例配置'): $t('自动层级池子配置')" top="5vh" :isShowSubmit="false" @cancel="cancel">
        <div class="profit-pool">
            <div class="head">
                <div class="search">
                    <!-- <div v-if="type === 1">{{$t('控制类型')}}<el-select :disabled="state.isDisabled" style="margin-left: 5px" v-model="state.type"
                            :placeholder="$t('请选择控制类型')">
                            <el-option :label="$t('额度')" :value="0" />
                            <el-option :label="$t('人数比例')" :value="1" />
                        </el-select>
                    </div> -->
                </div>

                <div class="operate" v-if="state.formData.length">
                    <el-button v-throttle v-if="!state.isDisabled" @click="getData">{{$t('取 消')}}</el-button>
                    <el-button v-throttle type="primary" v-if="!state.isDisabled" @click="handleSubmit(deployFormRef)">{{$t('保 存')}}</el-button>
                    <el-button v-throttle type="primary" v-if="state.isDisabled" @click="state.isDisabled = false">{{$t('修 改')}}</el-button>
                </div>
            </div>

            <el-form ref="deployFormRef" v-if="state.formData.length" :model="state.formData" :disabled="state.isDisabled">
                <el-table :data="state.formData" style="width: 100%" border>
                    <el-table-column fixed="left" width="110" align="center">
                        <template #header>
                            <el-checkbox v-model="state.isAllCheck" :indeterminate="state.isIndeterminate" :true-label="1" :false-label="0"
                                @change="checkAll">{{$t('全选')}}</el-checkbox>
                        </template>
                        <template #default="{ row,$index }">
                            <el-checkbox v-model="row.status" :true-label="1" :false-label="0" @change="checkChange">
                                {{type === 1 ? ('VIP' + row.level) : getTitle($index)}}</el-checkbox>
                        </template>
                    </el-table-column>
                    <!-- <el-table-column v-if="isShow" :label="$t('余额最小值限制')" min-width="145" align="center">
                        <template #default="{ row }">
                            <span v-if="state.isDisabled">{{row.min}}</span>
                            <el-input-number v-if="!state.isDisabled" v-model="row.min" style="width: 100%" :controls="false" :precision="0"
                                :placeholder="$t('限制金额')" :min="0" />
                        </template>
                    </el-table-column> -->
                    <el-table-column v-if="isShow" :label="$t('余额最大值限制')" min-width="148" align="center">
                        <template #default="{ row }">
                            <span v-if="state.isDisabled">{{row.max}}</span>
                            <el-input-number v-if="!state.isDisabled" v-model="row.max" style="width: 100%" :controls="false" :precision="0"
                                :placeholder="$t('限制金额')" :min="0" />
                        </template>
                    </el-table-column>
                    <el-table-column v-for="(item,ims) in showData" :key="ims" :label="item.label" min-width="120" align="center">
                        <template #default="{ row, $index }">
                            <span v-if="state.isDisabled || row.title">{{row['pool' + ims]}}{{type === 1 && state.type === 1 ? '%' : ''}}</span>
                            <el-form-item v-if="!state.isDisabled && !row.title" :prop="$index + '.pool' + ims" :rules="[
                                { required: true, message: '', trigger: 'blur' }]" label-width="0">
                                <el-input-number v-if="type === 1 && state.type === 1" v-model="row['pool' + ims]"
                                    style="width: 78%;margin-right: 3px" :controls="false" :precision="2" :placeholder="$t('人数比例')" :min="0" />
                                <el-input-number v-else v-model="row['pool' + ims]" style="width: 100%" :controls="false" :precision="2"
                                    :min="type === 1 ? 0 : -9999999" :placeholder="type === 1 ? $t('额度') : $t('盈利金额')" />
                                {{type === 1 && state.type === 1 ? '%' : ''}}
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
    type: {
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
    return props.metaData.controlTypeList.filter(item => +item.value !== 10)
})
const controlTypeMeta = computed(() => {
    return props.metaData.ctrlPools.filter(item => +item.value !== 10)
})
const isShow = computed(() => {
    return (userData.siteInfo.commissionMode === 2 || (userData.siteInfo.commissionMode === 1 && userData.siteInfo.ctrlWin))
})

onMounted(() => {
    getData()
})

const getData = () => {
    dialog.value.showLoading()
    getControlPoolConfig({
        type: props.type,
        gameProvider: 'PGC'
    }).then(({ code, data }) => {
        if (code === 0 && data) {
            let { config = {} } = data
            let arr = []
            state.levelData = []
            let configData = props.type ? config.tiers : config
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
                        obj['pool' + ims] = its * 1
                    } else {
                        obj.status = its * 1
                    }
                })
                if (isShow.value) {
                    obj.min = config.limits && config.limits[state.levelData[index]] ? config.limits[state.levelData[index]][0] : 0
                    obj.max = config.limits && config.limits[state.levelData[index]] ? config.limits[state.levelData[index]][1] : undefined
                }
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
            let limits = {}
            // let isPass = true
            for (let index = 0; index < state.levelData.length; index++) {
                let { min, max } = state.formData[index]
                let value = state.levelData[index]
                if (isShow.value && typeof max === 'number') {
                    limits[value] = [min || 0, max || 0]
                }
                // if (isShow) {
                // if ((typeof max !== 'number' && typeof min === 'number') ||
                //     (typeof max === 'number' && typeof min !== 'number')) {
                //     ElMessage.warning(`VIP${value}${$t('余额限制配置有误，余额限制最大值和最小值只能都设置或者都不设置！')}`)
                //     isPass = false
                //     break
                // } else if (typeof max === 'number' && typeof min === 'number') {
                // if (max <= min) {
                //     ElMessage.warning(`VIP${value}${$t('余额限制配置有误，余额限制最大值必须大于最小值！')}`)
                //     isPass = false
                //     break
                // } else {
                // limits[value] = [min, max]
                //     }
                // }
                // }
                obj[value] = []
                controlTypeMeta.value.forEach((item, ims) => {
                    obj[value].push(state.formData[index]['pool' + ims])
                })
                // for (const key in state.formData[index]) {
                //     if (key.indexOf('pool') >= 0) {
                //         obj[value].push(state.formData[index][key])
                //     }
                // }
                obj[value].push(state.formData[index].status)
            }
            // if (!isPass) return
            // let limitConfig = {}
            // state.levelData.forEach((item, index) => {
            //     if (isShow && typeof state.formData[index].balanceLimit === 'number') limitConfig[item] = state.formData[index].balanceLimit
            //     obj[item] = []
            //     for (const key in state.formData[index]) {
            //         if (key.indexOf('pool') >= 0) {
            //             obj[item].push(state.formData[index][key])
            //         }
            //     }
            //     obj[item].push(state.formData[index].status)
            // })
            if (props.type) {
                params.type = state.type
                params.tiers = obj
                if (isShow.value && Object.keys(limits).length) params.limits = limits
                // isShow && (params.limitConfig = limitConfig)
            } else {
                params = obj
            }
            dialog.value.showLoading()
            postControlPoolConfig({ value: JSON.stringify(params), type: props.type, gameProvider: 'PGC' }).then(() => {
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
    .head {
        display: flex;
        justify-content: space-between;
        margin: -5px 20px 10px 0;
    }
}
</style>
