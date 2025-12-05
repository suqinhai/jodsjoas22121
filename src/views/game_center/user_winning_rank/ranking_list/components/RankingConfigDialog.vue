<template>
    <!-- 游戏中心-中奖排行管理-排行榜-排行榜设置 -->
    <Dialog ref="dialog" :title="$t('排行榜设置')" top="20vh" :width="$locale == 'zh' ? 450 : 600" buttonCenter @confirm="confirmEdit"
        @cancel="emits('close')">
        <el-form :model="state.formData" label-width="auto">
            <el-form-item :label="$t('数据来源:')">
                <el-radio-group v-model="state.rankingType">
                    <el-radio :value="1" :label="1">{{$t('系统')}}</el-radio>
                    <el-radio :value="2" :label="2">{{$t('手工')}}</el-radio>
                    <el-radio :value="3" :label="3">{{$t('系统+手工')}}</el-radio>
                </el-radio-group>
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { postWinningRankingConfig } from "@/api/merchant_center"

const emits = defineEmits(['close', 'fetchData'])
const prop = defineProps(['rankingType'])
const state = reactive({
    rankingType: ''
})
const dialog = ref(null)

onMounted(() => {
    state.rankingType = prop.rankingType
})

const confirmEdit = () => {
    dialog.value.showLoading()
    postWinningRankingConfig({ type: state.rankingType }).then(() => {
        emits('close')
    }).catch(() => {
        dialog.value.closeLoading()
    })
}
</script>

<style lang="scss" scoped>
</style>