<template>
    <!-- 商户充值-支付详情 -->
    <Dialog :title="$t('支付详情')" ref="dialog" :isCustom="false" @cancel="emit('close')" @confirm="confirmRecharge" buttonCenter
        className="recharge-bill-dialog">
        <div class="dialog-container">
            <div class="amount">
                {{ toDecimal(prop.detail.amount)}} USDT
            </div>
            <canvas ref="canvas"></canvas>
            <div class="address">
                <span>{{ prop.detail.toAddress }}</span>
                <el-icon @click="copy">
                    <CopyDocument />
                </el-icon>
            </div>
            <div class="tips">
                <div class="time">
                    <span>{{$t('支付倒计时：')}}</span>
                    <span>{{ durationFormat(times*1000) }} </span>
                </div>
                <div class="text">{{$t('注：请在倒计时间结束内完成支付，否则订单失效')}}</div>
            </div>
            <div class="others">
                <div class="type">
                    <label>{{$t('交易类型：')}}</label>
                    <span>TRC20</span>
                </div>
                <div class="createTime">
                    <label>{{$t('交易时间：')}}</label>
                    <span>{{ dateFormat(date, 'yyyy-MM-DD HH:II:SS') }}</span>
                </div>
            </div>
        </div>
    </Dialog>

</template>

<script setup>
import { ref, defineAsyncComponent, onMounted, onUnmounted } from 'vue';
import { toDecimal, copyText, dateFormat, durationFormat } from '@/common/util/index';
import QRCode from 'qrcode';
import { ElMessageBox } from 'element-plus';
import commonStore from '@/store/common'
import { useRouter } from 'vue-router';
const Dialog = defineAsyncComponent(() => import('@/components/Dialog/index.vue'));

const router = useRouter()
const dialog = ref(null);
const prop = defineProps(['detail']);
const emit = defineEmits(['close']);
const canvas = ref(null);
const times = ref();
const timer = ref(null)
const date = new Date()
const commonData = commonStore()

const confirmRecharge = () => {
    commonData.alreadyRecharge = true
    localStorage.setItem('alreadyRecharge', 1)
    emit('close')
    // 提交后跳到指定页面
    router.push('/merchant-center/bill-change-records')
}

const getQRCode = async () => {
    let address = prop.detail.toAddress
    let opts = {
        errorCorrectionLevel: "H", //容错级别
        type: "image/png", //生成的二维码类型
        quality: 0.5, //二维码质量
        margin: 0, //二维码留白边距
        width: 220, //宽
        height: 220, //高
        text: address, //二维码内容
        color: {
            dark: "#333333", //前景色
            light: "#fff", //背景色
        }
    };
    setTimeout(() => {
        QRCode.toCanvas(canvas.value, address, opts)
    }, 100)
}

const copy = () => {
    copyText(prop.detail.toAddress)
}

onMounted(() => {
    times.value = prop.detail.timeout
    timer.value = setInterval(() => {
        times.value--
        if (times.value === 0) {
            clearInterval(timer.value)
            ElMessageBox.alert($t('订单已失效，请重新提交订单。'), $t('提示'), {
                confirmButtonText: $t('确定'),
            }).then(() => {
                emit('close')
            }).catch(() => {
                emit('close')
            })
        }
    }, 1000)
    getQRCode()
})

onUnmounted(() => {
    if (timer.value) clearInterval(timer.value)
})

</script>

<style lang='scss'>
.recharge-bill-dialog {
    .dialog-container {
        width: 100%;
        padding: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        .amount {
            margin-bottom: 20px;
            text-align: center;
            font-size: 20px;
        }
        .address {
            margin-top: 10px;
            display: flex;
            align-items: center;
            .el-icon {
                margin-left: 5px;
                cursor: pointer;
            }
        }
        .tips {
            width: 100%;
            .time {
                margin: 10px 0;
                font-size: 20px;
                color: red;
                text-align: center;
            }
            .text {
                font-size: 14px;
            }
        }
        .others {
            width: 100%;
            .type {
                label {
                    width: 100px;
                    font-size: 14px;
                }
                span {
                }
            }
            .createTime {
                label {
                    width: 100px;
                    font-size: 14px;
                }
                span {
                }
            }
        }
    }
}
</style>