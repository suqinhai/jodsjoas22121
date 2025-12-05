<template>
    <!-- 商户充值 -->
    <div class="container merchant-recharge">
        <el-tabs type="border-card">
            <el-tab-pane :label="$t('充币')">
                <div class="pane-container">
                    <el-badge>
                        <div class="coin">
                            <img src="../../../assets/img/merchant_center/USDT.png" alt="">
                            <span>USDT</span>
                        </div>
                    </el-badge>
                    <ul class="amount-list">
                        <li v-for="(item, index) in amountList" :key="index" class="amount-item"
                            :class="{'amount-item--special': amountList[0] && amountList[0].fixedRatio}">
                            <el-badge
                                :value="(item.ratio?`+${item.ratio}% `:item.giftAmount?`+${item.giftAmount}U `:'')  + (amountList[0] && amountList[0].fixedRatio ? ` +${amountList[0].fixedRatio}%` : '')">
                                <el-button v-throttle @click="amount = item.rechargeAmount">{{ item.rechargeAmount }} U
                                </el-button>
                            </el-badge>
                        </li>
                    </ul>
                    <div class="amount-tips">{{$t('实际转账的金额 必须与 输入的充值金额 一致，否则可能无法快速自动到账')}}</div>
                    <div class="inputBox">
                        <el-input v-model="amount" maxlength="12" @input="amount = amount.replace(/[^\d/]/g,'')">
                            <template #append>USDT</template>
                        </el-input>
                    </div>
                    <div class="rewardAmount" v-if="amount">
                        <span>{{$t('充值以上数量将赠送您')}}<b>{{rewardAmount || 0}}</b> USDT</span>
                    </div>
                    <el-button v-throttle type="primary" round :disabled="!amount || amount == 0" class="rechargeBtn" @click="handleRecharge">
                        {{$t('立即充值')}}</el-button>
                    <div class="tips">
                        <p>{{$t('温馨提示:')}}</p>
                        <p style="color:#f00;">{{$t('1. 仅支持USDT充值, 网络为TRC20协议')}}</p>
                        <p style="color:#f00;">{{$t('2. 因充币地址不定期更换,')}} {{$t('请在当前页面充值! 切勿保存地址充币, 否则自行承担损失!')}}</p>
                        <p style="color:#f00;">{{$t('3. 拉取订单后，请勿修改金额。')}}</p>
                        <p style="margin-top:10px;">{{$t('赠送说明:')}}</p>
                        <p>{{$t('1. 笔笔送: 每一笔充值都赠送充值金额的')}}{{amountList[0]?.fixedRatio || 0}}%。</p>
                        <div class="tips-level">
                            <p>{{$t('2. 额外再送阶梯：')}}</p>
                            <div class="tips-level-box">
                                <div class="tips-level-item" v-for="(item, index) in amountList" :key="index">
                                    &gt;= {{ item.rechargeAmount }}{{$t('U 赠送')}}
                                    {{ item.ratio? item.ratio + '%' : (item.giftAmount || 0) + 'U' }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </el-tab-pane>
        </el-tabs>
        <RechargeBillDialog :detail="rechargeDetail" ref="billDialog" v-if="showDialog" @close="showDialog = false">
        </RechargeBillDialog>
    </div>
</template>

<script setup name="merchantRecharge">
import { reactive, ref, computed, onMounted, defineAsyncComponent } from 'vue';
import { toolPoint, div, mul } from '@/common/util/index'
import { getMerchantRechargeList, recharge } from '@/api/merchant_center'
const RechargeBillDialog = defineAsyncComponent(() => import('./components/RechargeBillDialog.vue'))

const amountList = reactive([])
const amount = ref()
const rechargeDetail = ref()
const billDialog = ref(null)
const showDialog = ref(false)

const activeItem = computed(() => {
    let item
    let index = amountList.findIndex(item => item.rechargeAmount > amount.value)
    if (index === -1) {
        item = amountList[amountList.length - 1]
    } else if (index === 0) {
        item = ''
    } else {
        item = amountList[index - 1]
    }
    return item
})

const rewardAmount = computed(() => {
    if (!activeItem.value) return ''
    let { ratio, fixedRatio, giftAmount } = activeItem.value
    let awardAmount = 0
    if (ratio) {
        awardAmount = mul((div(ratio, 100)), amount.value)
    } else {
        awardAmount = giftAmount || 0
    }
    if (fixedRatio) {
        awardAmount += mul((div(fixedRatio, 100)), amount.value)
    }
    return toolPoint(awardAmount)
})

const handleRecharge = () => {
    let params = {
        amount: amount.value
    }
    if (activeItem.value.ratio) {
        params.giftRatio = activeItem.value.ratio
    } else {
        params.giftAmount = activeItem.value.giftAmount
    }

    recharge(params).then(res => {
        if (res.code === 0) {
            rechargeDetail.value = res.data
            showDialog.value = true
        }
    })
}

onMounted(() => {
    getMerchantRechargeList().then((res) => {
        if (res.code === 0) {
            amountList.push(...res.data)
        }
    })
})


</script>

<style lang='scss'>
.merchant-recharge {
    .el-tabs {
        &__content {
            overflow-x: auto;
        }
        .pane-container {
            width: 640px;
            .coin {
                position: relative;
                display: flex;
                align-items: center;
                padding: 0 15px;
                img {
                    margin-right: 10px;
                    height: 30px;
                }
                span {
                    font-size: 16px;
                }
            }
            .amount-list {
                margin-top: 20px;
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                .amount-item {
                    width: 100px;
                    margin-right: 60px;
                    margin-bottom: 20px;
                    .el-badge {
                        width: 100%;
                        .el-badge__content {
                            z-index: 2;
                        }
                    }
                    .el-button {
                        min-width: 100%;
                    }
                    &--special {
                        margin-right: 100px;
                    }
                }
            }
            .inputBox {
                margin-bottom: 20px;
                width: 100%;
            }
            .rewardAmount {
                margin-bottom: 20px;
                span {
                    font-size: 14px;
                    b {
                        color: #ffdb35;
                    }
                }
            }
            .rechargeBtn {
                width: 100%;
            }
            .tips {
                margin-top: 20px;
                p {
                    line-height: 1.8em;
                }
                &-level {
                    display: flex;
                    &-box {
                        display: flex;
                        flex-direction: column;
                        margin-left: 20px;
                    }
                    &-item {
                        margin-bottom: 10px;
                    }
                }
            }
        }
    }
    .amount-tips {
        color: red;
        margin-bottom: 10px;
    }
}
</style>