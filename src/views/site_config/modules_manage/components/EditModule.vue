<template>
    <!-- 模块管理-编辑 -->
    <Dialog ref="dialog" width="600" :title="$t('编辑')" top="8vh" @confirm="handleSubmit(deployForm)" @cancel="cancel">
        <el-form ref="deployForm" :rules="state.rules" :model="state.formData" label-width="auto">
            <el-form-item :label="$t('模块名称:')">
                <div>{{state.menuList.find(item => item.value === state.formData.newAlias)?.label || ''}}</div>
            </el-form-item>
            <el-form-item :label="$t('功能选择：')" v-if="isCanSelect && userData.getTemplateType() !== 5">
                <el-select v-model="state.formData.newAlias" @change="typeChange">
                    <el-option v-for="item in showData" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <!-- <el-form-item :label="$t('模块排序:')" prop="sort">
                <el-input-number style="width:100%" v-model="state.formData.sort" :controls="false" :precision="0" :min="1"
                    :max="10" :placeholder="$t('请输入排序值')" />
            </el-form-item> -->
            <el-form-item :label="isCustomize ? $t('图标:') : $t('图标-激活:')" prop="icon">
                <UploadImage v-model="state.formData.icon" :width="iconSizeLimit.width" :height="iconSizeLimit.height" :size="iconSizeLimit.size"
                    params="icon"
                    :tip="`${$t('请上传')}${iconSizeLimit.width}*${iconSizeLimit.height}${$t('或等比例，PNG/JPG/GIF格式小于')}${iconSizeLimit.size}${$t('KB的图片')}`" />
            </el-form-item>
            <el-form-item :label="$t('图标-未激活:')" prop="noIcon" v-if="(!isCustomize && (userData.getTemplateType() === 5 && itemData.alias !== 'agent')) || [1,2].includes(userData.getTemplateType())">
                <UploadImage v-model="state.formData.noIcon" :width="iconSizeLimit.width" :height="iconSizeLimit.height" :size="iconSizeLimit.size"
                    params="noIcon"
                    :tip="`${$t('请上传')}${iconSizeLimit.width}*${iconSizeLimit.height}${$t('或等比例，PNG/JPG/GIF格式小于')}${iconSizeLimit.size}${$t('KB的图片')}`" />
            </el-form-item>
            <el-form-item :label="$t('模块开关:')" v-if="!['index','me'].includes(state.formData.alias) && !isCustomize && userData.getTemplateType() !== 5">
                <el-switch v-model="state.formData.status" :active-value="1" :inactive-value="0" :active-text="$t('开启')" :inactive-text="$t('关闭')" />
            </el-form-item>
            <el-form-item :label="$t('小红点开关:')" v-if="!isCustomize && userData.getTemplateType() !== 5">
                <el-switch v-model="state.formData.badge" :active-value="1" :inactive-value="0" :active-text="$t('开启')" :inactive-text="$t('关闭')" />
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import userStore from '@/store/user'
import { postHomeDeploy } from '@/api/website'
import { getCommonMeta } from '@/api/common'

const emits = defineEmits(['close', 'fetchData'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    },
    currentList: {
        type: Array,
        default: () => {
            return []
        }
    },
    allMenus: {
        type: Object,
        default: () => {
            return {}
        }
    }
})
const width = 66
const height = 66
const size = 30
const state = reactive({
    formData: {},
    rules: {
        // name: [{ required: true, message: $t('请输入模块名称！'), trigger: 'blur' }],
        sort: [{ required: true, message: $t('请输入排序值！'), trigger: 'blur' }],
        icon: [{ required: true, message: $t('请上传激活图标！'), trigger: 'change' }],
        noIcon: [{ required: true, message: $t('请上传未激活图标！'), trigger: 'change' }],
    },
    menuList: [],
})
const userData = userStore()
const dialog = ref(null)
const deployForm = ref(null)

const isCustomize = computed(() => {
    return userData.getTemplateType() === 4
})
const isCanSelect = computed(() => {
    return !['index', 'me'].includes(state.formData.alias) && !isCustomize.value
})
const showData = computed(() => {
    return state.menuList.filter(item => item.value !== 'rebate' && item.value !=='rewardCenter' && (item.value === props.itemData.alias || props.currentList.every(its => its.alias !== item.value)))
})
const iconSizeLimit = computed(() => {
    return isCustomize.value ? { width: 128, height: 128, size: 100 } : { width: 66, height: 66, size: 30 }
})

onMounted(() => {
    state.formData = { ...props.itemData }
    state.formData.newAlias = props.itemData.alias
    getMenuList()
})

const getMenuList = () => {
    dialog.value.showLoading()
    getCommonMeta({ types: 'menus' }).then(res => {
        if (res.status === 'OK') {
            state.menuList = res.data.menus || []
        }
        dialog.value.closeLoading()
    }).catch(() => {
        dialog.value.closeLoading()
    })
}

const typeChange = () => {
    let item =props.allMenus[state.formData.newAlias]
    if (item) {
        state.formData.icon = item.icon
        state.formData.noIcon = item.noIcon
    }
}

const handleSubmit = (el) => {
    // state.formData.sort = props.itemData.sort
    el.validate((valid, fields) => {
        if (valid) {
            if (isCustomize.value) {
                state.formData.noIcon = state.formData.icon
                state.formData.status = 1
                state.formData.badge = 0
            }
            state.formData.part = 'menus'
            dialog.value.showLoading()
            postHomeDeploy(state.formData).then(() => {
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

</script>

<style lang="scss">
</style>
