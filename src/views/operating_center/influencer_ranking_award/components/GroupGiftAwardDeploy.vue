<template>
    <!-- 运营中心-网红排行榜奖励-网红排行榜数据表格-筛选群体赠送奖励 -->
    <Dialog ref="dialog" width="500" :title="$t('筛选群体赠送奖励')" buttonCenter top="15vh" @confirm="handleSubmit(operateForm)" @cancel="cancel">
        <el-form ref="operateForm" class="group-gift-award-deploy" :rules="state.rules" :model="state.formData" label-width="auto">
            <el-form-item :label="$t('选择站点:')" v-if="commonData.merchantSiteList.length > 1">
                <MerchantSiteSelect isNeedDefault :clearable="false" v-model="state.formData.merchantId">
                </MerchantSiteSelect>
            </el-form-item>
            <el-form-item :label="$t('设置类型:')">
                <el-radio-group v-model="state.formData.way">
                    <el-radio :value="0" :label="0">{{$t('手动赠送')}}</el-radio>
                    <el-radio :value="1" :label="1">{{$t('自动赠送')}}</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item v-if="state.formData.way === 0" :label="$t('日期:')" prop="startTime">
                <el-date-picker style="width: 150px" v-model="state.formData.startTime" type="date" :placeholder="$t('选择日期')"
                    :disabled-date="disabledDate" value-format="YYYY-MM-DD">
                </el-date-picker>
            </el-form-item>
            <el-form-item v-if="state.formData.way === 1" :label="$t('日期范围:')" prop="receiveTime">
                <el-date-picker style="width: 200px" v-model="state.formData.receiveTime" type="daterange" :start-placeholder="$t('开始时间')"
                    :end-placeholder="$t('结束时间')" :shortcuts="shortcuts" value-format="YYYY-MM-DD">
                </el-date-picker>
            </el-form-item>
            <el-form-item :label="$t('排名范围:')">
                <el-input-number v-model="state.formData.rankRange.min" :controls="false" :precision="0" :min="1" :max="1000"
                    :placeholder="$t('输入排名')" @blur="inputBlur('rankRange')" />
                <span class="range-box">{{$t('至')}}</span>
                <el-input-number v-model="state.formData.rankRange.max" :controls="false" :precision="0" :min="1" :max="1000"
                    :placeholder="$t('输入排名')" @blur="inputBlur('rankRange')" />
            </el-form-item>
            <el-form-item v-if="type === 0" :label="$t('人数范围:')">
                <el-input-number v-model="state.formData.numRange.min" :controls="false" :precision="0" :min="1" :max="90000"
                    :placeholder="$t('输入人数')" @blur="inputBlur('numRange')" />
                <span class="range-box">{{$t('至')}}</span>
                <el-input-number v-model="state.formData.numRange.max" :controls="false" :precision="0" :min="1" :max="90000"
                    :placeholder="$t('输入人数')" @blur="inputBlur('numRange')" />
            </el-form-item>
            <el-form-item v-if="type === 1" :label="$t('佣金范围:')">
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
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import commonStore from '@/store/common'
import { bloggerFilterGiveReward } from '@/api/operation'
import { getTimeZoneOffset } from '@/common/util'

const emits = defineEmits(['fetchData', 'close'])
const props = defineProps({
    type: {
        type: Number,
        default: 0,
    },
})
const state = reactive({
    formData: {
        way: 0,
        rankRange: {},
        numRange: {},
        commissionRange: {},
    },
    rules: {
        receiveTime: { required: true, message: $t('必选项不能为空！'), trigger: 'change' },
        startTime: { required: true, message: $t('必选项不能为空！'), trigger: 'change' },
        reward: { required: true, message: $t('请输入奖励金额！'), trigger: 'blur' },
    }
})
const dialog = ref(null)
const operateForm = ref(null)
const commonData = commonStore()

const timeZoneOffset = getTimeZoneOffset()
const disabledDate = (time) => {
    return time.getTime() > Date.now() - 8.64e7 + timeZoneOffset
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
            let { receiveTime, startTime, rankRange, numRange, commissionRange, merchantId, way, reward } = state.formData
            let params = {
                way,
                merchantId,
                type: props.type
            }
            if ((rankRange.min && !rankRange.max) || (!rankRange.min && rankRange.max)) return ElMessage.warning($t('请补全排名范围再进行提交！'))
            let obj = { reward }
            if (rankRange.min) obj.rankRange = rankRange
            if (props.type === 0) {
                if ((numRange.min && !numRange.max) || (!numRange.min && numRange.max)) return ElMessage.warning($t('请补全人数范围再进行提交！'))
                if (!rankRange.min && !rankRange.max && !numRange.min && !numRange.max) return ElMessage.warning($t('排名范围和人数范围必须配置一个！'))
                if (numRange.min) obj.numRange = numRange
            } else {
                if ((commissionRange.min && !commissionRange.max) || (!commissionRange.min && commissionRange.max)) return ElMessage.warning($t('请补全佣金范围再进行提交！'))
                if (!rankRange.min && !rankRange.max && !commissionRange.min && !commissionRange.max) return ElMessage.warning($t('排名范围和佣金范围必须配置一个！'))
                if (commissionRange.min) obj.commissionRange = commissionRange
            }
            params.config = JSON.stringify(obj)
            if (way === 1) {
                params.startTime = receiveTime[0]
                params.endTime = receiveTime[1] + ' 23:59:59'
            } else {
                params.startTime = startTime
                params.startTime = startTime + ' 23:59:59'
            }
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
}
</style>
