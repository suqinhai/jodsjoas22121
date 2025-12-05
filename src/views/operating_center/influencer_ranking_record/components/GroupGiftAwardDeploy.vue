<template>
    <!-- 运营中心-网红排行榜记录-每日自动赠送记录-修改 -->
    <Dialog ref="dialog" width="500" :title="$t('筛选群体赠送奖励')" buttonCenter top="15vh" @confirm="handleSubmit(operateForm)" @cancel="cancel">
        <el-form ref="operateForm" class="group-gift-award-deploy" :rules="state.rules" :model="state.formData" label-width="auto">
            <el-form-item class="time-box" :label="$t('日期范围:')">
                <el-form-item prop="startTime" label-width="0">
                    <el-date-picker :disabled="state.isDisabled" v-model="state.formData.startTime" type="date" :clearable="false"
                        value-format="YYYY-MM-DD" :disabled-date="disabledDate" :placeholder="$t('开始时间')">
                    </el-date-picker>
                </el-form-item>
                <span class="stance">{{$t('至')}}</span>
                <el-form-item prop="endTime" label-width="0">
                    <el-date-picker v-model="state.formData.endTime" type="date" value-format="YYYY-MM-DD" :clearable="false"
                        :disabled-date="disabledDate" :placeholder="$t('结束时间')">
                    </el-date-picker>
                </el-form-item>
            </el-form-item>
            <el-form-item :label="$t('排名范围:')">
                <el-input-number v-model="state.formData.rankRange.min" :controls="false" :precision="0" :min="1" :max="1000"
                    :placeholder="$t('输入排名')" @blur="inputBlur('rankRange')" />
                <span class="range-box">{{$t('至')}}</span>
                <el-input-number v-model="state.formData.rankRange.max" :controls="false" :precision="0" :min="1" :max="1000"
                    :placeholder="$t('输入排名')" @blur="inputBlur('rankRange')" />
            </el-form-item>
            <el-form-item v-if="itemData.rankType === 0" :label="$t('人数范围:')">
                <el-input-number v-model="state.formData.numRange.min" :controls="false" :precision="0" :min="1" :max="90000"
                    :placeholder="$t('输入人数')" @blur="inputBlur('numRange')" />
                <span class="range-box">{{$t('至')}}</span>
                <el-input-number v-model="state.formData.numRange.max" :controls="false" :precision="0" :min="1" :max="90000"
                    :placeholder="$t('输入人数')" @blur="inputBlur('numRange')" />
            </el-form-item>
            <el-form-item v-if="itemData.rankType === 1" :label="$t('佣金范围:')">
                <el-input-number v-model="state.formData.commissionRange.min" :controls="false" :precision="0" :min="1" :max="9000000"
                    :placeholder="$t('输入金额')" @blur="inputBlur('commissionRange')" />
                <span class="range-box">{{$t('至')}}</span>
                <el-input-number v-model="state.formData.commissionRange.max" :controls="false" :precision="0" :min="1" :max="9000000"
                    :placeholder="$t('输入金额')" @blur="inputBlur('commissionRange')" />
            </el-form-item>
            <el-form-item :label="$t('奖励金额:')" prop="reward">
                <el-input-number v-model="state.formData.reward" :controls="false" :precision="2" :min="0" :max="99999999"
                    :placeholder="$t('请输入奖励金额')" />
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { bloggerFilterGiveReward } from '@/api/operation'
import { getTimeZoneOffset, dateFormat } from '@/common/util'

const emits = defineEmits(['fetchData', 'close'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    },
})
const state = reactive({
    formData: {},
    rules: {
        startTime: { required: true, message: $t('必选项不能为空！'), trigger: 'change' },
        endTime: { required: true, message: $t('必选项不能为空！'), trigger: 'change' },
        reward: { required: true, message: $t('请输入奖励金额！'), trigger: 'blur' },
    },
    isDisabled: false
})
const dialog = ref(null)
const operateForm = ref(null)
const timeZoneOffset = getTimeZoneOffset()

onMounted(() => {
    let { dateRange, config, startTime, endTime } = props.itemData
    state.formData = {
        startTime: startTime.substring(0, 10),
        endTime: endTime.substring(0, 10),
        rankRange: config.rankRange ? { ...config.rankRange } : {},
        numRange: config.numRange ? { ...config.numRange } : '',
        commissionRange: config.commissionRange ? { ...config.commissionRange } : '',
        reward: config.reward
    }
    let nowTime = new Date(dateFormat(Date.now())).getTime()
    state.isDisabled = new Date(dateRange[0]).getTime() <= nowTime
})

const disabledDate = (time) => {
    return time.getTime() < Date.now() + timeZoneOffset - 8.64e7
}

const inputBlur = (key) => {
    let obj = state.formData[key]
    if (typeof obj.min !== 'number' || typeof obj.max !== 'number') return
    if (obj.min > obj.max) {
        state.formData[key].max = min
    }
}

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            let { endTime, startTime, rankRange, numRange, commissionRange, reward } = state.formData
            let params = {
                merchantId: props.itemData.merchantId,
                id: props.itemData.id,
                type: props.itemData.rankType,
                way: 1,
                startTime,
                endTime,
            }
            if (new Date(startTime).getTime() >= new Date(endTime).getTime()) return ElMessage.warning($t('日期范围结束时间必须晚于日期范围开始时间！'))
            if ((rankRange.min && !rankRange.max) || (!rankRange.min && rankRange.max)) return ElMessage.warning($t('请补全排名范围再进行提交！'))
            let obj = { reward }
            if (rankRange.min) obj.rankRange = rankRange
            if (props.itemData.rankType === 0) {
                if ((numRange.min && !numRange.max) || (!numRange.min && numRange.max)) return ElMessage.warning($t('请补全人数范围再进行提交！'))
                if (!rankRange.min && !rankRange.max && !numRange.min && !numRange.max) return ElMessage.warning($t('排名范围和人数范围必须配置一个！'))
                if (numRange.min) obj.numRange = numRange
            } else {
                if ((commissionRange.min && !commissionRange.max) || (!commissionRange.min && commissionRange.max)) return ElMessage.warning($t('请补全佣金范围再进行提交！'))
                if (!rankRange.min && !rankRange.max && !commissionRange.min && !commissionRange.max) return ElMessage.warning($t('排名范围和佣金范围必须配置一个！'))
                if (commissionRange.min) obj.commissionRange = commissionRange
            }
            params.config = JSON.stringify(obj)
            dialog.value.showLoading()
            bloggerFilterGiveReward(params).then(() => {
                emits('close')
                emits('fetchData')
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
.group-gift-award-deploy {
    .el-input-number {
        width: 120px;
    }
    .range-box {
        margin: 0 5px;
    }
    .time-box {
        > .el-form-item__content {
            display: flex;

            .el-form-item {
                width: 150px;
                .el-date-editor {
                    width: 150px;
                }
            }

            .stance {
                padding: 0 5px;
            }
        }
    }
}
</style>
