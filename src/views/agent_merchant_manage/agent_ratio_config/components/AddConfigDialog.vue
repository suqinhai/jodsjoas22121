<template>
    <!-- 代理商比例配置-修改 -->
    <Dialog width="700" :title="$t('修改')" top="10vh" :operateActions="[$t('取消'), $t('提交')]" @confirm="confirmEdit(addFrom)" @cancel="cancel">
        <el-form ref="addFrom" :model="form" :label-width="$locale == 'zh' ? '200px' : 'auto'" :rules="form.rules">
            <el-form-item :label="$t('充值支付通道费率%：')" prop="payRate">
                <el-input-number class="special-input" v-model="form.payRate" :controls="false" :min="0" :placeholder="$t('输入充值支付通道费率%')"
                    style="width: 100%;" />
            </el-form-item>
            <el-form-item :label="$t('分成比例%')" prop="shareRate">
                <el-input-number class="special-input" v-model="form.shareRate" :controls="false" :min="0" :placeholder="$t('输入分成比例%')"
                    style="width: 100%;" />
            </el-form-item>
            <el-form-item :label="$t('游戏抽成%：')" prop="playRate">
                <el-input-number class="special-input" v-model="form.playRate" :controls="false" :min="0" :placeholder="$t('输入游戏抽成%')"
                    style="width: 100%;" />
            </el-form-item>
            <el-form-item :label="$t('rtp＞100抽成%：')" prop="rtpUpRate" v-if="isBetMode">
                <el-input-number class="special-input" v-model="form.rtpUpRate" :controls="false" :min="0" :max="100"
                    :placeholder="$t('输入rtp＞100抽成%')" style="width: 100%;" />
            </el-form-item>
            <el-form-item :label="$t('rtp＜100抽成%：')" prop="rtpDnRate" v-if="isBetMode">
                <el-input-number class="special-input" v-model="form.rtpDnRate" :controls="false" :min="0" :max="100"
                    :placeholder="$t('输入rtp＜100抽成%')" style="width: 100%;" />
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { reactive, onMounted, ref, computed } from 'vue'
import { postEditShareEdit } from '@/api/agent_system'
import userStore from '@/store/user'


const userData = userStore()
const addFrom = ref(null)
const props = defineProps(['item'])
const emits = defineEmits(['close', 'refresh'])
const form = reactive({
    userId: '',
    playRate: '',
    rtpUpRate: '',
    rtpDnRate: '',
    shareRate: '',
    payRate: '',
    rules: {
        rtpUpRate: [{ required: true, message: $t('请输入rtp > 100抽成%'), trigger: 'change' }],
        rtpDnRate: [{ required: true, message: $t('请输入rtp < 100抽成%'), trigger: 'change' }],
        playRate: [{ required: true, message: $t('请输入游戏抽成%'), trigger: 'change' }],
        shareRate: [{ required: true, message: $t('请输入分成比例%'), trigger: 'change' }],
        payRate: [{ required: true, message: $t('请输入充值支付通道费率%'), trigger: 'change' }]
    }
})


const isBetMode = computed(() => {
    return userData.siteInfo.commissionMode && userData.siteInfo.commissionMode === 2
})

const confirmEdit = (el) => {
    const { userId, playRate, rtpUpRate, rtpDnRate, shareRate, payRate } = form
    if (playRate?.toString().length > 8 ||
        rtpUpRate?.toString().length > 8 ||
        rtpDnRate?.toString().length > 8 ||
        shareRate?.toString().length > 8 ||
        payRate?.toString().length > 8
    ) {
        return ElMessage.warning($t('所填表单输入的值最多为6位小数'))
    }
    el.validate((valid, fields) => {
        if (valid) {
            postEditShareEdit({
                userId,
                playRate,
                rtpUpRate,
                rtpDnRate,
                shareRate,
                payRate
            }).then(res => {
                if (res.code === 0) {
                    emits('close')
                    emits('refresh')
                }
            })
        } else {
            ElMessage.warning($t('请完善表单内容再进行提交！'))
        }
    })

}

onMounted(() => {
    form.userId = props.item?.user.id
    form.playRate = props.item.aaRate_0 === 0 || props.item.aaRate_0 ? props.item.aaRate_0 : props.item.aoRate_0
    form.rtpUpRate = props.item.aaRate_1 === 0 || props.item.aaRate_1 ? props.item.aaRate_1 : props.item.aoRate_1
    form.rtpDnRate = props.item.aaRate_2 === 0 || props.item.aaRate_2 ? props.item.aaRate_2 : props.item.aoRate_2
    form.shareRate = props.item.aaRate_3 === 0 || props.item.aaRate_3 ? props.item.aaRate_3 : props.item.aoRate_3
    form.payRate = props.item.aaRate_4 === 0 || props.item.aaRate_4 ? props.item.aaRate_4 : props.item.aoRate_4
})

const cancel = () => {
    emits('close')
}
</script>

<style lang='scss'>
.red {
    color: red;
}
</style>