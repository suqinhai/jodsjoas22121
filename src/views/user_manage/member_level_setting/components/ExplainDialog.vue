<template>
    <!-- 用户管理-层级设置-说明 -->
    <Dialog width="950" :title="$t('说明')" top="5vh" :isShowBottomButton="false" @cancel="emits('close')">
        <div class="explain-box">
            <div class="small-box" :class="{'small-box--active': [3,17,21].includes(index)}" v-for="(item,index) in explainData" :key="index">
                <span class="label">{{item.title}}</span>
                <span class="text">{{item.text}}</span>
            </div>
        </div>
    </Dialog>
</template>

<script setup>
const emits = defineEmits(['close'])
const explainData = [
    { title: $t('自动层级：'), text: $t('系统根据配置条件，将会员自动分配到对应层级（实时变化）；') },
    { title: $t('固定层级：'), text: $t('固定模式，配置后将触发固定配置，走固定层级条件影响，会员将不在自动层级列表（该会员的自动层级仍然变化，但不会触发自动层级的影响）。') },
    { title: $t('一个会员，会员层级只能存在一个，不可同时存在自动层级和固定层级；如果归入固定层级，就不会存在自动层级中。'), text: '' },

    { title: $t('配置'), text: '' },
    { title: '', text: $t('自动层级的第一个为默认层级，是系统初始的，不可修改；') },
    { title: '', text: $t('通过+-加减来增加或减少配置；删除层级后，原层级会员将失效，根据条件自动匹配（如删除万元户层级，则会员满足上一个条件，则自动变更上一个千元户配置）；') },
    { title: $t('层级名称：'), text: $t('可自定义名称，最大10字符；') },
    { title: $t('描述：'), text: $t('自定义描述，最大50字符；') },
    { title: $t('累计充值金额：'), text: $t('计算成功充值的总金额（不包括赠送），配置整数；') },
    { title: $t('充值次数：'), text: $t('成功充值达到的次数，如配置5，则需要有5次或5次以上的成功充值次数，配置整数；') },
    { title: $t('总盈利额度：'), text: $t('可配置整数或者不配置。') },
    { title: $t('余额+提现-充值：'), text: '' },
    { title: '', text: $t('1、余额包括当前金额+游戏内金额，不包含提现冻结金额和存钱宝冻结金额；') },
    { title: '', text: $t('2、如配置100，会员余额10，提现100，充值20，则为90;') },
    { title: '', text: $t('3、特殊情况：如会员余额10（活动领奖），提现0，充值0，则为10；') },
    { title: '', text: $t('4、层级人数：系统自动实时统计；') },
    { title: '', text: $t('5、限制：对该层级的会员进行限制条件；限制后会员将触发该状态，可配置多个状态。') },

    { title: $t('关联模块'), text: '' },
    { title: '', text: $t('优惠中心-充值活动，可选择所有层级（包括固定）；') },
    { title: '', text: $t('消息中心-群发消息层级设置；') },
    { title: '', text: $t('财务管理-充值通道层级设置。') },

    { title: $t('举例'), text: '' },
    { title: '', text: $t('如自定义十元户：累计充值金额10，充值次数3，总盈利额度30；a会员充值5，不满足，b会员充值10，充值次数2，不满足，c会员充值10，充值1次，总盈利5，不满足；d会员充值10，充值4次，总盈利30，满足自动层级分配。') },
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
