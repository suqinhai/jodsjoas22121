<template>
    <!-- 商戶信息-未出账单-说明 -->
    <Dialog width="880" :title="$t('未出账单说明')" top="10vh" :isShowBottomButton="false" @cancel="emits('close')">
        <div class="explain-box">
            <div class="small-box" v-for="(item,index) in explainData" :key="index">
                <span class="label">{{item.title}}</span>
                <span class="text">{{item.text}}</span>
            </div>
        </div>
    </Dialog>
</template>

<script setup>
import { computed } from 'vue'

const emits = defineEmits(['close'])
const explainData = [
    // { title: $t('未出账单说明'), text: '' },
    { title: '', text: $t('1.未出账单统计数据为运营地区货币数量') },
    { title: '', text: $t('2.显示该商户所有站点贡献总和，点击则打开未出账单明细') },
    { title: '', text: $t('3.未出账单明细中，点击站点的未出账单将打开数据详情') },
    { title: '', text: $t('4.数据详情中，记录厂家游戏类的投注，输赢，贡献') },
    { title: '', text: $t('5.贡献数据为站点对平台的贡献抽成，其中NEWPG打码模式计算为：投注*费率（则输赢不显示计算）；') },
    { title: '', text: $t('其他厂家的损益模式为：输赢*费率（若输赢负数则计算为0）') },
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
