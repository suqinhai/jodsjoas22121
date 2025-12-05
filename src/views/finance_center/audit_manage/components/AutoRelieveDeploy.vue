<template>
    <!-- 稽核管理-稽核自动解除额度 -->
    <Dialog ref="dialog" width="620" :title="$t('稽核自动解除额度')" buttonCenter top="20vh" @confirm="handleSubmit" @cancel="cancel">
        <div class="auto-relieve">
            <div class="auto-relieve-box"><span>{{$t('站点')}}</span>
                <MerchantSiteSelect isNeedDefault :clearable="false" style="width: 200px" v-model="state.formData.merchantId" @change="getDetails" />
            </div>
            <div class="auto-relieve-box"><span>{{$t('当玩家总余额低于')}}</span>
                <el-input-number style="width: 200px" v-model="amount" :controls="false" :precision="2" :min="0" :max="999999.99" placeholder="0" />
            </div>
            <div class="tips">
                {{$t('稽核自动解除额度：当玩家总余额低于以上金额时(包含存钱宝)， 该玩家被视为亏光，在下次上分大于等于此金额时， 系统将自动解除任务里解除金额不为零的稽核任务， 设置为0则关闭自动解除，建议解除金额小于游戏准入金额，防止被恶意套利。')}}</div>
        </div>
    </Dialog>
</template>

<script setup>
import { ref, onMounted, reactive, nextTick } from 'vue'
import { editAuditMultiplier, getAutoRelieveConfig } from '@/api/finance'
const emits = defineEmits(['fetchData', 'close'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    },
    // formData: {
    //     type: Object,
    //     default: () => {}
    // },
})
const dialog = ref(null)
const amount = ref(0)
const state = reactive({
    formData: {}
})

onMounted(() => {
    nextTick(() => { getDetails() })
})


const getDetails = () => {
    dialog.value.showLoading()
    getAutoRelieveConfig({ merchantId: state.formData.merchantId }).then(res => {
        amount.value = res.data.amount || 0
        dialog.value.closeLoading()
    })
}

const handleSubmit = () => {
    dialog.value.showLoading()
    editAuditMultiplier({ autoUnblockMax: amount.value, type: 3, merchantId: state.formData.merchantId }).then(() => {
        emits('close')
    }).catch(() => {
        dialog.value.closeLoading()
    })
}

const cancel = () => {
    emits('close')
}
</script>

<style scoped lang="scss">
.auto-relieve {
    &-box {
        // font-size: 16px;
        font-weight: 600;
        margin-bottom: 20px;
        span {
            display: inline-block;
            min-width: 120px;
            text-align: right;
            padding-right: 10px;
        }
    }
}
</style>
