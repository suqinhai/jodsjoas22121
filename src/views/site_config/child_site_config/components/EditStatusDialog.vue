<template>
    <!-- 站点配置-子站点配置-修改状态 -->
    <Dialog :title="$t('修改状态')" ref="dialog" @confirm="confirmEdit" @cancel="emits('close')">
        <el-form :model="state.formData" :label-width="$locale == 'zh' ? '100px' : 'auto'">
            <el-radio-group v-model="state.formData.status">
                <el-radio :value="1" :label="1">{{$t('正常')}}</el-radio>
                <el-radio :value="-1" :label="-1">{{$t('维护')}}</el-radio>
                <!--         <el-radio :value="-5" :label="-5" v-if="!prop.currentItem.self">{{$t('冻结')}}</el-radio>
                <el-radio :value="-99" :label="-99" v-if="!prop.currentItem.self">{{$t('注销')}}</el-radio> -->
                <el-radio :value="-5" :label="-5">{{$t('冻结')}}</el-radio>
             <!--   <el-radio v-if="userData.userInfo.groupId === commonData.currentMerchantSite.id" :value="-99" :label="-99">{{$t('注销')}}</el-radio> -->
            </el-radio-group>
            <div class="tips" v-if="state.formData.status === -99">{{$t('注销：即前台和后台都不可以登录，注销之后，不可以恢复，请谨慎处理')}}</div>
            <div v-if="state.formData.status === -1" class="maintainBox">
                <el-form-item :label="$t('*维护公告：')">
                    <el-input v-model="state.formData.content" type="textarea" show-word-limit maxlength="1000"></el-input>
                </el-form-item>
                <el-form-item :label="$t('*维护开始：')">
                    <el-radio-group v-model="state.formData.standBeginType" class="ml-4">
                        <el-radio :value="0" :label="0">{{$t('立即开始')}}</el-radio>
                        <el-radio :value="1" :label="1">
                            <span style="margin-right:10px;">{{$t('定时开始')}}</span>
                            <el-date-picker :disabled="state.formData.standBeginType === 0" v-model="state.formData.standBeginTime" type="datetime"
                                :placeholder="$t('开始时间')" value-format="x" />
                        </el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item :label="$t('*维护结束：')">
                    <el-radio-group v-model="state.formData.standEndType" class="ml-4">
                        <el-radio :value="0" :label="0">{{$t('手动结束')}}</el-radio>
                        <el-radio :value="1" :label="1">
                            <span style="margin-right:10px;">{{$t('定时结束')}}</span>
                            <el-date-picker :disabled="state.formData.standEndType === 0" v-model="state.formData.standEndTime" type="datetime"
                                :placeholder="$t('开始时间')" value-format="x" />
                        </el-radio>
                    </el-radio-group>
                </el-form-item>
            </div>
            <el-form-item class="mt20" :label="$t('站点名称：')">
                <el-input v-model.trim="state.siteName" maxlength="20"></el-input>
            </el-form-item>
            <el-form-item class="mt20" :label="$t('经销商模式：')">
                    <el-checkbox  
                        v-model="state.dealerModeOnOff" 
                        name="type">
                         {{$t('已开启')}}
                    </el-checkbox>
            </el-form-item>
            <div class="tips">{{$t('说明：若关闭后前端不显示经销商入口，之前的数据不受影响。')}}</div>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import userStore from '@/store/user'
import commonStore from '@/store/common'
import { postEditSiteStatus, postSiteName } from '@/api/website'
import { truncate } from 'lodash'

const emits = defineEmits(['close', 'fetchData'])
const prop = defineProps(['itemData'])
const state = reactive({
    formData: {
        standBeginType: 0,
        standEndType: 0,
        status: ''
    },
    siteName: prop.itemData.name,
    dealerModeOnOff: prop.itemData.dealerMode ? true : false
})
const dialog = ref(null)
const userData = userStore()
const commonData = commonStore()

onMounted(() => {
    state.formData.status = prop.itemData.status
})

const confirmEdit = async() => {
    const { status, content, standBeginType, standEndType, standBeginTime, standEndTime } = state.formData
    let params = {
        status,
        id: prop.itemData.id
    }
    if (status === -5 && prop.itemData.id === commonData.currentMerchantSite.id) return ElMessage.warning($t('自己无法操作冻结自己，请切换站点后再进行操作！'))
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
    await saveSiteName()
    params.dealerModeOnOff = state.dealerModeOnOff ? 1 : 0;
    dialog.value.showLoading()
    postEditSiteStatus(params).then(({ code }) => {
        if (code === 0) {
            commonData.getMerchantSiteData()
            emits('close')
            emits('fetchData')
        }
    }).catch(() => {
        dialog.value.closeLoading()
    })
}
const saveSiteName = () => {
    if (state.siteName === prop.itemData.name ) {
        return
    }
    if (!state.siteName) {
        ElMessage.warning($t('站点名称不能为空'))
        return Promise.reject(new Error($t('站点名称不能为空')))
    }
    let data = {
        id: prop.itemData.id,
        newName: state.siteName
    }
    dialog.value.showLoading()
    return postSiteName(data).then(({ code }) => {
        dialog.value.closeLoading()
    }).catch((err) => {
        dialog.value.closeLoading()
        throw new Error(err)
    })
}
</script>

<style lang="scss" scoped>
.tips {
    margin-top: 10px;
    color: #f94d64;
    font-size: 14px;
}
</style>