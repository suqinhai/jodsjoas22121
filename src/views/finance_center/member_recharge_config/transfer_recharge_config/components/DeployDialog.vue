<template>
    <!-- 财务中心-会员充值配置-转账充值配置-修改 -->
    <Dialog ref="dialog" :width="$locale == 'zh' ? 1000 : 1250" :title="$t('修改')" top="2vh" :isShowSubmit="isCanEdit"
        :operateActions="isCanEdit?[$t('关闭'), $t('提交')]:[$t('关闭')]" @confirm="handleSubmit(deployFormRef)" @cancel="cancel">
        <el-form ref="deployFormRef" class="pay-channel" :disabled="!isCanEdit" :rules="state.rules" :model="state.formData" label-width="auto">
            <el-row>
                <el-col :span="12">
                    <el-form-item :label="$t('通道名称:')">
                        <span>{{state.formData.channel_}}</span>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item :label="$t('支付方式:')">
                        <span>{{state.formData.type}}</span>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item :label="$t('是否启用:')">
                        <el-switch v-model="state.formData.status" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item :label="$t('推荐角标') + ':'" v-if="userData.getTemplateType() === 4">
                        <el-switch v-model="state.formData.icon" :active-value="1" :inactive-value="0" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item :label="$t('排序:')" prop="sort">
                        <el-input-number v-model="state.formData.sort" style="width: 200px" :controls="false" :min="1" :placeholder="$t('请输入排序值')" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item :label="$t('前台通道名称:')" prop="name">
                        <el-input style="width: 200px" :placeholder="$t('请输入前台通道名称')" v-model="state.formData.name" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item :label="$t('最小充值金额:')">
                        <el-input-number v-model="state.formData.minAmount" style="width: 200px" :controls="false" :precision="0" :min="0"
                            :placeholder="$t('请输入最小充值金额')" @blur="inputBblur" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item :label="$t('最大充值金额:')">
                        <el-input-number v-model="state.formData.maxAmount" style="width: 200px" :controls="false" :precision="0" :min="1"
                            :placeholder="$t('请输入最大充值金额')" @blur="inputBblur" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-form-item :label="$t('参与层级:')" prop="fixLayers">
                <el-checkbox v-model="state.isCheckedAll" :indeterminate="state.isIndeterminate" @change="checkAll">{{$t('全部层级')}}</el-checkbox>
                <el-checkbox-group v-model="state.formData.fixLayers" @change="handleCheck">
                    <el-checkbox v-for="item in memberLevel" :key="item.id" :value="item.id + ''" :label="item.id + ''">{{ item.name }}</el-checkbox>
                </el-checkbox-group>
            </el-form-item>
            <el-form-item :label="$t('转账备注开关:')">
                <el-switch v-model="state.formData.transferDTO.remarkOn" :active-value="0" :inactive-value="-1" />
                <span class="tips">{{$t('（开启后，前台显示转账备注输入框）')}}</span>
                <div>
                    <el-radio-group v-model="state.formData.transferDTO.remarkRequired">
                        <el-radio :value="1" :label="1">{{$t('必填')}}</el-radio>
                        <el-radio :value="0" :label="0">{{$t('非必填')}}</el-radio>
                    </el-radio-group>
                </div>
                <div>{{$t('勾选必填后，要求会员强制填写备注，便于核对入款')}}</div>
            </el-form-item>
            <!-- <el-form-item :label="$t('付款人账号:')">
                <el-switch v-model="state.formData.transferDTO.accountOn" :active-value="0" :inactive-value="-1" />
                <span class="tips">{{$t('（开启后，前台显示出付款人账号输入项）')}}</span>
                <div>
                    <el-radio-group v-model="state.formData.transferDTO.accountRequired">
                        <el-radio :value="1" :label="1">{{$t('必填')}}</el-radio>
                        <el-radio :value="0" :label="0">{{$t('非必填')}}</el-radio>
                    </el-radio-group>
                </div>
                <div>{{$t('勾选必填后，要求会员强制填写付款人账号，便于核对入款')}}</div>
            </el-form-item> -->
            <el-form-item :label="$t('上传转账凭证:')">
                <el-switch v-model="state.formData.transferDTO.proofOn" :active-value="0" :inactive-value="-1" />
                <span class="tips">{{$t('（开启后，充值订单详情页显示出“上传转账凭证”输入项，大小不可超过1M）')}}</span>
                <div>
                    <el-radio-group v-model="state.formData.transferDTO.proofRequired">
                        <el-radio :value="1" :label="1">{{$t('必传')}}</el-radio>
                        <el-radio :value="0" :label="0">{{$t('非必传')}}</el-radio>
                    </el-radio-group>
                </div>
                <div>{{$t('勾选必传后，会员必须上传转账凭证图片')}}</div>
            </el-form-item>
            <!-- <el-form-item :label="$t('转账金额随机小数:')">
                <el-switch v-model="state.formData.status" />
                <span class="tips">{{$t('（开启后，系统自动将会员充值金额加上随机小数便于核对入款）')}}</span>
            </el-form-item> -->
            <el-form-item :label="$t('推荐金额配置:')" prop="hasInputAmount">
                <el-radio-group v-model="state.formData.hasInputAmount">
                    <el-radio :value="true" :label="true">{{$t('可输入任意金额')}}</el-radio>
                    <el-radio :value="false" :label="false">{{$t('仅限固定金额')}}</el-radio>
                </el-radio-group>
            </el-form-item>
            <div class="deploy-table-auto">
                <div class="deploy-table">
                    <div class="small-box bg">
                        <div class="amount-box">{{$t('推荐金额')}}</div>
                        <div class="give-box" v-if="userData.getTemplateType() !== 4">{{$t('此推荐金额叠加赠送(选填)')}}</div>
                    </div>
                    <div class="small-box bg">
                        <div class="amount-box">{{$t('推荐金额')}}</div>
                        <div class="give-box" v-if="userData.getTemplateType() !== 4">{{$t('此推荐金额叠加赠送(选填)')}}</div>
                    </div>
                    <div class="small-box bor" v-for="(item,index) in state.formData.products" :key="index">
                        <div class="amount-box">
                            <el-input-number v-model="item.rechargeAmount" :style="{'width': userData.getTemplateType() === 4 ? '200px' : '90%'}"
                                :controls="false" :precision="inputPrecision" :min="0" :placeholder="$t('推荐金额')+(index+1)" />
                        </div>
                        <div class="give-box" v-if="userData.getTemplateType() !== 4">{{$t('比例')}}
                            <el-input-number v-model="item.ratio" style="width: 80px;margin: 0 5px" :controls="false" :precision="2" :min="0"
                                :placeholder="$t('输入比例')" />
                            {{$t('%，额度')}}
                            <el-input-number v-model="item.giftAmount" style="width: 100px;margin: 0 5px" :controls="false" :precision="2" :min="0"
                                :placeholder="$t('输入额度')" />
                        </div>
                    </div>
                </div>
            </div>
            <el-form-item :label="$t('前台提示:')">
                <el-input style="width: 100%" type="textarea" :rows="4" :placeholder="$t('请输入前台温馨提示')" v-model="state.formData.tips" show-word-limit
                    maxlength="500" />
            </el-form-item>
            <el-form-item :label="$t('备注:')">
                <el-input style="width: 100%" type="textarea" :rows="4" :placeholder="$t('请输入后台备注')" v-model="state.formData.desc" />
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import userStore from '@/store/user'
import { deepClone } from '@/common/util'
import { postRecommendedAmountConfig } from '@/api/finance'
import { ElMessage } from 'element-plus'

const emits = defineEmits(['fetchData', 'close'])
const props = defineProps({
    itemData: {
        type: Object,
        default: {}
    },
    memberLevel: {
        type: Array,
        default: () => []
    },
})
const state = reactive({
    formData: {},
    rules: {
        hasInputAmount: [{ required: true, message: $t('请选择充值限制！'), trigger: 'change' }],
        sort: [{ required: true, message: $t('请输入排序值！'), trigger: 'blur' }],
        name: [{ required: true, message: $t('请输入前台通道名称！'), trigger: 'blur' }],
        fixLayers: [{ required: true, message: $t('请选择会员层级！'), trigger: 'change' }],
    },
    isCheckedAll: true,
    isIndeterminate: true,
})
const dialog = ref(null)
const deployFormRef = ref(null)
const userData = userStore()

const isCanEdit = computed(() => {
    return userData.isHasPermiss('admin.user-recharge-config.addOrEdit')
})
const country = computed(() => {
    return userData.merchantInfo.country || ''
})
const inputPrecision = computed(() => {
    return ['VN', 'ID'].includes(country.value) ? 0 : 2
})

onMounted(() => {
    if (typeof props.itemData.channel === 'number') state.formData = { ...props.itemData }
    if (!state.formData.transferDTO) {
        state.formData.transferDTO = {
            remarkOn: -1,
            remarkRequired: 0,
            // accountOn: -1,
            // accountRequired: 0,
            proofOn: -1,
            proofRequired: 0,
        }
    } else {
        let { transferDTO = {} } = state.formData
        state.formData.transferDTO.remarkRequired = 0
        // state.formData.transferDTO.accountRequired = 0
        state.formData.transferDTO.proofRequired = 0
        if (transferDTO.remarkOn === 1) {
            state.formData.transferDTO.remarkOn = 0
            state.formData.transferDTO.remarkRequired = 1
        }
        // if (transferDTO.accountOn === 1) {
        //     state.formData.transferDTO.accountOn = 0
        //     state.formData.transferDTO.accountRequired = 1
        // }
        if (transferDTO.proofOn === 1) {
            state.formData.transferDTO.proofOn = 0
            state.formData.transferDTO.proofRequired = 1
        }
    }

    state.formData.status = props.itemData.status === 0 || !props.itemData.products ? false : true
    if (!state.formData.products) state.formData.products = []
    if (state.formData.products.length < 8) {
        let num = state.formData.products.length
        for (let index = num; index < 8; index++) {
            state.formData.products.push({
                rechargeAmount: undefined,
                ratio: undefined,
                giftAmount: undefined
            })
        }
    }
    if (!state.formData.fixLayers) {
        state.formData.fixLayers = props.memberLevel.map(item => item.id + '')
    } else {
        state.formData.fixLayers = state.formData.fixLayers.split(",").filter(item => props.memberLevel.some(its => its.id === +item))
    }
    const checkLevelCount = state.formData.fixLayers.length
    state.isCheckedAll = checkLevelCount === props.memberLevel.length
    state.isIndeterminate = checkLevelCount > 0 && checkLevelCount < props.memberLevel.length
})

// 选择所有层级
const checkAll = (val) => {
    state.formData.fixLayers = val
        ? props.memberLevel.map(item => item.id + '')
        : []
    state.isIndeterminate = false
}

// 层级勾选变化
const handleCheck = (val) => {
    const checkedCount = val.length
    state.isCheckedAll = checkedCount === props.memberLevel.length
    state.isIndeterminate =
        checkedCount > 0 && checkedCount < props.memberLevel.length
}

const inputBblur = () => {
    let { minAmount, maxAmount } = state.formData
    if (typeof minAmount !== 'number' || typeof maxAmount !== 'number') return
    if (minAmount > maxAmount) {
        state.formData.maxAmount = minAmount
    }
}

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            let params = deepClone(state.formData)
            let { products, fixLayers, transferDTO } = params
            if (products.every(item => !item.rechargeAmount)) {
                return ElMessage.warning($t('推荐金额至少配置一个！'))
            }
            let arr = products.filter(item => !!item.rechargeAmount)
            let isRepeat = false
            arr.forEach(item => {
                let num = -1
                arr.forEach(its => {
                    if (item.rechargeAmount === its.rechargeAmount) {
                        num++
                    }
                })
                if (num) {
                    isRepeat = true
                }
            })
            if (isRepeat) {
                return ElMessage.warning($t('推荐金额不允许存在重复！'))
            }

            params.fixLayers = fixLayers.join(',')
            params.products = arr
            params.status = params.status ? 1 : 0
            if (transferDTO.remarkRequired && !transferDTO.remarkOn) transferDTO.remarkOn = 1
            // if (transferDTO.accountRequired && !transferDTO.accountOn) transferDTO.accountOn = 1
            if (transferDTO.proofRequired && !transferDTO.proofOn) transferDTO.proofOn = 1
            if (state.isCheckedAll) delete params.fixLayers
            params.transferDTO = {
                remarkOn: transferDTO.remarkOn,
                // accountOn: transferDTO.accountOn,
                proofOn: transferDTO.proofOn,
            }
            dialog.value.showLoading()
            postRecommendedAmountConfig(params).then(() => {
                cancel()
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
.pay-channel {
    .deploy-table-auto {
        overflow: hidden;
        overflow-x: auto;
    }
    .deploy-table {
        display: flex;
        flex-wrap: wrap;
        border: 1px solid #ddd;
        width: 100%;
        margin-bottom: 20px;
        .bg {
            background-color: #ccc;
            height: 40px !important;
            align-items: center;
            text-align: center;
            line-height: 1;
        }
        .bor {
            border-top: 1px solid #ddd;
        }
        .small-box {
            width: 50%;
            height: 50px;
            display: flex;
            .amount-box {
                flex: 2;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0 5px;
            }
            .give-box {
                flex: 5;
                display: flex;
                align-items: center;
                justify-content: center;
                border-left: 1px solid #ddd;
                padding: 0 5px;
            }
        }
        .small-box:nth-of-type(2n-1) {
            border-right: 1px solid #ddd;
        }
    }
    .tips {
        padding-left: 5px;
        // transform: translateY(10px);
        position: relative;
        top: 2px;
    }
}
</style>
