
<template>
    <el-dialog v-model="visible" modal-class="tips-dialog" width="400px" :show-close="false" top="10vh" :close-on-click-modal="false" :title="title"
        :append-to-body="true" center>
        <div class="firstTips" v-if="step === 1">
            <ul>
                <li>{{$t('您需要完成以下流程：')}}</li>
                <li v-for="(item,index) in showData" :key="index">{{item}}</li>
            </ul>
        </div>
        <div class="secondTips" v-else>
            <div>{{$t('新商户需要前往商户中心-站点管理完成：')}}</div>
            <div>{{$t('开版费、路线费、月底保额度的充值')}}</div>
        </div>
        <template #footer>
            <el-button v-throttle type="primary" @click="handleClick">{{$t('知道了')}}</el-button>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import commonsStore from '@/store/common'
import { useRouter } from 'vue-router'

let showData = [$t('1、完成支付开版费、路线费、额度充值。'), $t('2、域名配置。'), $t('3、支付配置。'), $t('4、站点前台配置。')]
const commons = commonsStore()
const router = useRouter()
const title = ref($t('温馨提示'))
const visible = ref(true)
const step = ref(1)

const handleClick = () => {
    if (step.value === 1) {
        step.value = 2
        title.value = $t('新商户充值')
    } else {
        commons.showTipsDialog = false
        router.push('/merchant-center/merchant-recharge')
    }
}

</script>

<style lang="scss">
.tips-dialog {
    padding: 20px 40px;
    .firstTips {
        padding: 20px;
    }
    .secondTips {
        padding: 20px;
    }
}
</style>

