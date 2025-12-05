<template>
    <!-- 游戏中心-中奖排行管理-排行榜-温馨提示 -->
    <Dialog width="850" :title="$t('温馨提示')" top="10vh" :isShowBottomButton="false" @cancel="emits('close')">
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
    { title: '', text: $t('根据排行榜设置，数据来源:系统-则取真实会员排名，手工则取手动添加数据，系统+ 手工则取系统和手动添加的数据；') },
    { title: '', text: $t('列表显示最近24小时，前100名中奖数据，根据结算时间排序，前端滚动展示前20名数据；') },
    { title: '', text: $t('如：每10分钟统计一次数据就可以，按统计的时间往前推24小时的数据；') },
    { title: $t('数据来源：'), text: $t('系统+手工，按中奖金额从大到小排；') },
    { title: '', text: $t('比如现在是11号18点  往前24小时是10号18点  可能手工有设置20号的数据  那统计数据的时候20号的数据也会统计进去，等于是往前24小时加往后的数据一起；') },
    { title: $t('手工：'), text: $t('在排行榜列表中不显示会员id，投注时间，结算时间显示一致，取自定义的时分；') },
    { title: '', text: $t('若排行榜数据为系统+手工，真实会员结算时间与手工的一致，则优先真实会员排在前面；') },
    { title: $t('手动添加时间：'), text: $t('配置时间超过当天的，仍然按照前24小时，如果超过则无效，可配置之后的时间，未触发的时间将在达到时候也将轮播；') },
    { title: '', text: $t('超过100条时仍只按照结算时间展示100条。') },
]
</script>

<style lang="scss">
</style>
