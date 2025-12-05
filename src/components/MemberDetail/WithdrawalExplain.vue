<template>
    <!-- 所以会员-会员信息-提现账户说明 -->
    <Dialog width="880" :title="$t('说明')" top="10vh" :isShowBottomButton="false" @cancel="emits('close')">
        <div class="explain-box">
            <div class="small-box" v-for="(item,index) in explainData" :key="index">
                <span class="label">{{item.title}}</span>
                <span class="text">{{item.text}}</span>
            </div>
        </div>
    </Dialog>
</template>

<script setup>
const emits = defineEmits(['close'])
const explainData = [
    { title: $t('提现设置说明：'), text: '' },
    { title: '', text: $t('1.提现账号，同一个同类型的提现账号只能添加到一个会员账号下，不可以再添加到同商户的其他会员账号下面。') },
    { title: '', text: $t('2.删除提现商户后，可以再添加到任何一个会员账号下面。') },
    { title: '', text: $t('3.会员用同一个手机号码注册了gcash跟maya，但是一个账号只绑定了个gcash，没有绑定maya。若重新注册一个账号，新的账号maya还是可以绑定。') },
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
