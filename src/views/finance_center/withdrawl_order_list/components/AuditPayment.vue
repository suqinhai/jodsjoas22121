<template>
    <!-- 财务中心-在线提现列表-复审/拒绝/强制关闭 -->
    <Dialog ref="dialog" width="720" :title="state.title" top="10vh" buttonCenter @confirm="handleSubmit(operateForm)" @cancel="cancel">
        <el-form ref="operateForm" :rules="state.rules" :model="state.formData" label-width="auto">
            <el-form-item :label="$t('出款方式:')" v-if="(itemData.popupType === 0 && isPh && itemData.cashType !== 1 && !!itemData.channelType)">
                <el-radio-group v-model="state.formData.cashType">
                    <el-radio :value="1" :label="1">{{$t('全部出款')}}</el-radio>
                    <el-radio :value="2" :label="2">{{$t('分卡出款')}}
                        <el-tooltip class="box-item" effect="dark">
                            <template #content>
                                <div
                                    v-html="$t('可增加多个代付出款，提交时需要校对，提现总额需等于本次提现金额；<br/>最大可增加5个提现通道；<br/>可增加多个代付出款，提交时需要校对，提现总额需等于本次提现金额；<br/>会员实际到账将根据不同通道方出款额度，出现多次到账；<br/>若分两笔有一笔成功，一笔失败的话，失败的部分退回用户余额，提现订单的金额修改为提现成功的金额')">
                                </div>
                            </template>
                            <el-icon>
                                <QuestionFilled />
                            </el-icon>
                        </el-tooltip>
                    </el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item :label="$t('本次提现金额:')" v-if="itemData.popupType < 1">
                <span>{{ itemData.amount }}</span>
            </el-form-item>
            <template v-if="itemData.popupType === 0 && isPh && state.formData.cashType === 2">
                <div v-for="(item, index) in state.formData.channels" :key="index">
                    <el-row>
                        <el-col :span="11">
                            <el-form-item :label="$t('支付通道:')" :prop="'channels.' + index + '.channelLabel'"
                                :rules="{ required: true, message: $t('请选择支付通道！'), trigger: 'change' }"
                                v-if="!!itemData.channelType && itemData.popupType < 1">
                                <el-select v-model="item.channelLabel" :placeholder="$t('请选择支付通道')" filterable @change="changeChannel(item, index)">
                                    <el-option v-for="item in state.channelList" :key="item.value" :label="item.label" :value="item.label" />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="11">
                            <el-form-item :label="$t('提现额度')">
                                <el-input-number v-model="item.channelAmount" :controls="false" :precision="2" :placeholder="$t('请输入金额！')" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="2" style="height: 32px;display: flex;align-items: center;justify-content: flex-end;">
                            <el-icon v-if="state.formData.channels.length < 5 && index === state.formData.channels.length - 1"
                                @click="handleAddChannel(index)" style="cursor: pointer;">
                                <Plus />
                            </el-icon>
                            <el-icon v-if="!(index === 0 && state.formData.channels.length === 1)" @click="handleDeleteChannel(index)"
                                style="cursor: pointer;margin-left:10px;">
                                <Minus />
                            </el-icon>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-form-item :label="$t('通道余额:')" v-if="!!itemData.channelType  && itemData.popupType < 1 && state.formData.channel !== -1"
                            style="margin-bottom:0;">
                            {{ item.balance }}
                        </el-form-item>
                    </el-row>
                    <el-row v-if="!!itemData.channelType  && itemData.popupType < 1 && state.formData.channel !== -1">
                        <el-col :span="12">
                            <el-form-item :label="$t('最低限额:')">
                                {{ item.minCash }}
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item :label="$t('最高限额:')">
                                {{ item.maxCash }}
                            </el-form-item>
                        </el-col>
                    </el-row>
                </div>
            </template>
            <template v-else>
                <el-form-item :label="$t('支付通道:')" prop="channelLabel" v-if="itemData.popupType < 1">
                    <el-select v-model="state.formData.channelLabel" :placeholder="$t('请选择支付通道')" filterable>
                        <el-option v-for="item in state.channelList" :key="item.value" :label="item.label" :value="item.label" />
                    </el-select>
                </el-form-item>
                <el-form-item :label="$t('通道余额:')" v-if="itemData.popupType < 1 && state.formData.channel !== -1">
                    {{ channelData.balance }}
                </el-form-item>
                <el-row v-if="itemData.popupType < 1 && state.formData.channel !== -1">
                    <el-col :span="12">
                        <el-form-item :label="$t('最低限额:')">
                            {{ channelData.minCash }}
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item :label="$t('最高限额:')">
                            {{ channelData.maxCash }}
                        </el-form-item>
                    </el-col>
                </el-row>
            </template>

            <el-form-item :label="$t('出款额度:')" v-if="typeof itemData.agentCashAmount === 'number' && itemData.popupType < 1">
                {{ itemData.agentCashAmount }}
            </el-form-item>
            <el-form-item :label="$t('区块链哈希值:')" prop="tradeNo" v-if="!itemData.channelType && itemData.popupType < 1 && channelData.asUsdt">
                <el-input style="width: 100%" v-model="state.formData.tradeNo" :placeholder="$t('请输入区块链哈希值')" />
            </el-form-item>
            <el-form-item v-if="itemData.popupType === 1">
                <el-radio-group v-model="state.refuseType">
                    <el-radio :value="1" :label="1">{{$t('退款')}}</el-radio>
                    <el-radio :value="2" :label="2">{{$t('拒绝退款')}}</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item :label="$t('备注:')" prop="remark" :rules="{ required: itemData.popupType >= 1, message: $t('请输入备注！'), trigger: 'blur' }">
                <el-input style="width: 100%" type="textarea" :rows="4" :placeholder="$t('请输入备注')" v-model="state.formData.remark" show-word-limit
                    maxlength="255" />
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import commonStore from '@/store/common'
import userStore from '@/store/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { postAgainVerify, getChannelInfo, postCloseOrder, postForceApply } from '@/api/finance'
import { add } from '@/common/util'

const emits = defineEmits(['fetchData', 'close'])
const props = defineProps({
    itemData: {
        type: Object,
        default: {}
    },
})
const dialog = ref(null)
const operateForm = ref(null)
const state = reactive({
    title: $t('复审-USDT人工出款'),
    formData: {
    },
    rules: {
        channelLabel: { required: true, message: $t('请选择支付通道！'), trigger: 'change' },
        tradeNo: { required: true, message: $t('请输入区块链哈希值！'), trigger: 'blur' },
    },
    refuseType: 1
})
const commonData = commonStore()
const userData = userStore()

const channelData = computed(() => {
    return state.formData.channelLabel ? state.channelList.find(item => item.label === state.formData.channelLabel) : {}
})

const isPh = computed(() => {
    return userData.merchantInfo.country === 'PH'
})

const country = computed(() => {
    return userData.merchantInfo.country
})

onMounted(async () => {
    let { id, ids, channelType, popupType, merchantId, subtype } = props.itemData
    state.formData = { id, ids, merchantId, cashType: 1, channels: [], channelLabel: '' }
    if (ids && popupType === 1) state.formData.merchantId = commonData.currentMerchantSite.id
    // popupType: -1:强制出款, 0:复审, 1:拒绝, 2:强制关闭
    if (popupType === 1) {
        state.title = $t('审核拒绝')
    } else if (popupType === 2) {
        state.title = $t('强制关闭')
    } else {
        state.formData.status = 1
        if (!channelType) state.formData.channel = 1
        if (!!channelType) {
            state.title = popupType === -1 ? $t('强制出款') : $t('复审-人工出款')
        }
        await getChannelData(channelType, subtype)
        if (props.itemData.channel_) state.formData.channelLabel = props.itemData.channel_
    }
    state.formData.channels.push({
        channelLabel: '',
        channelAmount: 0,
        minCash: '',
        maxCash: '',
        balance: ''
    })
})


const handleAddChannel = () => {
    state.formData.channels.push({
        channelLabel: '',
        channelAmount: 0,
        channel: '',
        minCash: '',
        maxCash: '',
        balance: ''
    })
}

const handleDeleteChannel = (index) => {
    state.formData.channels.splice(index, 1)
}

const changeChannel = (item) => {
    let currentChannel = state.channelList.find(v => v.label === item.channelLabel)
    let { maxCash, minCash, balance, value } = currentChannel
    item.maxCash = maxCash
    item.minCash = minCash
    item.balance = balance
    item.channel = value
}

const getChannelData = async (group, payCode) => {
    dialog.value.showLoading()
    await getChannelInfo({ group, payCode, merchantId: props.itemData.merchantId }).then(res => {
        if (res.data) {
            state.channelList = res.data || []
            !!props.itemData.channelType && state.channelList.unshift({
                label: $t('线下交易'),
                value: -1
            })
        }
        dialog.value.closeLoading()
    }).catch(err => {
        dialog.value.closeLoading()
    })
}

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            if (props.itemData.popupType === -1) return postForceOperate()
            if (!!props.itemData.popupType) {
                let text = $t('请先进行三方状态查询，再确定是否关闭！')
                if (props.itemData.popupType === 1) {
                    if (state.refuseType === 1) {
                        text = $t('拒绝后，冻结金额将回到会员账户中，请谨慎操作！')
                        state.formData.status = 0
                    } else {
                        text = $t('拒绝退款后，出款额度将不退回会员余额，确定是否操作？')
                        state.formData.status = -9
                    }
                }
                ElMessageBox.confirm(text, $t('提示'), {
                    type: 'warning'
                }).then(() => {
                    props.itemData.popupType === 1 ? postVerifyData() : closeOrder()
                }).catch(err => { })
            } else {
                if (channelData.value.value === -1) {
                    state.formData.mock = true
                }
                postVerifyData()
            }
        } else {
            ElMessage.warning($t('请完善表单内容再进行提交！'))
        }
    })
}

// 复审
const postVerifyData = () => {
    let params = { ...state.formData }
    if (params.id) delete params.ids
    if (params.ids) delete params.id
    if (params.mock) {
        delete params.channel
    } else {
        params.alias = channelData.value.alias || ''
        params.channel = channelData.value.value || ''
    }
    delete params.channelLabel
    if (params.cashType === 2) {
        if (state.formData.channels.find(item => item.channelAmount == 0)) return ElMessage.warning($t('提现金额不能为0'))
        if (state.formData.channels.find(item => item.channelAmount > item.maxCash)) return ElMessage.warning($t('渠道金额不能大于渠道提现最大值'))
        if (state.formData.channels.find(item => item.channelAmount < item.minCash)) return ElMessage.warning($t('渠道金额不能小于渠道提现最小值'))
        let sum = 0
        state.formData.channels.forEach(item => {
            sum = add(sum, item.channelAmount)
        })
        if (sum !== props.itemData.amount) return ElMessage.warning($t('提现总额不一致'))
        // 分卡出款
        let batchCash = params.channels.map(item => {
            if (item.channel === -1) {
                return {
                    mock: true,
                    "cashAmount": item.channelAmount
                }
            } else {
                return {
                    "channel": item.channel,
                    "cashAmount": item.channelAmount,
                    alias: state.channelList.find(v => v.value == item.channel).alias || ''
                }
            }
        })
        params.batchCash = JSON.stringify(batchCash)
        delete params.channel
        delete params.mock
    }
    if(!channelData.value.asUsdt){delete params.tradeNo}
    delete params.channels
    dialog.value.showLoading()
    postAgainVerify(params).then(res => {
        cancel()
        emits('fetchData')
    }).catch(err => {
        dialog.value.closeLoading()
    })
}

// 强制出款
const postForceOperate = () => {
    if (channelData.value.value === -1) {
        state.formData.mock = true
    }
    let params = { ...state.formData }
    if (params.mock) {
        delete params.channel
    } else {
        params.alias = channelData.value.alias || ''
        params.channel = channelData.value.value || ''
    }
    delete params.channelLabel
    delete params.channels
    dialog.value.showLoading()
    postForceApply(params).then(res => {
        cancel()
        emits('fetchData')
    }).catch(err => {
        dialog.value.closeLoading()
    })
}

// 强制关闭
const closeOrder = () => {
    delete state.formData.ids
    dialog.value.showLoading()
    postCloseOrder(state.formData).then(res => {
        cancel()
        emits('fetchData')
    }).catch(err => {
        dialog.value.closeLoading()
    })
}

const cancel = () => {
    emits('close')
}
</script>

<style scoped lang="scss">
</style>
