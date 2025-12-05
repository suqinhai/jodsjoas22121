<template>
    <!-- 任务中心-新人福利任务-说明 -->
    <Dialog width="700" :title="$t('说明')" top="5vh" :isShowBottomButton="false" @cancel="emits('close')">
        <div class="explain-box">
            <div class="small-box" :class="{'small-box--active': [1,7].includes(index)}" v-for="(item,index) in explainData" :key="index">
                <span class="label">{{item.title}}</span>
                <span class="text">{{item.text}}</span>
            </div>
        </div>
    </Dialog>
</template>

<script setup>
const emits = defineEmits(['close'])
const explainData = [
    { title: $t('新人福利任务：'), text: $t('为对新玩家设计的任务，任务只可以完成一次；') },
    { title: $t('任务配置：'), text: $t('任务系统默认不可新增、删除，固定任务数量，可对任务进行修改或者关闭不显示；') },
    { title: $t('任务奖励金额配置建议：'), text: $t('赠送总额需要小于游戏准入金额，防止被刷套利；') },
    { title: $t('奖励金额：'), text: $t('奖励货币，领取后增加到余额中；') },
    { title: $t('奖励活跃度：'), text: $t('活跃度用于累计达到活跃额度数量时，可以再次对活跃度宝箱领奖；') },
    { title: $t('是否开启：'), text: $t('开启后，该任务会在客户端显示，活动进行，关闭后，该任务不会在客户端显示，活动不进行；') },
    { title: $t('提示气泡'), text: $t('开启后，该任务入口显示气泡提示，关闭后，该任务入口不显示气泡；') },
    { title: $t('任务规则设置'), text: '' },
    { title: $t('稽核倍数：'), text: $t('设置新人福利任务需要多少稽核才可提现；') },
    { title: $t('是否启用：'), text: $t('启用后，新人福利任务开启，关闭后，新人福利任务关闭；') },
    { title: $t('首页弹窗：'), text: $t('开启后，进入首页会显示新人福利弹窗；') },
    { title: $t('任务介绍：'), text: $t('介绍固定默认文案，支持多语言自动翻译，默认显示列表第一个币种值，其他币种格式一样；') },
    { title: $t('更多限制：'), text: $t('可多选，选择的同时满足才能领取奖励；') },
    { title: $t('禁止同IP重复领取：'), text: $t('若A用户领取了奖励，其他用户登录的IP号与A用户前1个月内登录过的IP号相同，则其他用户不能领取奖励；') },
    { title: $t('禁止同设备号重复领取：'), text: $t('若A用户领取了奖励，其他用户登录的设备号与A用户前1个月内登录过的设备号相同，则其他用户不能领取奖励。') },
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
        &--active {
            margin-top: 10px;
        }
    }
}
</style>
