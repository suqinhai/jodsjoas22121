<template>
    <!-- 宣传管理-新增/编辑/详情 -->
    <Dialog ref="dialog" width="700" :operateActions="state.operateActions" :isShowSubmit="state.formData.realStatus !== 1 || (state.formData.realStatus === 1 && state.updateImg) " :title="state.title + ''"
        top="10vh" @confirm="handleSubmit(deployForm)" @cancel="cancel">
        <!-- <el-form ref="deployForm" class="publicity-deploy" :disabled="state.formData.realStatus === 1" :rules="state.rules" :model="state.formData" -->
        <el-form ref="deployForm" class="publicity-deploy" :rules="state.rules" :model="state.formData"
            :label-width="$locale == 'zh' ? '90px' : 'auto'">
            <el-form-item :label="$t('宣传名称:')" prop="name">
                <el-input v-model="state.formData.name" :placeholder="$t('请输入宣传名称')" maxlength="60" show-word-limit :disabled="state.formData.realStatus === 1"/>
            </el-form-item>
            <el-form-item :label="$t('展示时间:')" prop="showTime">
                <div>
                    <el-date-picker v-model="state.formData.showTime" type="datetimerange" format="YYYY-MM-DD HH:mm:ss"
                        value-format="YYYY-MM-DD HH:mm:ss" :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')" :shortcuts="shortcuts"
                        :default-time="[ new Date(2000, 0, 0, 0, 0, 0), new Date(2000, 0, 0, 23, 59, 59) ]" :disabled="state.formData.realStatus === 1"/>
                </div>
            </el-form-item>
            <el-form-item :label="$t('宣传类型:')" prop="type">
                <el-select style="width: 240px" v-model="state.formData.type" :placeholder="$t('请选择宣传类型')" @change="changeType" :disabled="state.formData.realStatus === 1">
                    <el-option v-for="item in bannerType" :key="item.value" :label="item.label" :value="item.value*1" />
                </el-select>
            </el-form-item>
            <!-- <el-form-item :label="$t('宣传图片:')" prop="image" v-if="state.formData.type !== 1">
                <UploadImage :disabled="!state.formData.type || state.formData.realStatus === 1" v-model="state.formData.image" :width="state.limit.width" :height="state.limit.height"
                    :size="state.limit.size"
                    :tip="!state.formData.type ? $t('每种宣传类型的宣传图片尺寸不一样，请先选择宣传类型后再上传图片！') :`${$t('请上传')}${state.limit.width}*${state.limit.height}${$t('或等比例，PNG/JPG/GIF格式小于')}${state.limit.size}${$t('KB的图片')}`" />
            </el-form-item>
            <el-form-item :label="$t('宣传图片:')" prop="image" v-else>
                <UploadImage v-model="state.formData.image" :width="state.limit.width" :height="state.limit.height"
                    :size="state.limit.size"
                    :tip="!state.formData.type ? $t('每种宣传类型的宣传图片尺寸不一样，请先选择宣传类型后再上传图片！') :`${$t('请上传')}${state.limit.width}*${state.limit.height}${$t('或等比例，PNG/JPG/GIF格式小于')}${state.limit.size}${$t('KB的图片')}`" />
            </el-form-item> -->
            <el-form-item :label="$t('宣传图片:')" prop="image">
                <UploadImage :disabled="false" v-model="state.formData.image" :width="state.limit.width" :height="state.limit.height"
                    :size="state.limit.size"
                    :tip="!state.formData.type ? $t('每种宣传类型的宣传图片尺寸不一样，请先选择宣传类型后再上传图片！') :`${$t('请上传')}${state.limit.width}*${state.limit.height}${$t('或等比例，PNG/JPG/GIF格式小于')}${state.limit.size}${$t('KB的图片')}`" />
            </el-form-item>
            <el-form-item :label="$t('宣传简介:')">
                <el-input v-model="state.formData.remark" style="width: 100%" type="textarea" :rows="4" :placeholder="$t('请输入宣传简介')" :disabled="state.formData.realStatus === 1"/>
            </el-form-item>
            <el-form-item :label="$t('跳转类型:')" prop="redirect">
                <el-select v-model="state.formData.redirect" style="width: 200px" :placeholder="$t('请选择跳转类型')"
                    @change="state.formData.redirectUrl = ''" :disabled="state.formData.realStatus === 1">
                    <el-option v-for="item in showRedirectType" :key="item.value" :label="item.label" :value="Number(item.value)"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item v-if="state.formData.redirect === 2" :label="$t('跳转活动:')" prop="redirectUrl"
                :rules="[{ required: true, message: $t('请选择跳转活动！')}]">
                <el-select v-model="state.formData.redirectUrl" style="width: 200px" :placeholder="$t('请选择跳转活动')" :disabled="state.formData.realStatus === 1">
                    <el-option v-for="item in state.activityData" :disabled="item.isOver" :key="item.promotionId" :label="item.promotionName"
                        :value="item.promotionId" />
                </el-select>
            </el-form-item>
            <el-form-item v-if="state.formData.redirect === 1" :label="$t('外部链接:')" prop="redirectUrl"
                :rules="[{ required: true, message: $t('请输入外部链接！'), trigger: 'blur' }]">
                <el-input v-model="state.formData.redirectUrl" :placeholder="$t('请输入外部链接')" :disabled="state.formData.realStatus === 1"/>
            </el-form-item>
            <el-form-item :label="$t('排序:')" prop="sort">
                <el-input-number v-model="state.formData.sort" style="width: 200px" :controls="false" :precision="0" :min="1"
                    :placeholder="$t('请输入排序值')" :disabled="state.formData.realStatus === 1"/>
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import userStore from '@/store/user'
import { editPublicityConfig } from '@/api/data_center'
import { deepClone, getShortcuts } from '@/common/util'

const shortcuts = getShortcuts()
const emits = defineEmits(['close', 'fetchData'])
const props = defineProps({
    metaData: {
        type: Object,
        default: () => {
            return {}
        },
    },
    activityList: {
        type: Array,
        default: () => {
            return []
        },
    },
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    }
})
const state = reactive({
    updateImg: true,
    formData: {},
    title: $t('新增'),
    operateActions: [$t('取消'), $t('确定')],
    rules: {
        showTime: [{ required: true, message: $t('请设置展示时间！'), trigger: 'change' }],
        name: [{ required: true, message: $t('请输入宣传名称！'), trigger: 'blur' }],
        type: [{ required: true, message: $t('请选择宣传类型！'), trigger: 'change' }],
        image: [{ required: true, message: $t('请上传宣传图片！'), trigger: 'change' }],
        redirect: [{ required: true, message: $t('请选择跳转类型！'), trigger: 'change' }],
        sort: [{ required: true, message: $t('请输入排序值！'), trigger: 'blur' }],
    },
    limit: {
        width: 1020,
        height: 300,
        size: 2048
    },
    oldImage: [],
    activityData: [],
})
const dialog = ref(null)
const deployForm = ref(null)
const userData = userStore()

const showRedirectType = computed(() => {
// return [5].includes(state.formData.type) || (userData.getTemplateType() === 4 && state.formData.type === 4) ? props.metaData.redirectType : props.metaData.redirectType.filter(item => +item.value !== 8)
    const templateType = userData.getTemplateType()
    const shouldFilterCommonValues = templateType !== 4
    const isType5 = [5].includes(state.formData.type)
    if (shouldFilterCommonValues) {
        return props.metaData.redirectType.filter(item => ![9, 10, 11, 12].includes(+item.value))
    }
    return isType5 
        ? props.metaData.redirectType
        : props.metaData.redirectType.filter(item => +item.value !== 8)
})
const bannerType = computed(() => {
    if(userData.getTemplateType() === 4){
        return props.metaData.bannerType.filter(its => +its.value !== 6)
    }
    return props.metaData.bannerType

})
const isPPTemplate = computed(() => {
    return userData.getTemplateType() === 5 && state.formData.type === 1
})
onMounted(() => {
    state.activityData = deepClone(props.activityList)
    if (props.itemData.id) {
        state.title = $t('修改')
        state.formData = { ...props.itemData }
        state.oldImage = props.itemData.image.split(',')
        if (isPPTemplate.value) {
            state.formData.image = state.oldImage[1]
        } else {
            state.formData.image = state.oldImage[0]
        }
        let { realStatus, redirectUrl, type, redirect, beginTime, endTime } = state.formData
        if (realStatus === 1) {
            state.title = $t('详情')
            state.operateActions = [$t('关闭'), $t('确定')]
        }
        state.formData.showTime = [beginTime, endTime]
        if (type === 3) {
            state.limit = { width: 920, height: 720, size: 2048, }
        } else if (type === 4) {
            state.limit = { width: 220, height: 220, size: 1024, }
        } else if (type === 5) {
            state.limit = { width: 220, height: 220, size: 500, }
        } else if (type === 6) {
            state.limit = { width: 416, height: 256, size: 500, }
        } else {
            if (userData.getTemplateType() === 4) {
                state.limit = { width: 718, height: 308, size: 2048 }
            } else {
                state.limit = { width: 1020, height: 300, size: 2048 }
            }
        }

        if (redirect === 2) {
            let { promotionId, promotionName, promotionType, promotionUrl } = JSON.parse(redirectUrl)
            state.formData.redirectUrl = +promotionId
            if (state.activityData.every(item => item.promotionId !== +promotionId)) {
                state.activityData.unshift({
                    promotionId: +promotionId,
                    promotionName,
                    promotionUrl,
                    promotionType: +promotionType,
                    isOver: true
                })
            }
        }
    }
    if(isPPTemplate.value) {
        state.limit.width = 650
        state.limit.height = 285
        // state.limit.width = 1020
        // state.limit.height = 300
    }
})

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            let params = deepClone(state.formData)
            let { showTime, redirect, redirectUrl } = params
            params.beginTime = showTime[0]
            params.endTime = showTime[1]
            delete params.showTime
            if (!params.id) params.realStatus = 0
            if (redirect === 2) {
                let { promotionId, promotionName, promotionType, rules_, isOver, remark } = state.activityData.find(item => item.promotionId === redirectUrl)
                if (isOver) {
                    params.redirect = 0
                    params.redirectUrl = ''
                } else {
                    params.redirectUrl = JSON.stringify({
                        promotionId,
                        promotionName,
                        promotionType,
                        promotionUrl: promotionType === 9 && JSON.parse(rules_).type === 1 ? remark : ''
                    })
                }
            }
            if(state.formData.type === 1 && userData.getTemplateType() !== 4) {
                const imageArry = isPPTemplate.value 
                ? [state.oldImage[0], params.image]
                : [params.image, state.oldImage[1]];
                params.image = imageArry.join(',');
            }
            
            dialog.value.showLoading()
            editPublicityConfig(params).then(() => {
                cancel()
                emits('fetchData')
            }).catch(() => {
                dialog.value.closeLoading()
            })
        } else {
            ElMessage.warning($t('请完善表单内容再进行提交！'))
        }
    })
}

const cancel = () => {
    emits('close')
}

const changeType = (type) => {
    state.formData.image = ''
    if (type === 3) {
        state.limit = { width: 920, height: 720, size: 2048, }
        state.formData.redirect === 8 && (state.formData.redirect = '')
    } else if (type === 4) {
        state.limit = { width: 220, height: 220, size: 1024, }
    } else if (type === 5) {
        state.limit = { width: 220, height: 220, size: 500, }
    } else if (type === 6) {
            state.limit = { width: 416, height: 256, size: 500, }
    } else {
        if (userData.getTemplateType() === 4) {
            state.limit = { width: 718, height: 308, size: 2048 }
        } else {
            if(isPPTemplate.value) {
                state.limit = { width: 650, height: 285, size: 2048 }
                // state.limit = { width: 1020, height: 300, size: 2048 }
            } else {
                state.limit = { width: 1020, height: 300, size: 2048 }
            }
        }
        state.formData.redirect === 8 && (state.formData.redirect = '')
    }
}

</script>

<style lang="scss">
.publicity-deploy {
}
</style>
