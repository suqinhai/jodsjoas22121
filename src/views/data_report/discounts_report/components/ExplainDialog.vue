<template>
    <Dialog width="870" :title="$t('说明')" top="10vh" :isShowBottomButton="false" @cancel="emits('close')">
        <div class="explain-box">
            <div class="small-box" v-for="(item,index) in showData" :key="index">
                <span class="label">{{item.title}}</span>
                <span class="text">{{item.text}}</span>
            </div>
        </div>
    </Dialog>
</template>

<script setup>
const emits = defineEmits(['close'])
const showData = [
    { title: $t('赠送金额：'), text: $t('统计系统已发放奖励，包括所有（活动、任务、返水、返佣、vip奖励、充值优惠、余额宝）其中返佣，活动-闯关为系统自动发放') },
    { title: $t('赠送人数：'), text: $t('奖励人数需去重，单个会员触发任意奖励则计算1人') },
    { title: $t('领取优惠后再充值人数：'), text: $t('当天领取优惠且充值的人数，可循环统计，比如：1号领取优惠并且充值统计了一次数据，2号又领取优惠并且充值会再统计一次，(一定要领取优惠在前，充值在后)') },
    { title: $t('领取优惠投注人数：'), text: $t('当天领取优惠且投注的人数') },
    { title: $t('领取优惠再充值和领取优惠再投注：'), text: $t('只统计这7个活动数据（签到，救援金，幸运转盘，红包，推广，闯关邀请，余额救援金）') },
]
</script>

<style lang="scss">
.explain-box {
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
    .small-box {
        font-size: 16px;
        line-height: 24px;
        .label {
            color: #666;
        }
        .text {
            color: #999;
        }
        &-active {
            margin-top: 10px;
        }
    }
}
</style>
