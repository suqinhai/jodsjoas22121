<template>
    <!-- 财务中心-会员提现配置-提现设置-免审自动出款 -->
    <Dialog ref="dialog" width="600" :title="$t('免审自动出款')" buttonCenter top="10vh" @confirm="handleSubmit(operateForm)" @cancel="cancel">
        <el-form class="exempt-review" ref="operateForm" :rules="state.rules" :model="state.formData" label-width="auto">
            <el-form-item :label="$t('提现金额:')" prop="exemptAmount">
                ≤
                <el-input-number v-model="state.formData.exemptAmount" style="margin:0 6px;width: 150px" :controls="false" :precision="2" :min="0"
                    :placeholder="$t('请输入提现金额')" />{{$t('免审')}}</el-form-item>
            <el-form-item :label="$t('自动出款通道:')" prop="exemptChannel_">
                <el-select v-model="state.formData.exemptChannel_" :placeholder="$t('请选择自动出款通道')">
                    <el-option v-for="item in state.cashChannel" :key="item.value" :label="item.label" :value="item.label" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('充值次数:')">≥
                <el-input-number v-model="state.formData.rechargeNum" style="margin:0 6px;width: 150px" :controls="false" :precision="0" :min="0"
                    :placeholder="$t('请输入充值次数')" />
            </el-form-item>
            <el-form-item :label="$t('提现次数:')">≥
                <el-input-number v-model="state.formData.cashNum" style="margin:0 6px;width: 150px" :controls="false" :precision="0" :min="0"
                    :placeholder="$t('请输入提现次数')" />
            </el-form-item>
            <el-form-item :label="$t('VIP等级:')">
                <el-checkbox v-model="state.checkAll" :indeterminate="state.isIndeterminate" @change="checkAllLevel">{{$t('全部等级')}}</el-checkbox>
                <el-checkbox-group v-model="state.formData.levels" @change="handleCheckLevel">
                    <el-checkbox v-for="item in userLevel" :key="item.id" :label="item.value">{{item.label}}</el-checkbox>
                </el-checkbox-group>
            </el-form-item>
            <div class="deploy-tips">
                <div>{{$t('说明：')}}</div>
                <div>1、{{$t('充值次数和提现次数只能都配置或者都不配置')}}；</div>
                <div>{{$t('2、若充提次数和VIP等级都有配置，则只需满足一个条件即可出款。')}}</div>
                <div>{{$t('3、免审自动出款审核达到时，但三方通道账号异常，将会转到人工审核。')}}</div>
            </div>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { ref, reactive, onMounted, defineProps } from 'vue'
import { postAuditExemptionConfigData, getWithdrawChannelList } from '@/api/finance'

const emits = defineEmits(['close', 'fetchData'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    },
    userLevel: {
        type: Array,
        default: () => []
    }
})
const dialog = ref(null)
const operateForm = ref(null)
const state = reactive({
    checkAll: false,
    isIndeterminate: false,
    formData: {},
    cashChannel: [],
    rules: {
        exemptAmount: [{ required: true, message: $t('请输入提现金额！'), trigger: 'blur' }],
        exemptChannel_: [{ required: true, message: $t('请选择自动出款通道！'), trigger: 'change' }],
    }
})

onMounted(() => {
    dialog.value.showLoading()
    getWithdrawChannelList({ group: 1 }).then((res) => {
        state.cashChannel = res.data || []
        let { exemptAlias, exemptChannel } = props.itemData
        state.formData = { ...props.itemData }
        let arr = state.cashChannel.filter(item => item.value === exemptChannel)
        exemptAlias && (arr = arr.filter(item => item.alias === exemptAlias))
        if (arr.length) state.formData.exemptChannel_ = arr[0].label
        let configKey = Object.keys(props.itemData)
        if (!configKey.includes('levels') || state.formData.levels === -1) {
            state.formData.levels = props.userLevel.map(item => item.value)
        } else {
            state.formData.levels = state.formData.levels.split(',').filter(item => props.userLevel.some(its => item === its.value))
        }
        const checkLevelCount = state.formData.levels.length
        state.checkAll = checkLevelCount === props.userLevel.length
        state.isIndeterminate = checkLevelCount > 0 && checkLevelCount < props.userLevel.length
        dialog.value.closeLoading()
    }).catch(() => {
        dialog.value.closeLoading()
    })
})

const checkAllLevel = (val) => {
    state.formData.levels = val
        ? props.userLevel.map((item) => item.value)
        : []
    state.isIndeterminate = false
};

const handleCheckLevel = () => {
    const checkedCount = state.formData.levels.length
    state.checkAll = checkedCount === props.userLevel.length
    state.isIndeterminate =
        checkedCount > 0 && checkedCount < props.userLevel.length
}

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            let { exemptAmount, rechargeNum, cashNum, levels, exemptChannel_ } = state.formData
            let obj = state.cashChannel.find(item => item.label === exemptChannel_) || {}
            if ((typeof rechargeNum !== 'number' && typeof cashNum === 'number') || (typeof rechargeNum === 'number' && typeof cashNum !== 'number')) return ElMessage.warning($t('充值次数和提现次数只能都配置或者都不配置') + '！')
            let params = {
                exemptChannel: obj.value || '',
                exemptAmount,
                rechargeNum,
                cashNum,
            }
            params.levels = levels.join(',')
            obj.alias && (params.exemptAlias = obj.alias)
            dialog.value.showLoading()
            postAuditExemptionConfigData(params).then(() => {
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

<style scoped lang="scss">
.deploy-tips {
    color: red;
}
</style>
