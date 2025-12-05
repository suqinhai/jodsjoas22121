<template>
    <Dialog width="870" :title="$t('票券配置说明')" top="10vh" :isShowBottomButton="false" @cancel="emits('close')">
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
    { title: '', text: $t('票券为提供额外奖励，可关联任务，活动等配置该奖励；') },
    { title: '', text: $t('获得票券后需要在过期时间内点击使用，若过期则不可使用；') },
    { title: '', text: $t('使用票券可触发对应的抽奖玩法，获得对应奖励；') },
    { title: '', text: $t('同个票券类型可以配置多个不同奖励的票券；如现金券类型，配置名称：现金券1，红利5，现金券2，红利50等;') },
    { title: '', text: $t('点击使用后，若未使用关闭后，不会被消耗票券，仍可以继续打开使用；') },
	{ title: '', text: $t('配置关联任务或活动奖励的票券，可重复配置同一个，领取后的有效期则有差异化；') },
	{ title: $t('停发操作:'), text: '' },
	{ title: '', text: $t('可对票券停发操作；将弹框提示：‘操作停发后，之后会员完成任务也不会再派发了，是否确定？') },
	{ title: '', text: $t('恢复正常：停发操作后按键变为恢复正常;') },
	{ title: '', text: $t('停发后，若没发奖励，再次恢复正常后，期间的是不会发的，比如5号修改为停发，9号再改正常，5-8号的会员是没奖励的，9号完成任务的才有；') },
	{ title: $t('票券类型：'), text: '' },
	{ title: '', text: $t('现金兑换券：使用可获得该票券的固定奖励金额；') },                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        -
	{ title: '', text: $t('幸运红包：使用可打开红包，进行开红包；') },
	{ title: '', text: $t('砸金蛋抽奖券：使用可玩砸金蛋，获得砸中金蛋奖励;') },
	{ title: '', text: $t('大转盘票券：使用可进行大转盘抽奖；') },
	{ title: '', text: $t('修改操作;只对还未领取，之后发放的用户生效。') },
	{ title: $t('票券领取：'), text: '' },
    { title: '', text: $t('根据活动或任务配置奖励票券，活动为手动领取则在领奖时获得该票券，自动发放则满足活动条件时自动发放，可在票券页面查看使用获得的票券；') },
    { title: $t('票券使用时间：'), text: '' },
    { title: '', text: $t('根据票券配置的有效期，可选择配置为；') },
    { title: $t('长期：'), text: $t('不限制过期时间；') },
    { title: $t('领取票券后多少天：'), text: $t('根据填写的数值，如配置3，则获得该票券后将在3天后过期，前端显示该票券结束时间，票券过期后将不可使用。') },
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
