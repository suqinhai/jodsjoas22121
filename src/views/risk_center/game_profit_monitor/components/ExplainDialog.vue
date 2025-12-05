<template>
    <Dialog width="720" :title="$t('说明')" top="10vh" :isShowBottomButton="false" @cancel="emits('close')">
        <div class="explain-box">
            <div class="small-box" :class="{'small-box-active': [3,6].includes(index)}" v-for="(item,index) in explainData" :key="index">
                <span class="label">{{item.title}}</span>
                <span class="text">{{item.text}}</span>
            </div>
        </div>
    </Dialog>
</template>

<script setup>
const emits = defineEmits(['close'])
const explainData = [
    { title: $t('高倍爆奖'), text: '' },
    { title: '', text: $t('先达到倍数（单局派奖/单局投注 = 倍数（含本金）），且高倍爆奖中奖金额达到时触发；') },
    { title: '', text: $t('列表的实际参数展示爆奖倍数。') },

    { title: $t('会员当天获利比'), text: '' },
    { title: '', text: $t('（会员游戏盈亏/会员有效投注）*100% = 会员获利比；') },
    { title: '', text: $t('先达到获利比，且获利比触发的有效投注值，列表实际参数展示百分比。') },

    { title: $t('大额中奖'), text: '' },
    { title: $t('单局：'), text: $t('大额中奖 = 派奖(不含本金)；') },
    { title: '', text: $t('设置额度，列表展示爆奖金额。') },
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
