<template>
    <!-- 子游戏列表-修改 -->
    <Dialog :title="$t('修改')" ref="dialog" @confirm="confirmEdit" @cancel="emit('close')" width="600">
        <div class="tips" v-if="isCopyGame">Tips:{{$t('请在PG中修改图标')}}</div>
        <el-form :model="formData" :label-width="$locale == 'zh' ? '120px' : 'auto'">
            <el-form-item :label="$t('排序:')">
                <el-input-number v-model="formData.sort" :controls="false" :precision="0" :min="1" />
            </el-form-item>
            <el-form-item :label="$t('热门开关:')">
                <el-switch v-model="formData.hot" :active-value="1" :inactive-value="0">
                </el-switch>
            </el-form-item>
            <el-form-item :label="$t('维护开关:')">
                <el-switch v-model="formData.maintain" :active-value="1" :inactive-value="0">
                </el-switch>
            </el-form-item>
            <el-form-item :label="$t('显示开关:')">
                <el-switch v-model="formData.status" :active-value="1" :inactive-value="0">
                </el-switch>
            </el-form-item>
            <el-form-item :label="$t('图标(欧美):')" v-if="!isCopyGame && (userData.getTemplateType() === 1 || userData.getTemplateType() === 5)">
                <UploadImage v-model="formData.VImage" bizType="game" :gameParams="getGameParams" :width="LIMIT_US.VENDOR_IMG_WIDTH"
                    :height="LIMIT_US.VENDOR_IMG_HEIGHT" :size="100"
                    :tip="`${$t('请上传')}${LIMIT_US.VENDOR_IMG_WIDTH}*${LIMIT_US.VENDOR_IMG_HEIGHT}${$t('或等比例，PNG/JPG格式小于100KB的图片')}`"></UploadImage>
            </el-form-item>
            <el-form-item :label="$t('图标(亚太):')" v-if="!isCopyGame && userData.getTemplateType() === 2">
                <UploadImage v-model="formData.SImage" bizType="game" :gameParams="getGameParams" :width="LIMIT_AS.SUBGAME_WIDTH"
                    :height="LIMIT_AS.SUBGAME_HEIGHT" :size="100"
                    :tip="`${$t('请上传')}${LIMIT_AS.SUBGAME_WIDTH}*${LIMIT_AS.SUBGAME_HEIGHT}${$t('或等比例，PNG/JPG格式小于100KB的图片')}`"></UploadImage>
            </el-form-item>
            <el-form-item :label="$t('图标(定制版)') + ':'" v-if="!isCopyGame && userData.getTemplateType() === 4">
                <UploadImage v-model="formData.CImage" bizType="game" :gameParams="getGameParams" :width="170" :height="170" :size="100"
                    :tip="`${$t('请上传')}170*170${$t('或等比例，PNG/JPG格式小于100KB的图片')}`"></UploadImage>
            </el-form-item>
            <!--            <el-form-item :label="$t('遮罩图:')">
                <UploadImage :size="50" :width="180" :height="85" :tip="$t('请上传180*85或等比例，PNG/JPG/GIF格式小于50KB的图片')" v-model="formData.maskImage">
                </UploadImage>
            </el-form-item> -->
        </el-form>
    </Dialog>
</template>

<script setup>
import { onMounted, ref, computed } from "vue"
import { merchantGameEditApi } from "@/api/merchant_center.js"
import { deepClone } from "@/common/util"
import userStore from '@/store/user'
import { LIMIT_US, LIMIT_AS } from '@/common/util/appConfig.js'

const emit = defineEmits(["close", "refresh"])
const props = defineProps({
    currentItem: {
        type: Object,
        default: {},
    },
})
const formData = ref({})
const userData = userStore()

const isCopyGame = computed(() => {
    return props.currentItem.alias === 'PGC' || props.currentItem.alias === 'BPG'
})

onMounted(() => {
    formData.value = deepClone(props.currentItem)
})

const getGameParams = computed(() => {
    return {
        style: userData.getTemplateType() === 4 ? 3 : userData.getTemplateType() === 5 ? 1 : userData.getTemplateType(),
        vendor: formData.value.alias,
        gameType: formData.value.type,
        gameId: formData.value.gameId
    }
})

const confirmEdit = () => {
    const data = {
        id: formData.value.id,
        sort: formData.value.sort,
        hot: formData.value.hot,
        maintain: formData.value.maintain,
        status: formData.value.status,
        maskImage: formData.value.maskImage,
        alias: formData.value.alias,
    }
    const vImageChanged = formData.value.VImage !== props.currentItem.VImage
    const sImageChanged = formData.value.SImage !== props.currentItem.SImage
    const cImageChanged = formData.value.CImage !== props.currentItem.CImage
    if (vImageChanged || sImageChanged || cImageChanged) {
        data.images = [formData.value.VImage, formData.value.SImage, formData.value.CImage].join(',')
    }
    merchantGameEditApi(data).then((res) => {
        if (res.code == 0) {
            emit("close")
            emit("refresh")
        }
    })
}
</script>

<style lang="scss" scoped>
.tips {
    text-align: center;
    color: red;
    margin-bottom: 10px;
    font-weight: bold;
    font-size: 14px;
}
</style>
