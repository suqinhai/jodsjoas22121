<template>
    <!-- 会员调控-说明 -->
    <Dialog width="880" :title="$t('温馨提示')" top="2vh" :isShowBottomButton="false" @cancel="emits('close')">
        <div class="explain-box">
            <div class="small-box" :class="{'small-box--active': specialData.includes(index)}" v-for="(item,index) in (type === 1 ? explainData1 : explainData2)" :key="index">
                <template v-if="!item.isSpecial || (item.isSpecial && isCtrlWin)">
                    <span class="label">{{item.title}}</span>
                    <span class="text">{{item.text}}</span>
                </template>
            </div>
        </div>
    </Dialog>
</template>

<script setup>
import { computed } from 'vue'
import userStore from '@/store/user'

const props = defineProps({
    type: {
        default: 1
    }
})
const emits = defineEmits(['close'])
const explainData1 = [
    { title: $t('商户数据'), text: '' },
    { title: $t('商户等级：'), text: $t('通过充值USDT获得等级成长，等级越高可享受更多权益；') },
    { title: $t('账单详情：'), text: $t('进入账单列表，查看每月账单详情；') },
    { title: $t('商务服务：'), text: $t('查看商务服务信息；') },
    { title: $t('商户权益：'), text: $t('查看商户权益；') },
    { title: $t('充值：'), text: $t('点击跳转到USDT充值界面；') },
    { title: $t('总充值金额：'), text: $t('统计商户总充值的USDT金额；') },
    { title: $t('总优惠金额：'), text: $t('统计总台对商户赠送的USDT金额；') },
    { title: $t('商户余额：'), text: $t('当前商户的USDT剩余额度；') },
    { title: $t('消耗总金额：'), text: $t('统计已扣除的USDT费用，包括开站费用，线路费用等；') },
    { title: $t('授信额度：'), text: $t('可透支的USDT额度；') },
    { title: $t('可用余额：'), text: $t('可用额度 = 站点余额 + 授信额度 -未结账单（包括实时账单）；') },
    { title: $t('未结账单：'), text: $t('上月或更早已生成账单但未全额缴纳；') },
    { title: $t('游戏抽成：'), text: $t('根据在创建商户时配置是厂家游戏抽点比例计算，已累计贡献的额度。点击可查看明细。') },
]
const explainData2 = [
    { title: $t('数据统计'), text: '' },
    { title: $t('站点总计：'), text: '' },
    { title: '', text: $t('总站点数：商户已有站点数量；') },
    { title: '', text: $t('历史站点数：站点数量，不计算今日新增数量；') },
    { title: '', text: $t('新开站点数：仅统计今日新增数量；') },
    // { title: $t('今日投放：'), text: $t('根据统计报表-ROI数据统计的投放配置，显示投放数据；') },
    // { title: '', text: $t('付费人数：当日投放付费人数；') },
    // { title: '', text: $t('付费成本：投放成本/付费人数；') },
    // { title: '', text: $t('ROI：当日的ROI数据；') },
    // { title: $t('今日费用：'), text: '' },
    // { title: '', text: $t('平台费：包括开版费，线路费用，维护费用；') },
    // { title: '', text: $t('资源费：投放费用；') },
    // { title: '', text: $t('三方费：三方游戏厂家抽成费用；') },

    { title: $t('会员总计：'), text: $t('当前会员总数；') },
    { title: '', text: $t('首充人数：首充人数总和；') },
    { title: '', text: $t('代理人数：代理人数总和；') },
    { title: '', text: $t('今日首充人数：仅统计今日首次充值会员人数；') },
    { title: $t('今日新增：'), text: $t('今日新注册的会员；') },
    { title: '', text: $t('首充人数：今日新注册的会员有多少人首充充值；') },
    { title: '', text: $t('代理人数：今日新注册的会员有多少人成为代理；') },
    { title: '', text: $t('大R人数：今日新注册的会员有多少人成为大R人数；') },

    { title: $t('本月投注总计：'), text: $t('统计本月会员总有效投注数量；') },
    { title: '', text: $t('注：统计已经过滤掉NEWPG，NEWJILI，NEWPP投注数据。') },
    { title: '', text: $t('今日投注人数：今日进行投注的人数；') },
    { title: '', text: $t('本月总投注人数：本月的投注人数；') },
    { title: '', text: $t('对比昨日差额：今日与昨日的投注差额；今日投注数量-昨天投注数量；') },
    { isSpecial: true, title: $t('本月NEWPG投注：'), text: $t('仅统计本月NEWPG投注数量；') },
    { isSpecial: true, title: '', text: $t('今日投注：今日有效投注NEWPG投注数量；') },
    { isSpecial: true, title: '', text: $t('今日杀率：（杀率：今日盈亏÷今日投注）；') },
    { isSpecial: true, title: '', text: $t('如果盈亏是负数则计算后也显示负数；') },
    { isSpecial: true, title: '', text: $t('如杀率-30，盈亏对应的是会员，用户输显示的是负数，站在商户角度看，负数就是商户赢钱，用户输钱；') },
    { isSpecial: true, title: '', text: $t('RTP＞100投注：会员触发大于100的返奖率投注额；') },
    { isSpecial: true, title: '', text: $t('RTP＜100投注：会员触发小于100的返奖率投注额；') },
    { isSpecial: true, title: $t('本月NEWJILI投注：'), text: $t('仅统计本月NEWJILI投注数量；') },
    { isSpecial: true, title: '', text: $t('今日投注：今日有效投注NEWJILI投注数量；') },
    { isSpecial: true, title: '', text: $t('今日杀率：（杀率：今日盈亏÷今日投注）；') },
    { isSpecial: true, title: '', text: $t('如果盈亏是负数则计算后也显示负数；') },
    { isSpecial: true, title: '', text: $t('如杀率-30，盈亏对应的是会员，用户输显示的是负数，站在商户角度看，负数就是商户赢钱，用户输钱；') },
    { isSpecial: true, title: '', text: $t('RTP＞100投注：会员触发大于100的返奖率投注额；') },
    { isSpecial: true, title: '', text: $t('RTP＜100投注：会员触发小于100的返奖率投注额；') },

    { title: $t('充提差额：'), text: $t('充值-提现，统计充值-提现差额，为负数显示红色（表示商户亏），为正数显示绿色；') },
    { title: '', text: $t('今日总充值：今日总充值额度；') },
    { title: '', text: $t('今日总提现：今日总提现额度；') },
    { title: '', text: $t('人工修正-可提现：统计后台人工修正为可提现的额度；') },
    { title: $t('今日优惠：'), text: $t('今日活动领奖额度；') },
    { title: '', text: $t('今日参与人数：今日参与活动的人数，参与人数去重，一个人参与多个活动仍只记录1；') },
    { title: '', text: $t('领取总数：活动已领奖的额度；') },
    { title: '', text: $t('今日优惠个数：今日有人参与的活动数，比如：有人参与首充和救援金，这样活动数就是2个；') },
    { title: $t('今日损益：'), text: $t('损益统计会员输赢，如果会员赢钱，则显示负数红色数值（表示商户亏），会员输则显示绿色-正数；') },
    { title: '', text: $t('利润：盈亏-优惠活动；') },
    { title: '', text: $t('存量：充提差额-利润；') },
]
const userData = userStore()

const isCtrlWin = computed(() => {
    return (userData.siteInfo.commissionMode === 2 || (userData.siteInfo.commissionMode === 1 && userData.siteInfo.ctrlWin))
})
const specialData = computed(() => {
    // return isCtrlWin.value ? [14, 27, 35, 54] : [14, 27, 35, 39]
    if (props.type === 1) return []
    return isCtrlWin.value ? [5, 13, 32] : [5, 13, 18]
})
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
