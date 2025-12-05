<template>
    <!-- 运营中心-优惠活动列表-活动列表/已关闭活动-自定义活动-奖励审核派发-申请审核 -->
    <Dialog ref="dialog" width="400" :title="$t('申请审核')" top="10vh" buttonCenter :isCancel="false" :operateActions="[$t('拒绝'), $t('通过')]" @confirm="handleSubmit(1)"
        @cancel="handleSubmit(3)" @close="emits('close')">
        <div class="apply-audit">
            <div class="small-row" v-for="(item,index) in auditData.ext" :key="index">
                <div class="title">{{$t('问题')}}{{index + 1}}：{{item}}</div>
                <div class="text">{{$t('答案：')}}{{auditData.answers[index]}}</div>
            </div>
        </div>
    </Dialog>
</template>

<script setup>
import { postActivityAudit } from '@/api/discounts_center'
import { ref } from 'vue'

const emits = defineEmits(['close', 'refresh'])
const props = defineProps({
    auditData: {
        type: Object,
        default: () => {
            return {
                ext: []
            }
        },
    },
})
const dialog = ref(null)

const handleSubmit = (status) => {
    dialog.value.showLoading()
    postActivityAudit({
        status,
        id: props.auditData.id
    }).then(() => {
        emits('close')
        emits('refresh')
    }).catch(() => {
        dialog.value.closeLoading()
    })
}
</script>

<style lang="scss">
.apply-audit {
    .small-row {
        line-height: 24px;
        margin-bottom: 10px;
        .title {
            font-weight: 600;
        }
    }
}
</style>
