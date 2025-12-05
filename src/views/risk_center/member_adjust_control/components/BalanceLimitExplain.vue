<template>
    <!-- 会员调控-余额范围值设置说明 -->
    <Dialog width="700" :title="$t('余额范围值设置说明')" top="10vh" :isShowBottomButton="false" @cancel="emits('close')">
        <div class="explain-box">
            <div class="small-box" :class="{'small-box--active': [1].includes(index)}" v-for="(item,index) in explainData" :key="index">
                <span class="label">{{item.title}}</span>
                <span class="text">{{item.text}}</span>
            </div>
        </div>
    </Dialog>
</template>

<script setup>
const emits = defineEmits(['close'])
const explainData = [
    // { title: $t('最小值：'), text: $t('rtp无限制；配置范围控制在最大值的80%(需要相差20%)，如当前最大值配置范围100，则最小值可以配置0-80。') },
    { title: $t('最大值：'), text: $t('不可设置超过100的rtp；配置范围需要同总台vip配置上限校对，如果超过则取总台vip配置额度。') },
    { title: $t('会员rtp'), text: '' },
    { title: '', text: $t('1、会员处于两种变化，最大值rtp，正常rtp；') },
    { title: '', text: $t('2、判断会员余额大于最大值时，取最大值rtp，若小于，则按正常rtp计算；') },
    { title: '', text: $t('3、当余额大于最大值视为触发循环，进入循环的范围控制逻辑。') },
    { title: '', text: $t('如：对层级1设置了最大值100，rtp85%，会员余额为30时（小于最大值），则rtp为正常92%；会员余额为110时，rtp85%（此时进入循环范围，不受期间rtp影响）。') },
    // { title: '', text: $t('1、会员处于三种变化，最大值rtp，最小值rtp，正常rtp；') },
    // { title: '', text: $t('2、判断会员余额需小于最小值时，取最小值rtp，大于最大值时取最大值rtp，若处于两者期间时，则按正常rtp计算；') },
    // { title: '', text: $t('3、当余额小于最小值或大于最大值视为触发循环，进入循环的范围控制逻辑。') },
    // { title: '', text: $t('如：对层级1设置了最小值10，rtp120%，最大值100，rtp85%，  该层级会员余额为5时，rtp120%（此时进入循环范围，不受期间rtp影响，直到余额达到了100，则按照最大值rtp控制）。') },
    // { title: '', text: $t('如：会员余额为30时（处于最小和最大中间），则rtp为正常96%。') },
    // { title: '', text: $t('如：会员余额为110时，rtp85%（此时进入循环范围，不受期间rtp影响，直到余额达到10时，则按照最小值rtp控制）。') },
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
