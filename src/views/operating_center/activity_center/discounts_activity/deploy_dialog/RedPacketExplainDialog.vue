<template>
    <!-- 运营中心-优惠活动列表-活动配置弹窗-红包活动说明 -->
    <Dialog top="10vh" :title="$t('红包活动说明')" width="700" :isShowBottomButton="false" @cancel="emits('close')">
        <div class="explain-box">
            <div class="small-box" :class="{'small-box-active': type == 2 && index === 5}" v-for="(item,index) in explainData[type]" :key="index">
                <span class="label">{{item.title}}</span>
                <span class="text">{{item.content}}</span>
            </div>
        </div>
    </Dialog>
</template>

<script setup>
const emits = defineEmits(["close"])
const props = defineProps({
    type: {
        default: ''
    },
})
const handleClose = () => {
    emits('close')
}
let explainData = {
    1: [
        { title: $t('领取条件'), content: '' },
        { title: $t('无条件：'), content: $t('表示领取红包没有前置条件；') },
        { title: $t('当日充值：'), content: $t('表示当日充值满足设置金额才可参与抢红包；') },
        { title: $t('当日打码：'), content: $t('表示当日打码满足设置金额才可参与抢红包。') },
    ],
    2: [
        { title: $t('奖励类型-固定金额'), content: '' },
        { title: $t('单个金额：'), content: $t('每个红包奖励额度固定；') },
        { title: $t('红包总数：'), content: $t('该活动总的发放红包数量；') },
        { title: $t('每个时间段红包总数：'), content: $t('每个时间段可以抢的红包总次数；') },
        { title: '', content: $t('设置时间段红包总数(每个时间段，全部用户领取红包总次数)。') },

        { title: $t('奖励类型-随机金额'), content: '' },
        { title: $t('红包总数：'), content: $t('活动期间总发放红包数量；') },
        { title: $t('每个时间段红包总数：'), content: $t('每个时间段可以抢的红包总次数；') },
        { title: $t('每个时间段红包总金额：'), content: $t('每个时间段发放的红包额度；') },
        { title: $t('红包金额区间：'), content: $t('配置单个红包的随机金额范围：设置红包最小金额、最大金额（不可大于派发总金额）；') },
        { title: $t('单个金额范围：'), content: $t('设置红包最小金额、最大金额（不可大于派发总金额）；') },
        { title: $t('概率配置：'), content: $t('对随机奖励金额范围进行中奖概率配置，至少配置2个奖励金额节点，奖励金额节点不允许重复。') },
    ],
    3: [
        { title: $t('限制条件'), content: '' },
        { title: $t('限抢次数：'), content: $t('若配置1，则每个时间段每个会员只可抢1次；') },
        { title: $t('总次数上限：'), content: $t('单个会员可抢总次数上限：表示活动周期内，单个会员最多抢红包次数；若达到上限后，再抢提示已抢完。') },
    ],
}
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
