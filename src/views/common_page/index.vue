<template>
    <div class="container common-page">
        <div class="title">{{$t('待开放。。。')}}</div>
        <div class="tipsText">{{state.tipsText}}</div>
        <div class="customerPhone">telegram: {{state.customerPhone}}</div>
    </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { getCustomerList } from '@/api/merchant_center'

const state = reactive({
    customerPhone: '',
    tipsText: '',
})

const getList = () => {
    globalVBus.$emit('globalLoading', true)
    getCustomerList().then(res => {
        if (res.code === 0) {
            let list = res.data
            let item = list.find(item => item.type == 3)
            if (item) {
                state.customerPhone = item.phone
                state.tipsText = item.prompt
            }
        }
        globalVBus.$emit('globalLoading', false)
    })
}

onMounted(() => {
    getList()
})
</script>

<style lang='scss'>
.common-page {
    color: #000;
    font-size: 28px;
    justify-content: center;
    align-items: center;
    .tipsText {
        margin-top: 30px;
        color: #999;
        font-size: 26px;
    }
    .customerPhone {
        margin-top: 10px;
        color: #999;
        font-size: 26px;
    }
}
</style>
