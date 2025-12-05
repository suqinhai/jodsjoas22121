<template>
    <!-- 商户信息-商户额度-修改状态 -->
    <Dialog width="700" :title="$t('修改状态')" top="10vh" :operateActions="[$t('取消'), $t('确认')]" @confirm="confirmEdit" @cancel="cancel">
        <el-form :model="form" :label-width="$locale == 'zh' ? '85px' : 'auto'">
            <el-form-item :label="$t('状态：')">
                <el-radio-group v-model="form.status" class="ml-4">
                    <el-radio :label="1">{{$t('正常')}}</el-radio>
                    <el-radio :label="-1">{{$t('维护')}}</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item v-if="form.status === -1" :label="$t('维护公告：')">
                <el-input type="textarea" v-model="form.detail" rows="4" maxlength="1000" show-word-limit />
            </el-form-item>
        </el-form>
        <el-form-item v-if="form.status === -1" :label="$t('维护开始：')" :label-width="$locale == 'zh' ? '120px' : 'auto'">
            <div class="start">
                <el-radio-group v-model="form.startStatus" class="ml-4">
                    <el-radio :label="0">{{$t('立即开始')}}</el-radio>
                    <el-radio :label="1">
                        <span style="margin-right:10px;">{{$t('定时开始')}}</span>
                        <el-date-picker :disabled="form.startStatus === 0" v-model="form.startTime" type="datetime" :placeholder="$t('开始时间')"
                            value-format="x" />
                    </el-radio>
                </el-radio-group>
            </div>
        </el-form-item>
        <el-form-item v-if="form.status === -1" :label="$t('维护结束：')" :label-width="$locale == 'zh' ? '120px' : 'auto'">
            <div class="end">
                <el-radio-group v-model="form.endStatus" class="ml-4">
                    <el-radio :label="0">{{$t('手动结束')}}</el-radio>
                    <el-radio :label="1">
                        <span style="margin-right:10px;">{{$t('定时结束')}}</span>
                        <el-date-picker :disabled="form.endStatus === 0" v-model="form.endTime" type="datetime" :placeholder="$t('结束时间')"
                            value-format="x" />
                    </el-radio>
                </el-radio-group>
            </div>
        </el-form-item>
    </Dialog>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { getSiteStatus, editSiteStatus } from '@/api/merchant_center'

const props = defineProps(['item'])
const emits = defineEmits(['close', 'refresh'])
const form = reactive({
    status: '',
    detail: '',
    startStatus: '',
    endStatus: '',
    startTime: '',
    endTime: ''
})

const confirmEdit = () => {
    const { status, detail, startStatus, endStatus, startTime, endTime } = form
    editSiteStatus({
        status,
        content: detail,
        standBeginType: startStatus,
        standBeginTime: startTime,
        standEndType: endStatus,
        standEndTime: endTime
    }).then(res => {
        if (res.code === 0) {
            emits('close')
            emits('refresh')
        }
    })
}

const cancel = () => {
    emits('close')
}

const getDetail = () => {
    getSiteStatus().then(res => {
        if (res.code === 0) {
            const { content, status, standBeginTime, standEndTime, standBeginType, standEndType } = res.data
            form.status = status
            form.detail = content
            form.startTime = standBeginTime
            form.endTime = standEndTime
            form.startStatus = standBeginType
            form.endStatus = standEndType
        }
    })
}

onMounted(() => {
    getDetail()
})
</script>

<style lang='scss'>
</style>