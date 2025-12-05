<template>
    <!-- 站点列表-修改状态 -->
    <Dialog :title="$t('修改状态')" ref="dialog" @confirm="confirmEdit" @cancel="emits('close')">
        <el-form :model="state.formData" :label-width="$locale == 'zh' ? '100px' : 'auto'">
            <el-radio-group v-model="state.formData.status">
                <el-radio :label="1">{{$t('正常')}}</el-radio>
                <el-radio :label="-1">{{$t('维护')}}</el-radio>
               <!-- <el-radio :label="-5" v-if="!prop.currentItem.self">{{$t('冻结')}}</el-radio>
                <el-radio :label="-99" v-if="!prop.currentItem.self">{{$t('注销')}}</el-radio> -->
				<el-radio :label="-5">{{$t('冻结')}}</el-radio>
				<el-radio :label="-99">{{$t('注销')}}</el-radio>
            </el-radio-group>
            <div class="tips" v-if="state.formData.status === -99">{{$t('注销：即前台和后台都不可以登录，注销之后，不可以恢复，请谨慎处理')}}</div>
            <div v-if="state.formData.status === -1" class="maintainBox">
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
import { ref, reactive, onMounted } from 'vue'
import { postEditSiteStatus } from '@/api/merchant_center'
import { ElMessage } from 'element-plus';
import commonStore from '@/store/common'
const commonData = commonStore()
const prop = defineProps(['currentItem'])
const emits = defineEmits(['close', 'refresh'])
const state = reactive({
    formData: {
        standBeginType: 0,
        standEndType: 0,
        status: ''
    }
})
const dialog = ref(null)

const confirmEdit = () => {
    const { status, content, standBeginType, standEndType, standBeginTime, standEndTime } = state.formData
    let params = {
        status,
        id: prop.currentItem.id
    }
    if (state.formData.status === -1) {
        if (!content) return ElMessage.warning($t('请输入维护公告'))
        params.content = content
        params.standBeginType = standBeginType
        params.standEndType = standEndType
        if (params.standBeginType === 1) {
            if (!standBeginTime) return ElMessage.warning($t('请选择维护开始时间'))
            params.standBeginTime = standBeginTime

        }
        if (params.standEndType === 1) {
            if (!standEndTime) return ElMessage.warning($t('请选择维护结束时间'))
            params.standEndTime = standEndTime
        }
    }
    dialog.value.showLoading()
    postEditSiteStatus(params).then(({ data, code }) => {
        if (code === 0) {
            emits('refresh')
            emits('close')
            commonData.getMerchantSiteData()
        }
    }).catch(() => {
        dialog.value.closeLoading()
    })
}
onMounted(() => {
    state.formData.status = prop.currentItem.status
})
</script>

<style lang="scss" scoped>
.tips {
    margin-top: 10px;
    color: red;
    font-size: 14px;
}
</style>