<template>
    <!-- 所以会员-会员信息-说明（上级代理/会员层级） -->
    <Dialog width="880" :title="$t('说明')" top="10vh" :isShowBottomButton="false" @cancel="emits('close')">
        <div class="explain-box">
            <div class="small-box" v-for="(item,index) in showData" :key="index">
                <span class="label">{{item.title}}</span>
                <span class="text">{{item.text}}</span>
            </div>
        </div>
    </Dialog>
</template>

<script setup>
import { computed } from 'vue'

const emits = defineEmits(['close'])
const props = defineProps({
    explainType: {
        type: Number,
        default: () => {
            return 0
        }
    },
})
const explainData1 = [
    // { title: $t('说明：'), text: '' },
    { title: '', text: $t('1.修改会员的上级代理，修改后立即生效；') },
    { title: '', text: $t('2.修改后将清除原上级代理该直属数据，包括直属会员数减少，直属数据为空;') },
    { title: '', text: $t('3.修改后会员对新绑定的上级代理，产生的数据进行记录;') },
    { title: '', text: $t('4.修改后会员的下级将也连同整条链路一起返佣到新的上级；') },
    { title: '', text: $t('5.同级别的下级不可以绑定，如b，c，d都是a的同一链路，不可以把b绑定到d；') },
    { title: '', text: $t('6.对同一个上级解绑后，仍可以再绑定回去（解绑期间的数据不记录）;') },
    { title: '', text: $t('7.如果不填写上级代理ID，则会调整为顶级代理;') },
    // { title: '', text: $t('8.同顶层代理不允许修改上级；如a，b，c的上级都是商户了，则不可解绑;') },
    { title: '', text: $t('8.佣金结算期间不允许修改上级（商户时间01：00：00开始结算）；') },
    { title: '', text: $t('9.绑定后从上个结算后开始计算（当日数据将归入新上级）。') },
]
const explainData2 = [
    // { title: $t('说明：'), text: '' },
    { title: '', text: $t('注：对会员修改自动层级后立即生效，若同时选择了锁定层级（默认关闭），则会员进行层级变化时也不受影响。') },
    { title: '：', text: $t('注：若未锁定层级，因系统30秒检测一次，会员如果进游戏再出来，一进一出未发生数据变化，则也会受影响变更回之前层级。') },
    { title: $t('关联影响：'), text: '' },
    { title: '', text: $t('优惠活动：变更后若之前有完成活动未领奖，仍可领取。') },
    { title: '', text: $t('层级控制：变更后将失效（游戏内则退出游戏后失效）。') },
    { title: $t('如：'), text: '' },
    { title: '', text: $t('更变时未锁定层级：会员a当前自动层级1，修改为层级5，若该会员数据发生变化，达到变更则自动变更层级2；若锁定层级则始终是层级1') },
    { title: '', text: $t('会员b当前层级1，修改为层级9，达到变更为层级10；若锁定则始终是层级9。') }
]

const showData = computed(() => {
    return props.explainType === 1 ? explainData2 : explainData1
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
