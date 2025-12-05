<template>
    <!-- 站点列表-一键维护 -->
    <Dialog :title="$t('一键维护')" ref="dialog" @confirm="confirmEdit" @cancel="emits('close')" width="820">
        <el-form :model="state.formData" :label-width="$locale == 'zh' ? '100px' : 'auto'">
            <div class="tips">{{$t('确定对所有商户进行维护操作吗？')}}</div>
            <div class="maintainBox">
                <el-form-item :label="$t('*维护公告：')">
                    <el-input v-model="state.formData.content" type="textarea" show-word-limit maxlength="1000"></el-input>
                </el-form-item>
                <el-form-item :label="$t('*维护开始：')">
                    <el-radio-group v-model="state.formData.standBeginType" class="ml-4">
                        <el-radio :label="0">{{$t('立即开始')}}</el-radio>
                        <el-radio :label="1">
                            <span style="margin-right:10px;">{{$t('定时开始')}}</span>
                            <el-date-picker :disabled="state.formData.standBeginType === 0" v-model="state.formData.standBeginTime" type="datetime"
                                :placeholder="$t('开始时间')" value-format="x" />
                        </el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item :label="$t('*维护结束：')">
                    <el-radio-group v-model="state.formData.standEndType" class="ml-4">
                        <el-radio :label="0">{{$t('手动结束')}}</el-radio>
                        <el-radio :label="1">
                            <span style="margin-right:10px;">{{$t('定时结束')}}</span>
                            <el-date-picker :disabled="state.formData.standEndType === 0" v-model="state.formData.standEndTime" type="datetime"
                                :placeholder="$t('开始时间')" value-format="x" />
                        </el-radio>
                    </el-radio-group>
                </el-form-item>
            </div>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { postEditAllSiteStatus } from '@/api/merchant_center'
import { ElMessage } from 'element-plus';
const prop = defineProps(['currentItem'])
const emits = defineEmits(['close', 'refresh'])
const state = reactive({
    formData: {
        standBeginType: 0,
        standEndType: 0
    }
})
const dialog = ref(null)

const confirmEdit = () => {
    const { content, standBeginType, standEndType, standBeginTime, standEndTime } = state.formData
    if (!content) return ElMessage.warning($t('请输入维护公告'))
    let params = {
        status: -1,
        content,
        standBeginType,
        standEndType
    }
    if (standBeginType === 1) {
        if (!standBeginTime) return ElMessage.warning($t('请选择维护开始时间'))
        params.standBeginTime = standBeginTime
    }
    if (standEndType === 1) {
        if (!standEndTime) return ElMessage.warning($t('请选择维护结束时间'))
        params.standEndTime = standEndTime
    }
    dialog.value.showLoading()
    postEditAllSiteStatus(params).then(({ code, data }) => {
        emits('refresh')
        emits('close')
    }).catch(() => {
        dialog.value.closeLoading()
    })
}
</script>

<style lang="scss" scoped>
.tips {
    text-align: left;
    margin-bottom: 20px;
    font-size: 16px;
}
</style>